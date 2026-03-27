function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = h + ":" + m;
}
updateClock();
setInterval(updateClock, 1000);

const tracks = [
  { title: "切开切开乖孩子", file: "切开切开2.mp3" },
  { title: "可怜之人必有可爱之处", file: "可怜.mp3" },
  { title: "在那栀子花还没有枯萎的时候", file: "+50cents.mp3" }
];

const STORAGE_KEY = "beiai_player_state_v3";

const miniPlayer = document.getElementById("miniPlayer");
const toggleMiniBtn = document.getElementById("toggleMiniBtn");
const playerTitle = document.getElementById("playerTitle");
const collapsedPlayPauseBtn = document.getElementById("collapsedPlayPauseBtn");
const collapsedSongName = document.getElementById("collapsedSongName");

const audioPlayer = document.getElementById("audioPlayer");
const playlist = document.getElementById("playlist");
const nowPlaying = document.getElementById("nowPlaying");
const prevBtn = document.getElementById("prevBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextBtn = document.getElementById("nextBtn");

const progressOuter = document.getElementById("progressOuter");
const progressInner = document.getElementById("progressInner");
const currentTimeText = document.getElementById("currentTime");
const totalTimeText = document.getElementById("totalTime");

let currentTrackIndex = 0;
let isMinimized = false;
let shouldResumeAfterLoad = false;
let savedCurrentTime = 0;
let restoringTime = false;

function formatTime(seconds) {
  if (!isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function savePlayerState() {
  if (!audioPlayer) return;
  const state = {
    currentTrackIndex,
    currentTime: audioPlayer.currentTime || 0,
    isPlaying: !audioPlayer.paused,
    isMinimized
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadPlayerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function renderPlaylist() {
  if (!playlist) return;
  playlist.innerHTML = "";
  tracks.forEach((track, index) => {
    const li = document.createElement("li");
    li.textContent = (index + 1) + ". " + track.title;
    if (index === currentTrackIndex) {
      li.classList.add("active");
    }
    li.addEventListener("click", () => {
      loadTrack(index, true, 0);
    });
    playlist.appendChild(li);
  });
}

function syncMiniState() {
  if (!miniPlayer || !toggleMiniBtn || !playerTitle) return;
  if (isMinimized) {
    miniPlayer.classList.add("minimized");
    toggleMiniBtn.textContent = "+";
    playerTitle.textContent = "mini_player.exe [最小化]";
  } else {
    miniPlayer.classList.remove("minimized");
    toggleMiniBtn.textContent = "_";
    playerTitle.textContent = "mini_player.exe";
  }
}

function updateProgressUI() {
  if (!audioPlayer || !progressInner || !currentTimeText || !totalTimeText) return;

  currentTimeText.textContent = formatTime(audioPlayer.currentTime);
  totalTimeText.textContent = formatTime(audioPlayer.duration);

  if (audioPlayer.duration) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressInner.style.width = percent + "%";
  } else {
    progressInner.style.width = "0%";
  }
}

function loadTrack(index, autoPlay = false, startTime = 0) {
  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];

  audioPlayer.src = track.file;
  nowPlaying.textContent = "当前歌曲：" + track.title;
  collapsedSongName.textContent = track.title;

  if (currentTimeText) currentTimeText.textContent = "00:00";
  if (totalTimeText) totalTimeText.textContent = "00:00";
  if (progressInner) progressInner.style.width = "0%";

  renderPlaylist();

  restoringTime = startTime > 0;

  const applyStartTime = () => {
    if (restoringTime && !Number.isNaN(startTime)) {
      audioPlayer.currentTime = startTime;
    }
    updateProgressUI();

    if (autoPlay) {
      audioPlayer.play().catch(() => {});
    }
  };

  if (audioPlayer.readyState >= 1) {
    applyStartTime();
  } else {
    audioPlayer.addEventListener("loadedmetadata", applyStartTime, { once: true });
  }

  savePlayerState();
}

if (toggleMiniBtn) {
  toggleMiniBtn.addEventListener("click", () => {
    isMinimized = !isMinimized;
    syncMiniState();
    savePlayerState();
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    loadTrack(currentTrackIndex - 1, true, 0);
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    loadTrack(currentTrackIndex + 1, true, 0);
  });
}

if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(() => {});
    } else {
      audioPlayer.pause();
    }
  });
}

if (collapsedPlayPauseBtn) {
  collapsedPlayPauseBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(() => {});
    } else {
      audioPlayer.pause();
    }
  });
}

if (progressOuter) {
  progressOuter.addEventListener("click", (e) => {
    const rect = progressOuter.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audioPlayer.duration) {
      audioPlayer.currentTime = percent * audioPlayer.duration;
      updateProgressUI();
      savePlayerState();
    }
  });
}

if (audioPlayer) {
  audioPlayer.addEventListener("play", () => {
    if (playPauseBtn) playPauseBtn.textContent = "暂停";
    if (collapsedPlayPauseBtn) collapsedPlayPauseBtn.textContent = "暂停";
    savePlayerState();
  });

  audioPlayer.addEventListener("pause", () => {
    if (playPauseBtn) playPauseBtn.textContent = "播放";
    if (collapsedPlayPauseBtn) collapsedPlayPauseBtn.textContent = "播放";
    savePlayerState();
  });

  audioPlayer.addEventListener("loadedmetadata", () => {
    updateProgressUI();

    if (restoringTime) {
      restoringTime = false;
    }

    if (shouldResumeAfterLoad) {
      audioPlayer.play().catch(() => {});
      shouldResumeAfterLoad = false;
    }
  });

  audioPlayer.addEventListener("timeupdate", () => {
    updateProgressUI();
    savePlayerState();
  });

  audioPlayer.addEventListener("ended", () => {
    loadTrack(currentTrackIndex + 1, true, 0);
  });
}

window.addEventListener("beforeunload", savePlayerState);
window.addEventListener("pagehide", savePlayerState);

const savedState = loadPlayerState();

if (savedState) {
  currentTrackIndex = typeof savedState.currentTrackIndex === "number" ? savedState.currentTrackIndex : 0;
  isMinimized = !!savedState.isMinimized;
  shouldResumeAfterLoad = !!savedState.isPlaying;
  savedCurrentTime = typeof savedState.currentTime === "number" ? savedState.currentTime : 0;
} else {
  currentTrackIndex = 0;
  isMinimized = false;
  shouldResumeAfterLoad = false;
  savedCurrentTime = 0;
}

syncMiniState();
loadTrack(currentTrackIndex, false, savedCurrentTime);