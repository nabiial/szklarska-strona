/*
 * GÓRNA 22A — DRONE VIDEO IN THE HERO
 *
 * To enable the background video:
 * 1. Upload an optimized MP4 (H.264) to Cloudflare R2 or another public media host.
 * 2. Paste its public HTTPS URL below into HERO_VIDEO_URL.
 * 3. Commit this file. No HTML changes are needed afterwards.
 *
 * The old hero photo is removed. A dark background stays visible until video playback starts.
 * The video is muted, loops, plays inline, and respects reduced-motion/data-saver settings.
 */
(function () {
  "use strict";

  var HERO_VIDEO_URL = "https://pub-f288736ea0904e60ac1a937066c46821.r2.dev/hero/gorna-22a-drone.mp4"; // Cloudflare R2 public object URL

  if (!HERO_VIDEO_URL || !/^https:\/\//i.test(HERO_VIDEO_URL)) return;

  var hero = document.querySelector(".framer-16pzmbf[data-framer-name='Property Cover']");
  if (!hero || hero.querySelector(".gorna-hero-video")) return;

  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = connection && connection.saveData === true;

  if (reducedMotion || saveData) return;

  var wrapper = hero.querySelector("[data-framer-background-image-wrapper]");
  if (!wrapper) return;

  // Never show the former hero photograph, including while the video is loading or if playback fails.
  var oldPhoto = wrapper.querySelector("img");
  if (oldPhoto) oldPhoto.remove();
  wrapper.style.backgroundImage = "none";
  wrapper.style.backgroundColor = "#101110";
  hero.style.backgroundColor = "#101110";

  var video = document.createElement("video");
  video.className = "gorna-hero-video";
  video.setAttribute("aria-hidden", "true");
  video.setAttribute("tabindex", "-1");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  video.disablePictureInPicture = true;
  video.src = HERO_VIDEO_URL;

  // Wait until the first decoded video frame is available before hiding the photo.
  // This avoids blending two different aerial views during the handoff.
  video.addEventListener("loadeddata", function () {
    hero.classList.add("gorna-hero-video-ready");
  });

  video.addEventListener("playing", function () {
    hero.classList.add("gorna-hero-video-ready");
    hero.classList.add("gorna-hero-video-playing");
  });

  video.addEventListener("error", function () {
    hero.classList.remove("gorna-hero-video-playing", "gorna-hero-video-ready");
    video.remove();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      video.pause();
      return;
    }
    if (!reducedMotion && !saveData) {
      var playback = video.play();
      if (playback && typeof playback.catch === "function") playback.catch(function () {});
    }
  });

  wrapper.insertBefore(video, wrapper.firstChild);
  var playback = video.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(function () {
      hero.classList.remove("gorna-hero-video-playing", "gorna-hero-video-ready");
    });
  }
})();
