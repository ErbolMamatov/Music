/* =========================
   БУРГЕР МЕНЮ
========================= */
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("show");
  document.getElementById("overlay").classList.toggle("show");
}

function closeMenu() {
  document.getElementById("sidebar").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) closeMenu();
});


/* =========================
   АУДИО ПЛЕЕР
========================= */
const audio = document.getElementById("audio-player");
const bottomPlayer = document.getElementById("bottomPlayer");

const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const trackTitle = document.getElementById("trackTitle");
const likeBtn = document.getElementById("likeBtn");


/* =========================
   СОСТОЯНИЕ
========================= */
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentTrack = null;
let viewMode = "all"; // all | favorites


/* =========================
   ОСНОВНАЯ ФУНКЦИЯ PLAY
========================= */
function playMusic(src) {
  if (currentTrack !== src) {
    audio.src = src;
    audio.play();
  } else {
    audio.paused ? audio.play() : audio.pause();
  }

  currentTrack = src;
  bottomPlayer.classList.add("show");

  updateTrackTitle(src);
  updateActiveCard(src);
  updateLikeState(src);
}


/* =========================
   UI ОБНОВЛЕНИЯ
========================= */
function updateTrackTitle(src) {
  trackTitle.textContent = src
    .split("/")
    .pop()
    .replace(/\.(mp3|m4a)$/i, "");
}

function updateActiveCard(src) {
  document.querySelectorAll(".music-card").forEach(card => {
    card.classList.toggle("active", card.dataset.src === src);
  });
}

function updateLikeState(src) {
  likeBtn.classList.toggle("active", favorites.includes(src));
}


/* =========================
   PLAY / PAUSE
========================= */
playPauseBtn.addEventListener("click", () => {
  audio.paused ? audio.play() : audio.pause();
});

audio.addEventListener("play", () => {
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

audio.addEventListener("pause", () => {
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});


/* =========================
   ПРОГРЕСС И ГРОМКОСТЬ
========================= */
audio.addEventListener("timeupdate", () => {
  progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

volumeBar.addEventListener("input", () => {
  audio.volume = volumeBar.value;
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}


/* =========================
   ⭐ ИЗБРАННОЕ
========================= */
likeBtn.addEventListener("click", () => {
  if (!currentTrack) return;

  if (favorites.includes(currentTrack)) {
    favorites = favorites.filter(f => f !== currentTrack);
  } else {
    favorites.push(currentTrack);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateLikeState(currentTrack);

  if (viewMode === "favorites") showFavorites();
});


/* =========================
   ФИЛЬТРЫ
========================= */
function showFavorites() {
  viewMode = "favorites";

  document.querySelectorAll(".music-card").forEach(card => {
    card.style.display = favorites.includes(card.dataset.src)
      ? "block"
      : "none";
  });
}

function showAllTracks() {
  viewMode = "all";

  document.querySelectorAll(".music-card").forEach(card => {
    card.style.display = "block";
  });
}


/* =========================
   ПОИСК
========================= */
document.getElementById("searchInput").addEventListener("input", function () {
  const q = this.value.toLowerCase();

  document.querySelectorAll(".music-card").forEach(card => {
    const title = card.querySelector("h4").textContent.toLowerCase();
    card.style.display = title.includes(q) ? "block" : "none";
  });
});


/* =========================
   АВТОМАТИЧЕСКОЕ ВОСПРОИЗВЕДЕНИЕ СЛЕДУЮЩЕГО ТРЕКА
========================= */
audio.addEventListener("ended", () => {
  setTimeout(() => {
    if (repeatMode === "one") {
      audio.currentTime = 0;
      audio.play();
    } else {
      playNextTrack();
    }
  }, 1500);
});


function playNextTrack() {
  const cards = [...document.querySelectorAll(".music-card")]
    .filter(card => card.style.display !== "none");

  if (!cards.length) return;

  const currentIndex = cards.findIndex(
    card => card.dataset.src === currentTrack
  );

  const nextIndex = (currentIndex + 1) % cards.length;
  const nextSrc = cards[nextIndex].dataset.src;

  playMusic(nextSrc);
}


let shuffleMode = false;   // 🔀
let repeatMode = "off";   // off | one | all

function getVisibleCards() {
  return [...document.querySelectorAll(".music-card")]
    .filter(card => card.style.display !== "none");
}

function playNextTrack() {
  const cards = getVisibleCards();
  if (!cards.length) return;

  let index = cards.findIndex(c => c.dataset.src === currentTrack);

  if (shuffleMode) {
    index = Math.floor(Math.random() * cards.length);
  } else {
    index++;
    if (index >= cards.length) {
      if (repeatMode === "all") index = 0;
      else return;
    }
  }

  playMusic(cards[index].dataset.src);
}

function playPrevTrack() {
  const cards = getVisibleCards();
  if (!cards.length) return;

  let index = cards.findIndex(c => c.dataset.src === currentTrack);

  index--;
  if (index < 0) index = cards.length - 1;

  playMusic(cards[index].dataset.src);
}

function toggleShuffle(btn) {
  shuffleMode = !shuffleMode;
  btn.classList.toggle("active", shuffleMode);
}


function toggleRepeat(btn) {
  if (repeatMode === "off") {
    repeatMode = "all";
    btn.innerHTML = "🔁";
  } else if (repeatMode === "all") {
    repeatMode = "one";
    btn.innerHTML = "🔂";
  } else {
    repeatMode = "off";
    btn.innerHTML = "↻";
  }
}



/* =========================
   КОНЕЦ
========================= */


