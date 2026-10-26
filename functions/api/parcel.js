const PARCEL_ID = "020604_1.0002.236/13";

function parseWkbHex(hex) {
  if (typeof hex !== "string" || !/^[0-9a-f]+$/i.test(hex) || hex.length < 18 || hex.length % 2 !== 0) {
    throw new Error("Invalid WKB geometry returned by ULDK.");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  const view = new DataView(bytes.buffer);
  let offset = 0;
  let srid = null;

  function ensure(size) {
    if (offset + size > bytes.length) throw new Error("Unexpected end of WKB geometry.");
  }
  function readU32(little) {
    ensure(4);
    const value = view.getUint32(offset, little);
    offset += 4;
    return value;
  }
  function readF64(little) {
    ensure(8);
    const value = view.getFloat64(offset, little);
    offset += 8;
    if (!Number.isFinite(value)) throw new Error("Invalid coordinate in WKB geometry.");
    return value;
  }

  function readGeometry() {
    ensure(5);
    const little = bytes[offset++] === 1;
    const rawType = readU32(little);
    const hasZ = (rawType & 0x80000000) !== 0;
    const hasM = (rawType & 0x40000000) !== 0;
    const hasSrid = (rawType & 0x20000000) !== 0;
    let type = rawType & 0x1fffffff;
    let z = hasZ;
    let m = hasM;

    if (type >= 3000 && type < 4000) { z = true; m = true; type -= 3000; }
    else if (type >= 2000 && type < 3000) { m = true; type -= 2000; }
    else if (type >= 1000 && type < 2000) { z = true; type -= 1000; }

    if (hasSrid) {
      const foundSrid = readU32(little);
      if (srid === null) srid = foundSrid;
    }

    const dimensions = 2 + (z ? 1 : 0) + (m ? 1 : 0);
    if (type === 3) {
      const ringCount = readU32(little);
      const rings = [];
      for (let r = 0; r < ringCount; r++) {
        const pointCount = readU32(little);
        const ring = [];
        for (let p = 0; p < pointCount; p++) {
          const x = readF64(little);
          const y = readF64(little);
          for (let d = 2; d < dimensions; d++) readF64(little);
          ring.push([x, y]);
        }
        rings.push(ring);
      }
      return rings;
    }
    if (type === 6 || type === 7) {
      const count = readU32(little);
      const polygons = [];
      for (let i = 0; i < count; i++) {
        const child = readGeometry();
        if (type === 6) polygons.push(child);
        else if (Array.isArray(child) && child.length && Array.isArray(child[0]) && typeof child[0][0] === "number") polygons.push(child);
        else if (Array.isArray(child)) polygons.push(...child);
      }
      return polygons;
    }
    throw new Error("Unsupported ULDK geometry type: " + type);
  }

  const rawGeometry = readGeometry();
  if (offset !== bytes.length) throw new Error("WKB geometry contains trailing bytes.");
  const polygons = Array.isArray(rawGeometry[0]) && typeof rawGeometry[0][0] === "number" ? [rawGeometry] : rawGeometry;
  if (!polygons.length) throw new Error("No polygon rings were returned by ULDK.");

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const point of ring) {
        minX = Math.min(minX, point[0]); minY = Math.min(minY, point[1]);
        maxX = Math.max(maxX, point[0]); maxY = Math.max(maxY, point[1]);
      }
    }
  }
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) throw new Error("Invalid parcel extent.");
  return { polygons, bbox: [minX, minY, maxX, maxY], srid: srid || 2180 };
}

export async function onRequestGet() {
  const upstreamUrl = "https://uldk.gugik.gov.pl/?request=GetParcelById&id=" +
    encodeURIComponent(PARCEL_ID) + "&result=geom_wkb";
  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { "Accept": "text/plain" },
      cf: { cacheTtl: 3600, cacheEverything: true }
    });
    if (!upstream.ok) {
      return Response.json({ error: "ULDK returned HTTP " + upstream.status }, { status: 502 });
    }
    const body = (await upstream.text()).trim();
    const lines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines[0] !== "0" || !lines[1]) {
      return Response.json({ error: "ULDK did not return geometry for parcel " + PARCEL_ID, detail: lines[0] || "Empty response" }, { status: 502 });
    }
    const geometry = parseWkbHex(lines[1]);
    return Response.json(
      { parcelId: PARCEL_ID, areaM2: 3592, ...geometry },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=21600" } }
    );
  } catch (error) {
    return Response.json({ error: "Could not retrieve cadastral parcel geometry.", detail: String(error) }, { status: 502 });
  }
}
