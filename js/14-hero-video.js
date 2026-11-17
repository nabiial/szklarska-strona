/*
 * GÓRNA 22A — DRONE VIDEO IN THE HERO
 *
 * The same-origin /media route uses the R2 binding. If it is not available,
 * retry the public R2 development URL. Keep the original hero image visible
 * until a video frame is actually playing.
 */
(function () {
  "use strict";

  var HERO_VIDEO_URL = "/media/hero/gorna-22a-drone.mp4?v=20261117-hero-fix";
  var HERO_VIDEO_FALLBACK_URL = "https://pub-f288736ea0904e60ac1a937066c46821.r2.dev/hero/gorna-22a-drone.mp4?v=20261117-hero-fix";

  if (!HERO_VIDEO_URL) return;

  var hero = document.querySelector(".framer-16pzmbf[data-framer-name='Property Cover']");
  if (!hero || hero.querySelector(".gorna-hero-video")) return;

  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = connection && connection.saveData === true;

  // Leave the original cover image visible when motion is disabled.
  if (reducedMotion || saveData) return;

  var wrapper = hero.querySelector("[data-framer-background-image-wrapper]");
  if (!wrapper) return;

  // Do not remove the original cover image: it is the fallback for failed video playback.
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

  var sources = [HERO_VIDEO_URL, HERO_VIDEO_FALLBACK_URL];
  var sourceIndex = 0;
  var finished = false;

  function restoreCoverImage() {
    if (finished) return;
    finished = true;
    hero.classList.remove("gorna-hero-video-playing", "gorna-hero-video-ready");
    hero.classList.add("gorna-hero-video-failed");
    video.remove();
  }

  function tryNextSource() {
    if (sourceIndex + 1 >= sources.length) {
      restoreCoverImage();
      return;
    }

    sourceIndex += 1;
    video.src = sources[sourceIndex];
    video.load();

    var retry = video.play();
    if (retry && typeof retry.catch === "function") {
      retry.catch(restoreCoverImage);
    }
  }

  video.addEventListener("playing", function () {
    hero.classList.remove("gorna-hero-video-failed");
    hero.classList.add("gorna-hero-video-ready", "gorna-hero-video-playing");
  });

  video.addEventListener("error", tryNextSource);

  document.addEventListener("visibilitychange", function () {
    if (finished) return;
    if (document.hidden) {
      video.pause();
      return;
    }
    var playback = video.play();
    if (playback && typeof playback.catch === "function") playback.catch(restoreCoverImage);
  });

  wrapper.insertBefore(video, wrapper.firstChild);
  video.src = sources[sourceIndex];
  video.load();

  var playback = video.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(restoreCoverImage);
  }
})();
