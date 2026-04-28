(() => {
  const MUSIC_KEY = "temps-music-state-v1";
  const musicPlaylist = [
    { title: "Emerald Canopy", src: "audio/1_emerald_canopy.flac" },
    { title: "Frostbound Echoes", src: "audio/2_frostbound_echoes.flac" },
    { title: "Verdant Labyrinth", src: "audio/3_verdant_labyrinth.flac" },
    { title: "Abyssal Dreams", src: "audio/4_abyssal_dreams.flac" },
    { title: "Crimson Decay", src: "audio/5_crimson_decay.flac" },
    { title: "Celestial Radiance", src: "audio/6_celestial_radiance.flac" },
    { title: "Stone Whispers", src: "audio/7_stone_whispers.flac" },
    { title: "Neon Spores", src: "audio/8_neon_spores.flac" },
    { title: "Infernal Heartbeat", src: "audio/9_infernal_heartbeat.flac" },
    { title: "Apex Confrontation", src: "audio/10_apex_confrontation.mp3" },
    { title: "Sands of Time", src: "audio/11_sands_of_time.mp3" }
  ];

  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  const status = document.getElementById("musicStatus"); // optional

  if (!audio) return;

  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(MUSIC_KEY)) || {};
    } catch {
      return {};
    }
  })();

  let trackIndex = Number.isInteger(saved.trackIndex) ? saved.trackIndex : 0;
  let musicEnabled = !!saved.enabled;
  let hasUserGesture = false;

  const clampIndex = (i) => ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;

  const setTrack = (i) => {
    trackIndex = clampIndex(i);
    audio.src = TRACKS[trackIndex];
    if (Number.isFinite(saved.time) && saved.time > 0) audio.currentTime = saved.time;
  };

  const saveState = () => {
    localStorage.setItem(
      MUSIC_KEY,
      JSON.stringify({
        enabled: musicEnabled,
        trackIndex,
        time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0
      })
    );
  };

  const updateUi = () => {
    if (!toggleBtn) return;
    toggleBtn.textContent = musicEnabled ? "🔊 Music: On" : "🔇 Music: Off";
    toggleBtn.setAttribute("aria-pressed", String(musicEnabled));
    if (status) {
      status.textContent = musicEnabled ? `Playing: ${trackIndex + 1}` : "Music off";
    }
  };

  const tryPlay = async () => {
    if (!musicEnabled || !hasUserGesture) return;
    try {
      await audio.play();
    } catch {}  // autoplay blocked until user gesture
  };

  const onFirstGesture = () => {
    if (!hasUserGesture) {
      hasUserGesture = true;
      if (musicEnabled) tryPlay();
    }
  };

  setTrack(trackIndex);
  updateUi();

  if (musicEnabled) {
    onFirstGesture();  // will start on first click due to browser rules
  }

  audio.addEventListener("ended", () => {
    setTrack(trackIndex + 1);
    saveState();
    tryPlay();
  });

  audio.addEventListener("timeupdate", saveState);

  if (toggleBtn) {  // optional if a control button exists
    toggleBtn.addEventListener("click", async () => {
      musicEnabled = !musicEnabled;
      hasUserGesture = true;
      if (musicEnabled) {
        await tryPlay();
      } else {
        audio.pause();
      }
      saveState();
      updateUi();
    });
  }

  document.addEventListener("pointerdown", onFirstGesture, { once: true, capture: true });  // resume on next page after interaction
  document.addEventListener("keydown", onFirstGesture, { once: true, capture: true });

  window.addEventListener("beforeunload", saveState);
})();
