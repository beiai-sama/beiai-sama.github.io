function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("clock").textContent = h + ":" + m;
}
updateClock();
setInterval(updateClock, 1000);

const tracks = [
  { title: "切开切开乖孩子", file: "切开切开2.mp3" },
  { title: "可怜之人必有可爱之处", file: "可怜.mp3" },
  { title: "在那栀子花还没有枯萎的时候", file: "+50cents.mp3" }
];

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

let currentTrackIndex = 0;
let isMinimized = false;

function renderPlaylist() {
  playlist.innerHTML = "";
  tracks.forEach((track, index) => {
    const li = document.createElement("li");
    li.textContent = (index + 1) + ". " + track.title;
    if (index === currentTrackIndex) {
      li.classList.add("active");
    }
    li.addEventListener("click", () => {
      loadTrack(index, true);
    });
    playlist.appendChild(li);
  });
}

function syncMiniState() {
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

function loadTrack(index, autoPlay = false) {
  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];
  audioPlayer.src = track.file;
  nowPlaying.textContent = "当前歌曲：" + track.title;
  collapsedSongName.textContent = track.title;
  renderPlaylist();

  if (autoPlay) {
    audioPlayer.play().catch(() => {});
  }
}

toggleMiniBtn.addEventListener("click", () => {
  isMinimized = !isMinimized;
  syncMiniState();
});

prevBtn.addEventListener("click", () => {
  loadTrack(currentTrackIndex - 1, true);
});

nextBtn.addEventListener("click", () => {
  loadTrack(currentTrackIndex + 1, true);
});

playPauseBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play().catch(() => {});
  } else {
    audioPlayer.pause();
  }
});

collapsedPlayPauseBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play().catch(() => {});
  } else {
    audioPlayer.pause();
  }
});

audioPlayer.addEventListener("play", () => {
  playPauseBtn.textContent = "暂停";
  collapsedPlayPauseBtn.textContent = "暂停";
});

audioPlayer.addEventListener("pause", () => {
  playPauseBtn.textContent = "播放";
  collapsedPlayPauseBtn.textContent = "播放";
});

audioPlayer.addEventListener("ended", () => {
  loadTrack(currentTrackIndex + 1, true);
});

loadTrack(0, false);
syncMiniState();