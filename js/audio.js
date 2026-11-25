// ============================================================================
// SHERU BHAI – ROYAL ENDLESS RUN | MP3 MUSIC PLAYER + WEB AUDIO SFX ENGINE
// ============================================================================

window.GAME_AUDIO = (() => {
  const MUSIC_TRACKS = [
    {
      id: 'track1',
      title: 'SHERU BHAI – Official Song',
      artist: 'DreamyAuraTunes',
      role: 'Artist',
      src: 'musics/SHERU%20BHAI%20-%20OFFICIAL%20SONG%20-%20DreamyAuraTunes.mp3'
    },
    {
      id: 'track2',
      title: 'Sheru Bhai Phonk DJ Avi Remix OFFICIAL',
      artist: 'Avi Remix',
      role: 'Artist/Producer',
      src: 'musics/Sheru%20Bhai%20Song%20%20Sheru%20Bhai%20Phonk%20%20Tadban%20Tadban%20Sheru%20Song%20%20Indian%20Phonk%20%20Viral%20Funk%20%20Trending%20-%20DJ%20Avi%20Remix%20OFFICIAL.mp3'
    },
    {
      id: 'track3',
      title: 'Tadban Tadban Sheru Bhai Ka Gana',
      artist: 'UP PHONK',
      role: 'Artist',
      src: encodeURI('musics/Sheru Bhai Song Phonk \uD83D\uDCA5  Tadban Tadban Sheru Bhai Ka Gana  Sheru Bhai Funk  Sheru Bhai Phonk 2026 - UP PHONK.mp3')
    }
  ];

  let ctx = null;
  let musicGain = null;
  let sfxGain = null;
  let musicInterval = null;
  let stepIndex = 0;

  let musicVol = 0.6;
  let sfxVol = 0.8;
  let selectedTrackMode = 'playlist'; // 'playlist' | 'track1' | 'track2' | 'track3'
  let currentTrackIndex = 0;
  let isMusicPlaying = false;
  let onTrackChangeCb = null;

  const bgAudio = new Audio();
  bgAudio.preload = 'auto';

  bgAudio.addEventListener('ended', () => {
    if (!isMusicPlaying) return;
    if (selectedTrackMode === 'playlist') {
      currentTrackIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
    }
    playCurrentMp3();
  });

  bgAudio.addEventListener('error', () => {
    // Fallback to procedural Web Audio theme if MP3 unavailable
    if (isMusicPlaying) {
      startSynthFallback('palace');
    }
  });

  const THEMES = {
    palace: { bpm: 112, notes: [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66], wave: 'triangle', bass: 130.81 },
    boss: { bpm: 152, notes: [185.0, 220.0, 246.94, 277.18, 329.63, 277.18, 246.94, 196.0], wave: 'sawtooth', bass: 92.5 }
  };

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      ctx = new AudioCtx();
      musicGain = ctx.createGain();
      sfxGain = ctx.createGain();
      musicGain.gain.value = musicVol * 0.25;
      sfxGain.gain.value = sfxVol * 0.5;
      musicGain.connect(ctx.destination);
      sfxGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return true;
  }

  function setVolumes(music, sfx) {
    musicVol = Math.max(0, Math.min(1, music));
    sfxVol = Math.max(0, Math.min(1, sfx));
    bgAudio.volume = musicVol;
    if (musicGain && ctx) musicGain.gain.setValueAtTime(musicVol * 0.25, ctx.currentTime);
    if (sfxGain && ctx) sfxGain.gain.setValueAtTime(sfxVol * 0.5, ctx.currentTime);
  }

  function setTrackMode(mode) {
    selectedTrackMode = mode || 'playlist';
    if (selectedTrackMode !== 'playlist') {
      const idx = MUSIC_TRACKS.findIndex(t => t.id === selectedTrackMode);
      if (idx >= 0) currentTrackIndex = idx;
    }
    if (isMusicPlaying) {
      playCurrentMp3();
    }
  }

  function getCurrentTrack() {
    return MUSIC_TRACKS[currentTrackIndex] || MUSIC_TRACKS[0];
  }

  function onTrackChange(cb) {
    onTrackChangeCb = cb;
  }

  function playCurrentMp3() {
    stopSynthFallback();
    const track = getCurrentTrack();
    if (!track) return;
    if (bgAudio.src !== new URL(track.src, window.location.href).href) {
      bgAudio.src = track.src;
    }
    bgAudio.currentTime = 0;
    bgAudio.volume = musicVol;
    bgAudio.play().catch(() => {});
    if (onTrackChangeCb) onTrackChangeCb(track);
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
    if (selectedTrackMode !== 'playlist') {
      selectedTrackMode = MUSIC_TRACKS[currentTrackIndex].id;
    }
    if (isMusicPlaying) {
      playCurrentMp3();
    } else if (onTrackChangeCb) {
      onTrackChangeCb(getCurrentTrack());
    }
    return getCurrentTrack();
  }

  function startMusic(themeKey = 'palace') {
    ensureContext();
    isMusicPlaying = true;
    if (selectedTrackMode === 'playlist') {
      // Rotate smoothly across the 3 official tracks (Boss favors high-energy Phonk remix!)
      if (themeKey === 'boss') {
        currentTrackIndex = 1;
      } else if (themeKey === 'city' || themeKey === 'future') {
        currentTrackIndex = 2;
      } else if (bgAudio.paused && !bgAudio.src) {
        currentTrackIndex = 0;
      }
    } else {
      const idx = MUSIC_TRACKS.findIndex(t => t.id === selectedTrackMode);
      currentTrackIndex = idx >= 0 ? idx : 0;
    }
    playCurrentMp3();
  }

  function stopMusic() {
    isMusicPlaying = false;
    bgAudio.pause();
    bgAudio.currentTime = 0;
    stopSynthFallback();
  }

  function pauseMusic() {
    bgAudio.pause();
  }

  function resumeMusic() {
    if (isMusicPlaying && bgAudio.paused) {
      bgAudio.volume = musicVol;
      bgAudio.play().catch(() => {});
    }
  }

  function startSynthFallback(themeKey = 'palace') {
    if (!ensureContext() || musicInterval) return;
    const t = THEMES[themeKey] || THEMES.palace;
    const stepMs = (60 / t.bpm / 2) * 1000;
    stepIndex = 0;
    musicInterval = setInterval(() => {
      if (musicVol <= 0.01 || !ctx || ctx.state !== 'running') return;
      const note = t.notes[stepIndex % t.notes.length];
      tone(note, 0.18, t.wave, 0.22, null, 'music');
      if (stepIndex % 2 === 0) tone(t.bass, 0.22, 'triangle', 0.28, null, 'music');
      stepIndex++;
    }, stepMs);
  }

  function stopSynthFallback() {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  }

  function tone(freq, dur, type = 'sine', vol = 0.4, slideTo = null, dest = 'sfx', delay = 0) {
    if (!ensureContext()) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g);
    g.connect(dest === 'music' ? musicGain : sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function playSfx(name) {
    if (sfxVol <= 0.01) return;
    switch (name) {
      case 'footstep':
        tone(110, 0.045, 'triangle', 0.14, 65);
        break;
      case 'jump':
        tone(240, 0.14, 'triangle', 0.45, 520);
        break;
      case 'doubleJump':
        tone(380, 0.12, 'sine', 0.45, 760);
        tone(520, 0.12, 'triangle', 0.25, 880, 'sfx', 0.04);
        break;
      case 'land':
        tone(140, 0.08, 'sine', 0.3, 60);
        break;
      case 'slide':
        tone(280, 0.16, 'sawtooth', 0.2, 110);
        break;
      case 'coin':
        tone(987.77, 0.08, 'sine', 0.35);
        tone(1318.51, 0.14, 'sine', 0.35, null, 'sfx', 0.06);
        break;
      case 'gem':
        tone(784, 0.09, 'triangle', 0.4);
        tone(1046.5, 0.09, 'triangle', 0.4, null, 'sfx', 0.06);
        tone(1567.98, 0.18, 'sine', 0.4, null, 'sfx', 0.12);
        break;
      case 'powerup':
        [330, 440, 554.37, 659.25, 880].forEach((f, i) => {
          tone(f, 0.14, 'triangle', 0.35, null, 'sfx', i * 0.05);
        });
        break;
      case 'hit':
        tone(170, 0.22, 'sawtooth', 0.55, 45);
        tone(110, 0.25, 'square', 0.35, 35, 'sfx', 0.02);
        break;
      case 'bossAppear':
        tone(110, 0.4, 'sawtooth', 0.5, 82);
        tone(146.83, 0.5, 'sawtooth', 0.45, 98, 'sfx', 0.2);
        break;
      case 'missionComplete':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          tone(f, 0.18, 'triangle', 0.4, null, 'sfx', i * 0.07);
        });
        break;
      case 'gameOver':
        [392, 349.23, 311.13, 261.63].forEach((f, i) => {
          tone(f, 0.22, 'sawtooth', 0.35, null, 'sfx', i * 0.14);
        });
        break;
      case 'victory':
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
          tone(f, 0.24, 'triangle', 0.45, null, 'sfx', i * 0.09);
        });
        break;
      case 'click':
        tone(620, 0.05, 'sine', 0.25, 480);
        break;
    }
  }

  return {
    MUSIC_TRACKS,
    ensureContext,
    setVolumes,
    setTrackMode,
    getCurrentTrack,
    onTrackChange,
    nextTrack,
    playSfx,
    startMusic,
    stopMusic,
    pauseMusic,
    resumeMusic
  };
})();
