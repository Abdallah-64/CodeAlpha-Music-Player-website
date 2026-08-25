// Music data used by the player.
const tracks = [
  {
    title: "Echoes of Tomorrow",
    artist: "Synthetic Waveform",
    duration: "4:15",
    cover:
      "https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&w=1000&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Neon Pulse",
    artist: "Cybernetic Horizon",
    duration: "3:35",
    cover:
      "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?auto=format&fit=crop&w=600&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Void Resonator",
    artist: "Deep Field Audio",
    duration: "4:20",
    cover:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=600&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

// All page elements needed by the player are collected here.
const ui = {
  audio: document.querySelector("#audio"),
  cover: document.querySelector("#cover"),
  title: document.querySelector("#player-heading"),
  artist: document.querySelector("#artist"),
  progress: document.querySelector("#progress"),
  currentTime: document.querySelector("#current-time"),
  duration: document.querySelector("#duration"),
  playButton: document.querySelector("#play-pause"),
  playIcon: document.querySelector("#play-icon"),
  previous: document.querySelector("#previous"),
  next: document.querySelector("#next"),
  volume: document.querySelector("#volume"),
  mute: document.querySelector("#mute"),
  playlist: document.querySelector("#playlist-items"),
  theme: document.querySelector(".theme-button"),
};

let currentTrack = 0;

// Store the selected volume so the slider and audio remain in sync.
let savedVolume = Number(ui.volume.value);

// Turn seconds into the familiar minutes:seconds format.
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
}

// Update the filled section of a range slider.
function paintRange(range, value) {
  range.style.setProperty("--fill", `${value}%`);
}

// Rebuild the playlist so the currently selected song stays highlighted.
function renderPlaylist() {
  ui.playlist.innerHTML = tracks
    .map(
      (track, index) => `
        <li>
          <button
            class="playlist-item ${index === currentTrack ? "active" : ""}"
            type="button"
            data-index="${index}"
          >
            <img src="${track.cover}" alt="" />
            <span>
              <strong>${track.title}</strong>
              <small>${track.artist}</small>
            </span>
            <time>${track.duration}</time>
          </button>
        </li>`,
    )
    .join("");
}

// Load a track by its index. The modulo math lets the list loop forever.
function loadTrack(index, shouldPlay = false) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  ui.title.textContent = track.title;
  ui.artist.textContent = track.artist;
  ui.cover.src = track.cover;
  ui.cover.alt = `Artwork for ${track.title}`;
  ui.duration.textContent = track.duration;
  ui.audio.src = track.audio;
  ui.progress.value = 0;
  paintRange(ui.progress, 0);
  ui.currentTime.textContent = "0:00";
  renderPlaylist();
  if (shouldPlay) {
    ui.audio.play().catch(() => updatePlayButton(false));
  }
}

function updatePlayButton(isPlaying) {
  ui.playIcon.textContent = isPlaying ? "❚❚" : "▶";
  ui.playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  ui.playButton.title = isPlaying ? "Pause" : "Play";
}

// Player buttons and audio events.
ui.playButton.addEventListener("click", () => {
  if (ui.audio.paused) ui.audio.play();
  else ui.audio.pause();
});

ui.previous.addEventListener("click", () =>
  loadTrack(currentTrack - 1, !ui.audio.paused),
);
ui.next.addEventListener("click", () =>
  loadTrack(currentTrack + 1, !ui.audio.paused),
);
ui.audio.addEventListener("play", () => updatePlayButton(true));
ui.audio.addEventListener("pause", () => updatePlayButton(false));
ui.audio.addEventListener("ended", () => loadTrack(currentTrack + 1, true));
ui.audio.addEventListener("loadedmetadata", () => {
  ui.duration.textContent = formatTime(ui.audio.duration);
});
ui.audio.addEventListener("timeupdate", () => {
  const percent = ui.audio.duration
    ? (ui.audio.currentTime / ui.audio.duration) * 100
    : 0;
  ui.progress.value = percent;
  paintRange(ui.progress, percent);
  ui.currentTime.textContent = formatTime(ui.audio.currentTime);
});
ui.progress.addEventListener("input", () => {
  if (ui.audio.duration)
    ui.audio.currentTime =
      (Number(ui.progress.value) / 100) * ui.audio.duration;
  paintRange(ui.progress, ui.progress.value);
});
// Volume controls.
ui.volume.addEventListener("input", () => {
  ui.audio.volume = ui.volume.value;
  ui.audio.muted = false;
  savedVolume = Number(ui.volume.value);
  ui.mute.textContent = savedVolume ? "🔊" : "🔇";
  paintRange(ui.volume, savedVolume * 100);
});
ui.mute.addEventListener("click", () => {
  ui.audio.muted = !ui.audio.muted;
  ui.mute.textContent = ui.audio.muted ? "🔇" : "🔊";
});
// Select and start a song when the user chooses one from the playlist.
ui.playlist.addEventListener("click", (event) => {
  const button = event.target.closest("[data-index]");
  if (button) loadTrack(Number(button.dataset.index), true);
});
// Save the user's preferred colour theme in the browser.
ui.theme.addEventListener("click", () => {
  const light = document.body.classList.toggle("light");
  ui.theme.setAttribute(
    "aria-label",
    light ? "Switch to dark theme" : "Switch to light theme",
  );
  localStorage.setItem("sonus-theme", light ? "light" : "dark");
});

// Set the initial state when the page opens.
if (localStorage.getItem("sonus-theme") === "light")
  document.body.classList.add("light");
document.querySelector("#year").textContent = new Date().getFullYear();
paintRange(ui.volume, savedVolume * 100);
loadTrack(0);
