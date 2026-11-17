const ALLOWED_MEDIA = new Set([
  "hero/gorna-22a-drone.mp4",
  "property/drone-departure.mp4",
  "property/drone-orbit.mp4",
  "property/roller-shutters.mp4",
  "location/google-earth-overview.mp4",
]);

const DEVELOPMENT_ORIGIN = "https://pub-f288736ea0904e60ac1a937066c46821.r2.dev";

function responseError(message, status, extraHeaders = {}) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function parseSingleRange(header, size) {
  if (!header) return null;

  // Browsers normally request one range at a time for HTML video.
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return { invalid: true };

  const startText = match[1];
  const endText = match[2];

  if (!startText && !endText) return { invalid: true };

  let offset;
  let length;

  if (!startText) {
    const suffixLength = Number(endText);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return { invalid: true };
    }
    length = Math.min(suffixLength, size);
    offset = size - length;
  } else {
    offset = Number(startText);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset >= size) {
      return { invalid: true };
    }

    const end = endText ? Number(endText) : size - 1;
    if (!Number.isSafeInteger(end) || end < offset) {
      return { invalid: true };
    }
    length = Math.min(end, size - 1) - offset + 1;
  }

  if (length <= 0) return { invalid: true };
  return { offset, length };
}

function setMediaHeaders(object, headers, contentLength) {
  if (typeof object.writeHttpMetadata === "function") {
    object.writeHttpMetadata(headers);
  }

  // Keep correct metadata even if an older upload did not save Content-Type.
  if (!headers.has("Content-Type") || headers.get("Content-Type") === "application/octet-stream") {
    headers.set("Content-Type", "video/mp4");
  }

  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(contentLength));
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  headers.set("X-Content-Type-Options", "nosniff");

  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  if (object.uploaded) headers.set("Last-Modified", object.uploaded.toUTCString());
}

export async function onRequest(context) {
  const request = context.request;
  const method = request.method.toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    return responseError("Method not allowed", 405, { Allow: "GET, HEAD" });
  }

  const url = new URL(request.url);
  const key = url.pathname.slice("/media/".length);

  if (!ALLOWED_MEDIA.has(key)) {
    return responseError("Media not found", 404);
  }

  const bucket = context.env.MEDIA_BUCKET;

  // Backward-compatible fallback until the R2 binding is connected in Pages.
  // Once MEDIA_BUCKET is configured, all video requests are served directly
  // from the bucket and do not use the public r2.dev development endpoint.
  if (!bucket) {
    const target = DEVELOPMENT_ORIGIN + "/" + key + url.search;
    return fetch(new Request(target, {
      method,
      headers: request.headers,
      redirect: "follow",
    }));
  }

  try {
    if (method === "HEAD") {
      const object = await bucket.head(key);
      if (!object) return responseError("Media not found", 404);

      const headers = new Headers();
      setMediaHeaders(object, headers, object.size);
      return new Response(null, { status: 200, headers });
    }

    const head = await bucket.head(key);
    if (!head) return responseError("Media not found", 404);

    const rangeHeader = request.headers.get("Range");
    const range = parseSingleRange(rangeHeader, head.size);

    if (range && range.invalid) {
      return responseError("Requested byte range is not satisfiable", 416, {
        "Content-Range": "bytes */" + head.size,
        "Accept-Ranges": "bytes",
      });
    }

    const object = range
      ? await bucket.get(key, { range: { offset: range.offset, length: range.length } })
      : await bucket.get(key);

    if (!object || !object.body) return responseError("Media not found", 404);

    const headers = new Headers();
    setMediaHeaders(object, headers, range ? range.length : object.size);

    if (range) {
      headers.set(
        "Content-Range",
        "bytes " + range.offset + "-" + (range.offset + range.length - 1) + "/" + object.size
      );
      return new Response(object.body, { status: 206, headers });
    }

    return new Response(object.body, { status: 200, headers });
  } catch (error) {
    return responseError("Unable to stream media", 502);
  }
}
