let currentPlayer = "html5"; // or 'youtube'
let youtubePlayer = null;
let isYouTubeReady = false;

// YouTube IFrame API callback
function onYouTubeIframeAPIReady() {
  isYouTubeReady = true;
}

// Extract YouTube video ID
function extractYouTubeID(url) {
  const regExp = /(?:youtube\.com.*v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regExp);
  return match && match[1];
}

// Check URL type
function isYouTubeURL(url) {
  return /youtube\.com|youtu\.be/.test(url);
}
function isVimeoURL(url) {
  return /vimeo\.com/.test(url);
}

// Load video into wrapper
function loadVideo() {
  const url = document.getElementById("videoUrl").value.trim();
  const wrapper = document.getElementById("videoWrapper");
  wrapper.innerHTML = "";

  if (isYouTubeURL(url)) {
    currentPlayer = "youtube";
    const videoId = extractYouTubeID(url);
    wrapper.innerHTML = `<div id="youtube"></div>`;

    if (isYouTubeReady) {
      youtubePlayer = new YT.Player("youtube", {
        height: "100%",
        width: "100%",
        videoId: videoId
      });
    } else {
      alert("YouTube API not loaded yet.");
    }
  } else if (url.endsWith(".mp4") || url.endsWith(".webm")) {
    currentPlayer = "html5";
    wrapper.innerHTML = `
      <video id="video" class="video" controls autoplay>
        <source src="${url}" />
      </video>
    `;
  } else {
    wrapper.innerHTML = `<p style="color:red;">Unsupported format. Use MP4 or YouTube links.</p>`;
  }
}

// 🎮 Shared controls for both players
function getActiveVideo() {
  return currentPlayer === "html5" ? document.getElementById("video") : youtubePlayer;
}

// Play/Pause
document.getElementById("playPause").addEventListener("click", () => {
  const video = getActiveVideo();
  if (!video) return;

  if (currentPlayer === "html5") {
    video.paused ? video.play() : video.pause();
  } else if (currentPlayer === "youtube") {
    const state = youtubePlayer.getPlayerState();
    if (state === 1) youtubePlayer.pauseVideo(); // playing
    else youtubePlayer.playVideo();
  }
});

// Skip
document.querySelectorAll("[data-skip]").forEach(btn => {
  btn.addEventListener("click", () => {
    const video = getActiveVideo();
    if (!video) return;
    const skip = parseFloat(btn.dataset.skip);

    if (currentPlayer === "html5") {
      video.currentTime += skip;
    } else if (currentPlayer === "youtube") {
      const current = youtubePlayer.getCurrentTime();
      youtubePlayer.seekTo(current + skip, true);
    }
  });
});

// Volume
document.getElementById("volumeSlider").addEventListener("input", (e) => {
  const volume = parseFloat(e.target.value);
  const video = getActiveVideo();
  if (!video) return;

  if (currentPlayer === "html5") {
    video.volume = volume;
  } else if (currentPlayer === "youtube") {
    youtubePlayer.setVolume(volume * 100);
  }
});

// Speed
document.getElementById("speedSlider").addEventListener("input", (e) => {
  const speed = parseFloat(e.target.value);
  const video = getActiveVideo();
  if (!video) return;

  if (currentPlayer === "html5") {
    video.playbackRate = speed;
  } else if (currentPlayer === "youtube") {
    youtubePlayer.setPlaybackRate(speed);
  }
});

// Fullscreen
document.getElementById("fullscreenBtn").addEventListener("click", () => {
  const wrapper = document.getElementById("videoWrapper");
  if (wrapper.requestFullscreen) wrapper.requestFullscreen();
  else if (wrapper.webkitRequestFullscreen) wrapper.webkitRequestFullscreen();
});

// Theme toggle
document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// Load video button
document.getElementById("loadVideo").addEventListener("click", loadVideo);

const previewBox = document.getElementById("previewBox");
const previewImg = document.getElementById("previewImg");

// Simulate thumbnails: Assume 10s interval preview thumbnails
const getThumbnailSrc = (timeInSec) => {
  const snap = Math.floor(timeInSec / 10) * 10;
  return `thumbnails/thumb_${snap}.jpg`; // Simulated folder
};

document.getElementById("videoWrapper").addEventListener("mousemove", (e) => {
  const video = document.getElementById("video");
  if (!video || currentPlayer !== "html5") return;

  const progress = e.currentTarget.getBoundingClientRect();
  const offsetX = e.clientX - progress.left;
  const percentage = offsetX / progress.width;
  const previewTime = percentage * video.duration;

  previewImg.src = getThumbnailSrc(previewTime);
  previewBox.style.left = `${offsetX}px`;
  previewBox.style.display = "block";
});

document.getElementById("videoWrapper").addEventListener("mouseleave", () => {
  previewBox.style.display = "none";
});

function savePlaybackTime() {
  const video = document.getElementById("video");
  if (video && currentPlayer === "html5") {
    localStorage.setItem("lastPlayedTime", video.currentTime);
  }
}

function restorePlaybackTime() {
  const video = document.getElementById("video");
  const savedTime = localStorage.getItem("lastPlayedTime");
  if (video && savedTime) {
    video.currentTime = parseFloat(savedTime);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) savePlaybackTime();
});

document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  if (video) {
    video.addEventListener("loadedmetadata", restorePlaybackTime);
  }
});
