// ============================================================================
// SHERU BHAI – ROYAL ENDLESS RUN | CORE GAME ENGINE & UI CONTROLLER
// ============================================================================

(() => {
  const DATA = window.GAME_DATA;
  const STORAGE = window.GAME_STORAGE;
  const AUDIO = window.GAME_AUDIO;
  const RENDERER = window.GAME_RENDERER;

  // Canvas & Context (alpha:false + desynchronized reduces mobile compositor overhead for 60fps)
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true }) || canvas.getContext('2d');
  const previewCanvas = document.getElementById('menuPreviewCanvas');
  const previewCtx = previewCanvas.getContext('2d');

  // Detect touch devices (mobiles & tablets) for 60fps scaling & on-screen buttons
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0);
  if (isTouchDevice) {
    document.body.classList.add('touch-controls-on');
  }

  // UI Elements
  const el = {
    loadingScreen: document.getElementById('loadingScreen'),
    loadingHeroImg: document.getElementById('loadingHeroImg'),
    loadingLogoImg: document.getElementById('loadingLogoImg'),
    loadingStatusText: document.getElementById('loadingStatusText'),
    loadingPercent: document.getElementById('loadingPercent'),
    loadingBarFill: document.getElementById('loadingBarFill'),
    loadingTipText: document.getElementById('loadingTipText'),
    btnSkipLoading: document.getElementById('btnSkipLoading'),
    mainMenu: document.getElementById('mainMenu'),
    gameplayHud: document.getElementById('gameplayHud'),
    pauseModal: document.getElementById('pauseModal'),
    gameOverModal: document.getElementById('gameOverModal'),
    missionsModal: document.getElementById('missionsModal'),
    shopModal: document.getElementById('shopModal'),
    worldsModal: document.getElementById('worldsModal'),
    achievementsModal: document.getElementById('achievementsModal'),
    settingsModal: document.getElementById('settingsModal'),
    controlsModal: document.getElementById('controlsModal'),
    toastContainer: document.getElementById('toastContainer'),

    // HUD
    hudScore: document.getElementById('hudScore'),
    hudMultiplier: document.getElementById('hudMultiplier'),
    hudDistance: document.getElementById('hudDistance'),
    hudWorldName: document.getElementById('hudWorldName'),
    hudDiffBadge: document.getElementById('hudDiffBadge'),
    hudCoins: document.getElementById('hudCoins'),
    hudGems: document.getElementById('hudGems'),
    hudMissionPill: document.getElementById('hudMissionPill'),
    hudMissionText: document.getElementById('hudMissionText'),
    hudTrackInfo: document.getElementById('hudTrackInfo'),
    btnNextTrackHud: document.getElementById('btnNextTrackHud'),
    runTutorialHint: document.getElementById('runTutorialHint'),
    btnMuteHud: document.getElementById('btnMuteHud'),
    activePowerups: document.getElementById('activePowerups'),
    bossHud: document.getElementById('bossHud'),
    bossName: document.getElementById('bossName'),
    bossStageLabel: document.getElementById('bossStageLabel'),
    bossHpFill: document.getElementById('bossHpFill'),
    btnSpecialMobile: document.getElementById('btnSpecialMobile'),
    btnJumpMobile: document.getElementById('btnJumpMobile'),
    btnSlideMobile: document.getElementById('btnSlideMobile'),

    // Menu
    menuCoins: document.getElementById('menuCoins'),
    menuGems: document.getElementById('menuGems'),
    menuCrowns: document.getElementById('menuCrowns'),
    menuBestScore: document.getElementById('menuBestScore'),
    menuCurrentWorld: document.getElementById('menuCurrentWorld'),
    menuSkinLabel: document.getElementById('menuSkinLabel'),
    menuMissionCount: document.getElementById('menuMissionCount'),
    menuWorldCount: document.getElementById('menuWorldCount'),
    menuAchCount: document.getElementById('menuAchCount'),

    // Game Over
    gameOverBadge: document.getElementById('gameOverBadge'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    newBestTag: document.getElementById('newBestTag'),
    goScore: document.getElementById('goScore'),
    goBest: document.getElementById('goBest'),
    goDistance: document.getElementById('goDistance'),
    goCoins: document.getElementById('goCoins'),
    goDodged: document.getElementById('goDodged'),
    goMissions: document.getElementById('goMissions'),
    goMissionResultBox: document.getElementById('goMissionResultBox'),
    goMissionStatus: document.getElementById('goMissionStatus'),
    goMissionTitle: document.getElementById('goMissionTitle'),
    goMissionProgress: document.getElementById('goMissionProgress'),
    btnRetryRun: document.getElementById('btnRetryRun'),
    btnMissionNext: document.getElementById('btnMissionNext'),

    // Settings
    musicVolume: document.getElementById('musicVolume'),
    sfxVolume: document.getElementById('sfxVolume'),
    musicTrackSelect: document.getElementById('musicTrackSelect'),
    toggleParticles: document.getElementById('toggleParticles'),
    toggleShake: document.getElementById('toggleShake'),
    resetConfirmBox: document.getElementById('resetConfirmBox')
  };

  // Game State
  let gameState = 'LOADING'; // LOADING | MENU | PLAYING | PAUSED | GAMEOVER
  let gameMode = 'mission'; // mission | endless
  let width = 1280;
  let height = 720;
  let groundY = 560;
  let lastTime = performance.now();
  let globalTime = 0;

  // Run State
  let run = null;
  let activeChapter = 1;

  function createInitialRun() {
    const save = STORAGE.getState();
    const diff = DATA.DIFFICULTIES[save.settings.difficulty] || DATA.DIFFICULTIES.normal;
    const world = DATA.WORLDS.find(w => w.id === save.selectedWorld) || DATA.WORLDS[0];

    return {
      diff,
      world,
      speed: diff.baseSpeed,
      scrollX: 0,
      distance: 0,
      score: 0,
      coins: 0,
      gems: 0,
      dodged: 0,
      elapsed: 0,
      noHitTime: 0,
      maxSpeedTime: 0,
      usedShield: false,
      sandstormTimer: world.hasSandstorm ? 8 : 0,
      sandstormActive: false,
      sandstormSurvived: false,
      spawnTimer: 1.1,
      coinSpawnTimer: 1.5,
      powerSpawnTimer: 9,
      footstepTimer: 0,
      shakeTimer: 0,
      specialCooldown: 0,
      bossIndex: 0,
      boss: null,
      obstacles: [],
      collectibles: [],
      particles: [],
      floatingTexts: [],
      activePowers: {},
      lineCollected: {},
      player: {
        x: Math.min(180, width * 0.16),
        y: groundY - 94,
        w: 56,
        h: 94,
        vy: 0,
        jumpsUsed: 0,
        isGrounded: true,
        slideTimer: 0,
        coyoteTimer: 0,
        jumpBuffer: 0,
        slideBuffer: 0,
        flipProgress: 0,
        anim: 'run',
        animTimer: 0,
        squashX: 1,
        squashY: 1,
        rotation: 0,
        invulnTimer: 0
      }
    };
  }

  // ==================== RESIZE & RESPONSIVE ====================
  let viewScale = 1;

  function resizeCanvas() {
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    // Cap DPR at 1 on touch mobiles/tablets for locked 60fps rasterization; 1.5 on desktop
    const maxDpr = isTouchDevice || cssW <= 1024 ? 1 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    viewScale = Math.max(0.54, Math.min(1.3, Math.min(cssW / 820, cssH / 560)));
    width = cssW / viewScale;
    height = cssH / viewScale;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr * viewScale, 0, 0, dpr * viewScale, 0, 0);
    groundY = Math.floor(height * 0.78);

    if (run && run.player) {
      run.player.x = Math.min(180, width * 0.16);
      if (run.player.isGrounded) {
        run.player.y = groundY - run.player.h;
      }
    }
  }
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 120));
  resizeCanvas();

  // ==================== TOASTS ====================
  function showToast(msg, isBoss = false) {
    const div = document.createElement('div');
    div.className = isBoss ? 'toast boss-toast' : 'toast';
    div.textContent = msg;
    el.toastContainer.appendChild(div);
    setTimeout(() => div.remove(), 3100);
  }

  // ==================== UI REFRESH ====================
  function refreshMenuUI() {
    const save = STORAGE.getState();
    const skin = DATA.SKINS.find(s => s.id === save.selectedSkin) || DATA.SKINS[0];
    const world = DATA.WORLDS.find(w => w.id === save.selectedWorld) || DATA.WORLDS[0];

    el.menuCoins.textContent = save.totalCoins.toLocaleString();
    el.menuGems.textContent = save.totalGems.toLocaleString();
    el.menuCrowns.textContent = save.totalCrowns.toLocaleString();
    el.menuBestScore.textContent = Math.floor(save.bestScore).toLocaleString();
    el.menuCurrentWorld.textContent = world.name;
    el.menuSkinLabel.textContent = skin.name;
    el.menuMissionCount.textContent = `${save.completedMissions.length}/${DATA.MISSIONS.length}`;
    el.menuWorldCount.textContent = `${save.unlockedWorlds.length}/${DATA.WORLDS.length}`;
    el.menuAchCount.textContent = `${save.achievements.length}/${DATA.ACHIEVEMENTS.length}`;

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === save.settings.difficulty);
    });
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === gameMode);
    });

    el.musicVolume.value = Math.round(save.settings.musicVolume * 100);
    el.sfxVolume.value = Math.round(save.settings.sfxVolume * 100);
    if (el.musicTrackSelect) {
      el.musicTrackSelect.value = save.settings.musicTrack || 'playlist';
      AUDIO.setTrackMode(el.musicTrackSelect.value);
    }
    el.toggleParticles.checked = save.settings.particles;
    el.toggleShake.checked = save.settings.screenShake;
    AUDIO.setVolumes(save.settings.musicVolume, save.settings.sfxVolume);
  }

  // ==================== GAME FLOW ====================
  function startGame() {
    AUDIO.ensureContext();
    AUDIO.playSfx('click');
    run = createInitialRun();
    gameState = 'PLAYING';

    el.mainMenu.classList.add('hidden');
    el.pauseModal.classList.add('hidden');
    el.gameOverModal.classList.add('hidden');
    el.gameplayHud.classList.remove('hidden');
    el.bossHud.classList.add('hidden');
    el.btnSpecialMobile.classList.remove('hidden');
    el.hudWorldName.textContent = run.world.name;
    el.hudDiffBadge.textContent = run.diff.label;
    const isDesktop = !isTouchDevice && window.innerWidth > 1024;
    el.runTutorialHint.classList.toggle('hidden', !isDesktop);
    resetHudCache();

    // Try to enter fullscreen & lock landscape on supported devices
    try {
      const root = document.documentElement;
      if (!document.fullscreenElement && root.requestFullscreen) {
        root.requestFullscreen().catch(() => {});
      }
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) { /* Not supported — game still works */ }

    AUDIO.startMusic(run.world.musicTheme);
  }

  function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    AUDIO.pauseMusic();
    el.pauseModal.classList.remove('hidden');
    AUDIO.playSfx('click');
  }

  function resumeGame() {
    if (gameState !== 'PAUSED') return;
    gameState = 'PLAYING';
    lastTime = performance.now();
    AUDIO.resumeMusic();
    el.pauseModal.classList.add('hidden');
    AUDIO.playSfx('click');
  }

  function returnToMainMenu() {
    gameState = 'MENU';
    AUDIO.stopMusic();
    el.gameplayHud.classList.add('hidden');
    el.pauseModal.classList.add('hidden');
    el.gameOverModal.classList.add('hidden');
    el.mainMenu.classList.remove('hidden');
    // Exit fullscreen when returning to menu
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch (e) { /* ignore */ }
    refreshMenuUI();
  }

  function endRun(isVictory = false, passedMission = null) {
    gameState = 'GAMEOVER';
    AUDIO.stopMusic();
    AUDIO.playSfx(isVictory || passedMission ? 'victory' : 'gameOver');

    const save = STORAGE.getState();
    const finalScore = Math.floor(run.score);
    const isNewBest = finalScore > save.bestScore;
    if (isNewBest) save.bestScore = finalScore;

    save.totalCoins += run.coins;
    save.totalGems += run.gems;
    save.stats.runs += 1;
    save.stats.bestRunScore = Math.max(save.stats.bestRunScore, finalScore);
    save.stats.bestRunCoins = Math.max(save.stats.bestRunCoins, run.coins);
    save.stats.bestRunAvoid = Math.max(save.stats.bestRunAvoid, run.dodged);
    save.stats.bestSurviveTime = Math.max(save.stats.bestSurviveTime, run.elapsed);
    save.stats.bestNoHitTime = Math.max(save.stats.bestNoHitTime, run.noHitTime);
    save.stats.bestMaxSpeedTime = Math.max(save.stats.bestMaxSpeedTime, run.maxSpeedTime);
    if (!run.usedShield && run.elapsed >= 60) {
      save.stats.noShieldRuns += 1;
    }

    let completedNow = passedMission;
    if (gameMode === 'mission' && !completedNow) {
      STORAGE.addActiveMissionDelta('runs', 1);
      STORAGE.syncActiveMissionRunState(run);
      completedNow = STORAGE.evaluateActiveMission();
    }

    STORAGE.save();
    checkAchievementsOnly();

    el.gameplayHud.classList.add('hidden');
    el.gameOverModal.classList.remove('hidden');
    el.newBestTag.classList.toggle('hidden', !isNewBest);

    el.goScore.textContent = finalScore.toLocaleString();
    el.goBest.textContent = Math.floor(save.bestScore).toLocaleString();
    el.goDistance.textContent = `${Math.floor(run.distance)}m`;
    el.goCoins.textContent = run.coins.toLocaleString();
    el.goDodged.textContent = run.dodged.toLocaleString();
    el.goMissions.textContent = `${save.completedMissions.length}/${DATA.MISSIONS.length}`;

    if (gameMode === 'endless') {
      el.gameOverBadge.textContent = isVictory ? 'ROYAL VICTORY' : 'ENDLESS RUN COMPLETE';
      el.gameOverTitle.textContent = isVictory ? 'KING OF THE KINGDOM!' : 'GAME OVER';
      el.goMissionResultBox.classList.add('hidden');
      el.btnMissionNext.classList.add('hidden');
      el.btnMissionNext.dataset.passed = '0';
      return;
    }

    el.goMissionResultBox.classList.remove('hidden');
    el.goMissionResultBox.classList.remove('passed');
    el.goMissionResultBox.classList.remove('failed');
    const activeMission = STORAGE.getCurrentMission();
    const target = STORAGE.getMissionTarget(activeMission);
    const passed = Boolean(completedNow) || save.completedMissions.includes(activeMission.id);
    const val = passed ? target : Math.min(target, STORAGE.getMissionCurrentValue(activeMission));

    el.goMissionResultBox.classList.add(passed ? 'passed' : 'failed');
    if (passed) {
      el.gameOverBadge.textContent = 'MISSION COMPLETE';
      el.gameOverTitle.textContent = 'MISSION SUCCESSFUL!';
      el.goMissionStatus.textContent = 'MISSION PASSED ✓';
      el.goMissionTitle.textContent = `#${activeMission.id} ${activeMission.title} — ${activeMission.desc}`;
      el.goMissionProgress.textContent = `Reward Earned: +${activeMission.rewardCoins}🪙 +${activeMission.rewardGems}◆`;
      el.btnMissionNext.classList.remove('hidden');
      el.btnMissionNext.dataset.passed = '1';
    } else {
      el.gameOverBadge.textContent = 'TRY AGAIN';
      el.gameOverTitle.textContent = 'MISSION FAILED';
      el.goMissionStatus.textContent = 'MISSION FAILED ✕';
      el.goMissionTitle.textContent = `#${activeMission.id} ${activeMission.title} — ${activeMission.desc}`;
      el.goMissionProgress.textContent = `Progress: ${val} / ${target} — Retry to complete this mission`;
      el.btnMissionNext.classList.add('hidden');
      el.btnMissionNext.dataset.passed = '0';
    }
  }

  function checkAchievementsOnly() {
    const newAchs = STORAGE.evaluateAchievements();
    newAchs.forEach(a => {
      AUDIO.playSfx('victory');
      showToast(`🏆 Trophy Unlocked: ${a.name} (+${a.rewardCrowns}♛)`);
    });
  }

  function checkMissionsAndAchievements() {
    if (gameMode === 'mission') {
      STORAGE.syncActiveMissionRunState(run);
      const completed = STORAGE.evaluateActiveMission();
      if (completed) {
        AUDIO.playSfx('missionComplete');
        showToast(`📜 Mission #${completed.id} Passed: ${completed.title}!`);
        if (gameState === 'PLAYING') {
          endRun(true, completed);
          return true;
        }
      }
    }
    checkAchievementsOnly();
    return false;
  }

  // ==================== PLAYER ACTIONS (WITH JUMP/SLIDE BUFFERING) ====================
  function executeJump(isDouble) {
    const p = run.player;
    const mult = run.activePowers.megaJump ? 1.28 : 1.0;
    p.vy = (isDouble ? -680 : -755) * mult;
    p.isGrounded = false;
    p.coyoteTimer = 0;
    p.jumpBuffer = 0;
    p.slideTimer = 0;
    p.slideBuffer = 0;
    p.jumpsUsed = isDouble ? 2 : 1;
    p.flipProgress = 0;
    p.rotation = 0;
    p.anim = isDouble ? 'doubleJump' : 'jump';
    p.squashX = 0.86;
    p.squashY = 1.16;
    AUDIO.playSfx(isDouble ? 'doubleJump' : 'jump');
    spawnParticles(p.x + p.w * 0.5, p.y + p.h, 7, '#faf4e8');
  }

  function triggerJump() {
    if (gameState !== 'PLAYING' || !run) return;
    const p = run.player;
    if (run.activePowers.flight) return;

    if (p.isGrounded || p.coyoteTimer > 0) {
      executeJump(false);
    } else if (p.jumpsUsed < 2) {
      executeJump(true);
    } else {
      // Queue jump slightly before landing so rapid jumps never drop!
      p.jumpBuffer = 0.14;
    }
  }

  function triggerSlide() {
    if (gameState !== 'PLAYING' || !run) return;
    const p = run.player;
    if (p.isGrounded) {
      if (p.slideTimer <= 0) AUDIO.playSfx('slide');
      p.slideTimer = 0.68;
      p.slideBuffer = 0;
      p.anim = 'slide';
      spawnParticles(p.x + 12, groundY, 5, '#d4af37');
    } else {
      // Crisp fast-fall slam + auto-slide on landing!
      p.vy = Math.max(p.vy, 980);
      p.slideBuffer = 0.18;
    }
  }

  function triggerSpecial() {
    if (gameState !== 'PLAYING' || !run) return;
    if (run.specialCooldown > 0) return;

    run.specialCooldown = 12;
    run.player.anim = 'bossAttack';
    run.player.animTimer = 0.45;
    AUDIO.playSfx('powerup');
    spawnParticles(run.player.x + 40, run.player.y + 40, 22, '#ffd700');

    // Clear nearby obstacles or damage active boss
    if (run.boss) {
      damageBoss(2);
      showToast('⚡ ROYAL ROAR STRIKE!');
    } else {
      let cleared = 0;
      run.obstacles = run.obstacles.filter(o => {
        if (o.kind !== 'moving_platform' && o.x < run.player.x + 360) {
          cleared++;
          spawnParticles(o.x + o.w / 2, o.y + o.h / 2, 10, '#ffd966');
          return false;
        }
        return true;
      });
      if (cleared > 0) {
        run.dodged += cleared;
        STORAGE.getState().stats.avoidObstacles += cleared;
        if (gameMode === 'mission') STORAGE.addActiveMissionDelta('avoid_obstacles', cleared);
      }
      showToast('⚡ ROYAL DASH!');
    }
  }

  // ==================== SPAWNING (SUBWAY SURFERS STYLE) ====================
  function isOverlappingAnyObstacle(x, y, w, h) {
    const pad = 22;
    return run.obstacles.some(o =>
      x < o.x + o.w + pad && x + w + pad > o.x && y < o.y + o.h + pad && y + h + pad > o.y
    );
  }

  function isOverlappingAnyCollectible(x, y, w, h) {
    const pad = 16;
    return run.collectibles.some(c =>
      x < c.x + c.w + pad && x + w + pad > c.x && y < c.y + c.h + pad && y + h + pad > c.y
    );
  }

  function spawnObstaclePattern() {
    // Fair trailing-edge horizontal gap across ALL 11 maps scaled by speed & difficulty
    const effSpeed = run.speed * (run.activePowers.speed ? 1.45 : run.activePowers.freeze ? 0.62 : 1.0);
    const minTimeGap = run.diff.id === 'easy' ? 1.15 : run.diff.id === 'hard' ? 0.78 : 0.92;
    const minGap = Math.max(run.diff.minPixelGap, effSpeed * minTimeGap);
    const obsX = width + 60;

    const lastObs = run.obstacles[run.obstacles.length - 1];
    if (lastObs) {
      const lastRight = lastObs.x + lastObs.w;
      if (obsX - lastRight < minGap) return;
    }

    let pool = run.world.obstacles;
    // On Easy, filter out fastest moving enemies early on for beginner fairness
    if (run.diff.id === 'easy' && run.elapsed < 25) {
      pool = pool.filter(k => !['running_bull', 'wild_boar', 'royal_guard'].includes(k));
      if (pool.length === 0) pool = run.world.obstacles;
    }

    const AIR_OBSTACLES = ['flying_drone', 'hanging_lantern', 'low_banner', 'flying_arrow', 'swinging_chain', 'flying_bird'];
    const MOVING_OBSTACLES = ['royal_guard', 'running_bull', 'rolling_barrel', 'moving_vehicle', 'wild_boar', 'moving_platform', 'flying_arrow'];
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const isAir = AIR_OBSTACLES.includes(kind);
    const isMoving = MOVING_OBSTACLES.includes(kind);

    let w = 48, h = 52, y = groundY - h;
    let vxExtra = 0;

    if (kind === 'water_puddle') { w = 82; h = 16; y = groundY - h; }
    else if (kind === 'spikes') { w = 60; h = 34; y = groundY - h; }
    else if (kind === 'fallen_tree' || kind === 'broken_cart') { w = 82; h = 44; y = groundY - h; }
    else if (kind === 'giant_rock' || kind === 'rolling_stone') { w = 54; h = 54; y = groundY - h; }
    else if (kind === 'laser_barrier') { w = 36; h = 76; y = groundY - h; }
    else if (kind === 'moving_vehicle') { w = 92; h = 58; y = groundY - h; }
    else if (isAir) {
      w = kind === 'flying_arrow' ? 62 : 56;
      h = kind === 'flying_arrow' ? 28 : 44;
      y = kind === 'flying_arrow' ? groundY - 96 : groundY - 108;
    }

    if (isMoving) {
      vxExtra = kind === 'moving_platform' ? 0 : (kind === 'flying_arrow' ? Math.max(95, run.diff.movingSpeedBonus) : run.diff.movingSpeedBonus);
      if (kind === 'moving_platform') {
        w = 108; h = 20; y = groundY - 72;
      }
      // Prevent faster moving obstacle from catching up to previous obstacle before reaching player
      if (lastObs && vxExtra > (lastObs.vxExtra || 0)) {
        const px = run.player.x;
        const tPrev = (lastObs.x - px) / Math.max(100, effSpeed + (lastObs.vxExtra || 0));
        const tNew = (obsX - px) / Math.max(100, effSpeed + vxExtra);
        const minArrivalGap = run.diff.id === 'easy' ? 0.95 : run.diff.id === 'hard' ? 0.58 : 0.72;
        if (tNew - tPrev < minArrivalGap) {
          vxExtra = lastObs.vxExtra || 0;
        }
      }
    }

    run.obstacles.push({
      kind,
      x: obsX,
      y,
      w,
      h,
      vxExtra,
      isAir,
      isMoving,
      passed: false
    });

    // Subway Surfers style: pair obstacles with 100% collectable guided coins!
    if (kind === 'moving_platform') {
      for (let i = 0; i < 3; i++) {
        const cx = obsX + 12 + i * 30;
        const cy = y - 34;
        if (!isOverlappingAnyCollectible(cx, cy, 24, 24)) {
          run.collectibles.push({ kind: 'coin', x: cx, y: cy, w: 24, h: 24 });
        }
      }
    } else if (!isMoving && Math.random() < 0.65) {
      if (isAir) {
        const lineId = `line_${Math.floor(globalTime * 1000)}`;
        for (let i = 0; i < 4; i++) {
          const cx = obsX - 36 + i * 38;
          const cy = groundY - 28;
          if (!isOverlappingAnyCollectible(cx, cy, 24, 24)) {
            run.collectibles.push({ kind: 'coin', x: cx, y: cy, w: 24, h: 24, lineId, lineTotal: 4 });
          }
        }
      } else {
        for (let i = 0; i < 5; i++) {
          const arcX = obsX - 52 + i * 38;
          const arcY = groundY - 46 - Math.sin((i / 4) * Math.PI) * 90;
          if (!isOverlappingAnyCollectible(arcX, arcY, 24, 24)) {
            run.collectibles.push({ kind: 'coin', x: arcX, y: arcY, w: 24, h: 24 });
          }
        }
      }
    }

    // On Normal & Hard, occasionally spawn a generously spaced Jump -> Slide combo using world-appropriate obstacles!
    if (!isMoving && Math.random() < run.diff.doubleChance) {
      const comboX = obsX + w + Math.max(330, effSpeed * 0.85);
      const comboIsAir = !isAir;
      const worldAir = run.world.obstacles.filter(k => AIR_OBSTACLES.includes(k));
      const worldGround = run.world.obstacles.filter(k => !AIR_OBSTACLES.includes(k) && !MOVING_OBSTACLES.includes(k));
      const comboKind = comboIsAir
        ? (worldAir.length ? worldAir[Math.floor(Math.random() * worldAir.length)] : 'hanging_lantern')
        : (worldGround.length ? worldGround[Math.floor(Math.random() * worldGround.length)] : 'palace_barrier');
      run.obstacles.push({
        kind: comboKind,
        x: comboX,
        y: comboIsAir ? groundY - 108 : groundY - 52,
        w: 54,
        h: comboIsAir ? 44 : 52,
        vxExtra: 0,
        isAir: comboIsAir,
        isMoving: false,
        passed: false
      });
    }
  }

  function spawnCoinFormation() {
    const pattern = Math.random();
    const startX = width + 80;

    if (pattern < 0.6) {
      // Ground Run Line at natural waist height (100% collectable while running!)
      const count = 5;
      const lineId = `line_${Math.floor(globalTime * 1000)}`;
      const cy = groundY - 36;
      const placed = [];
      for (let i = 0; i < count; i++) {
        const cx = startX + i * 40;
        if (!isOverlappingAnyObstacle(cx, cy, 24, 24) && !isOverlappingAnyCollectible(cx, cy, 24, 24)) {
          placed.push({ kind: 'coin', x: cx, y: cy, w: 24, h: 24, lineId, lineTotal: count });
        }
      }
      if (placed.length === count) {
        run.collectibles.push(...placed);
      }
    } else if (pattern < 0.88) {
      // Smooth Jump Arc (starts and ends near ground height)
      for (let i = 0; i < 5; i++) {
        const cx = startX + i * 40;
        const arcY = groundY - 38 - Math.sin((i / 4) * Math.PI) * 86;
        if (!isOverlappingAnyObstacle(cx, arcY, 24, 24) && !isOverlappingAnyCollectible(cx, arcY, 24, 24)) {
          run.collectibles.push({ kind: 'coin', x: cx, y: arcY, w: 24, h: 24 });
        }
      }
    } else {
      // Royal Gem on safe jump arc height
      const gy = groundY - 96;
      if (!isOverlappingAnyObstacle(startX, gy, 26, 26) && !isOverlappingAnyCollectible(startX, gy, 26, 26)) {
        run.collectibles.push({ kind: 'gem', x: startX, y: gy, w: 26, h: 26 });
      }
    }
  }

  function spawnPowerupOrb() {
    const keys = Object.keys(DATA.POWERUPS);
    const powerType = keys[Math.floor(Math.random() * keys.length)];
    const px = width + 60;
    const py = groundY - 118;
    if (isOverlappingAnyObstacle(px, py, 36, 36)) return;
    run.collectibles.push({
      kind: 'powerup',
      powerType,
      x: px,
      y: py,
      w: 36,
      h: 36
    });
  }

  function activatePowerup(type) {
    const def = DATA.POWERUPS[type];
    if (!def) return;
    run.activePowers[type] = def.duration;
    run.player.anim = 'powerup';
    run.player.animTimer = 0.4;
    AUDIO.playSfx('powerup');
    showToast(`${def.icon} ${def.name} Activated!`);
    spawnParticles(run.player.x + 28, run.player.y + 40, 18, def.color);

    const stats = STORAGE.getState().stats;
    stats.powerupsUsedTotal += 1;
    if (!stats.powerupTypesUsed.includes(type)) {
      stats.powerupTypesUsed.push(type);
    }
    if (!stats.powerupTypeCounts) stats.powerupTypeCounts = {};
    stats.powerupTypeCounts[type] = (stats.powerupTypeCounts[type] || 0) + 1;
    if (type === 'shield') run.usedShield = true;
    if (gameMode === 'mission') {
      STORAGE.addActiveMissionDelta('use_powerups_total', 1);
      STORAGE.addActiveMissionDelta('use_powerup_type', 1, type);
    }
    checkMissionsAndAchievements();
  }

  // ==================== BOSS SYSTEM ====================
  function maybeTriggerBoss() {
    if (run.boss || run.bossIndex >= DATA.BOSSES.length) return;
    const nextBoss = DATA.BOSSES[run.bossIndex];
    if (run.distance >= nextBoss.triggerDist) {
      const compact = width < 520;
      const bw = compact ? 74 : 92;
      const bh = compact ? 108 : 132;
      run.boss = {
        ...nextBoss,
        maxHp: nextBoss.hp,
        currentHp: nextBoss.hp,
        stage: 1,
        x: width - (compact ? 95 : 145),
        y: groundY - bh - 8,
        w: bw,
        h: bh,
        attackTimer: 2.0,
        wavesSurvived: 0
      };
      AUDIO.playSfx('bossAppear');
      AUDIO.startMusic('boss');
      el.bossHud.classList.remove('hidden');
      el.bossName.textContent = run.boss.name;
      updateBossHud();
      showToast(`⚠️ BOSS APPROACHING: ${run.boss.name}!`, true);
    }
  }

  function updateBossHud() {
    if (!run.boss) return;
    const pct = Math.max(0, (run.boss.currentHp / run.boss.maxHp) * 100);
    el.bossHpFill.style.width = `${pct}%`;
    el.bossStageLabel.textContent = `STAGE ${run.boss.stage}/${run.boss.stages}`;
  }

  function damageBoss(amount) {
    if (!run.boss) return;
    run.boss.currentHp -= amount;
    if (run.boss.stages > 1) {
      const ratio = run.boss.currentHp / run.boss.maxHp;
      run.boss.stage = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
      run.boss.stage = Math.min(run.boss.stages, run.boss.stage);
    }
    updateBossHud();
    spawnParticles(run.boss.x + 40, run.boss.y + 50, 16, '#ffd700');

    if (run.boss.currentHp <= 0) {
      const defeated = run.boss;
      run.boss = null;
      run.bossIndex += 1;
      run.obstacles = [];
      run.player.invulnTimer = 2.0;
      el.bossHud.classList.add('hidden');
      AUDIO.startMusic(run.world.musicTheme);
      AUDIO.playSfx('victory');

      run.coins += 60;
      run.gems += 3;
      run.score += 500;
      run.player.anim = 'victory';
      run.player.animTimer = 0.9;

      const stats = STORAGE.getState().stats;
      stats.bossesDefeated += 1;
      if (gameMode === 'mission') STORAGE.addActiveMissionDelta('defeat_boss', 1);
      if (defeated.id === 'boss5') {
        stats.finalBossDefeated += 1;
        STORAGE.getState().totalCrowns += 3;
        run.coins += 40;
        run.gems += 2;
        checkMissionsAndAchievements();
        showToast(`👑 ${defeated.name} DEFEATED! ULTIMATE VICTORY!`, true);
        setTimeout(() => {
          if (gameState === 'PLAYING') endRun(true);
        }, 900);
        return;
      }
      checkMissionsAndAchievements();

      showToast(`👑 ${defeated.name} DEFEATED! +60🪙 +3◆`, true);
    }
  }

  function updateBoss(dt) {
    const b = run.boss;
    if (!b) return;
    b.x = Math.min(b.x, width - (b.w + 20));
    b.attackTimer -= dt;
    if (b.attackTimer <= 0) {
      const lastObs = run.obstacles[run.obstacles.length - 1];
      if (lastObs && (b.x - 20) - (lastObs.x + lastObs.w) < 280) {
        b.attackTimer = 0.35;
        return;
      }
      b.attackTimer = Math.max(1.05, (2.25 - b.stage * 0.25) / (run.diff.bossSpeedMult || 1));
      const atk = b.attackTypes[Math.floor(Math.random() * b.attackTypes.length)];
      const isHigh = atk === 'laser' || atk === 'dark_slash' || atk === 'branch' || atk === 'drone_wave';
      const obsKind = atk === 'rolling_rock' || atk === 'meteor'
        ? 'rolling_stone'
        : atk === 'laser'
        ? 'boss_laser'
        : atk === 'dark_slash'
        ? 'dark_slash'
        : atk === 'branch'
        ? 'low_banner'
        : atk === 'drone_wave'
        ? 'flying_drone'
        : 'palace_barrier';
      run.obstacles.push({
        kind: obsKind,
        x: b.x - 20,
        y: isHigh ? groundY - 108 : groundY - 52,
        w: isHigh ? 58 : 48,
        h: isHigh ? 44 : 52,
        vxExtra: 120,
        isAir: isHigh,
        isMoving: true,
        passed: false
      });
      b.wavesSurvived += 1;
      // Spawn interactive Golden Chakram orb every 2 waves to blast the boss!
      if (b.wavesSurvived % 2 === 1) {
        run.collectibles.push({
          kind: 'chakram',
          x: b.x - 40,
          y: Math.random() < 0.5 ? groundY - 46 : groundY - 118,
          w: 30,
          h: 30
        });
      }
      if (b.wavesSurvived % 3 === 0) {
        damageBoss(1);
      }
    }
  }

  // ==================== PARTICLES ====================
  function spawnParticles(x, y, count, color) {
    if (!STORAGE.getState().settings.particles) return;
    const maxParticles = isTouchDevice ? 24 : 36;
    const allowed = Math.min(count, maxParticles - run.particles.length);
    for (let i = 0; i < allowed; i++) {
      run.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.8) * 220,
        life: 0.35 + Math.random() * 0.3,
        maxLife: 0.65,
        size: 3 + Math.random() * 3.5,
        color
      });
    }
  }

  // ==================== MAIN UPDATE LOOP ====================
  function update(dt) {
    globalTime += dt;

    if (gameState !== 'PLAYING' || !run) return;

    const p = run.player;
    const save = STORAGE.getState();

    // Update timers
    run.elapsed += dt;
    if (run.elapsed > 5.5) el.runTutorialHint.classList.add('hidden');
    run.noHitTime += dt;
    if (run.specialCooldown > 0) run.specialCooldown = Math.max(0, run.specialCooldown - dt);
    if (run.shakeTimer > 0) run.shakeTimer = Math.max(0, run.shakeTimer - dt);
    if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);

    // Power-up countdowns (with safe landing grace period when Royal Flight ends)
    for (const key of Object.keys(run.activePowers)) {
      run.activePowers[key] -= dt;
      if (run.activePowers[key] <= 0) {
        delete run.activePowers[key];
        if (key === 'flight') {
          p.invulnTimer = Math.max(p.invulnTimer, 2.2);
          run.obstacles = run.obstacles.filter(o => o.x > p.x + 280 || o.x + o.w < p.x - 40);
          showToast('🦅 Safe Landing!');
        }
      }
    }

    // Speed progression
    run.speed = Math.min(run.diff.maxSpeed, run.speed + run.diff.speedAccel * dt);
    if (run.speed >= run.diff.maxSpeed * 0.92) {
      run.maxSpeedTime += dt;
    }

    const speedMult = run.activePowers.speed ? 1.45 : run.activePowers.freeze ? 0.62 : 1.0;
    const effSpeed = run.speed * speedMult;

    run.scrollX += effSpeed * dt;
    const distDelta = (effSpeed * dt) / 22;
    run.distance += distDelta;
    save.stats.distanceTotal += distDelta;
    if (!save.stats.worldDistance) save.stats.worldDistance = {};
    save.stats.worldDistance[run.world.id] = (save.stats.worldDistance[run.world.id] || 0) + distDelta;
    if (gameMode === 'mission') {
      STORAGE.addActiveMissionDelta('distance_total', distDelta);
      STORAGE.addActiveMissionDelta('world_distance', distDelta, run.world.id);
    }

    const scoreMult = (run.activePowers.speed ? 2 : 1) * run.diff.scoreMult;
    run.score += distDelta * 10 * scoreMult;

    // Sandstorm in Desert Kingdom
    if (run.world.hasSandstorm) {
      run.sandstormTimer -= dt;
      if (run.sandstormTimer <= 0) {
        run.sandstormActive = !run.sandstormActive;
        run.sandstormTimer = run.sandstormActive ? 7 : 12;
        if (!run.sandstormActive && !run.sandstormSurvived) {
          run.sandstormSurvived = true;
          save.stats.survivedSandstorm += 1;
          if (gameMode === 'mission') STORAGE.addActiveMissionDelta('survive_sandstorm', 1);
        }
        if (run.sandstormActive) showToast('🌪️ Sandstorm Incoming!');
      }
    }

    // Player Physics (with Coyote Time, Jump Buffer, Slide Buffer & Rideable Platforms)
    if (p.coyoteTimer > 0) p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    if (p.jumpBuffer > 0) p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    if (p.slideBuffer > 0) p.slideBuffer = Math.max(0, p.slideBuffer - dt);

    const prevBottom = p.y + p.h;
    let landedThisFrame = false;

    if (run.activePowers.flight) {
      const targetY = Math.max(70, groundY - 195);
      p.y += (targetY - p.y) * Math.min(1, dt * 8);
      p.vy = 0;
      p.isGrounded = false;
      p.anim = 'jump';
    } else {
      const wasGrounded = p.isGrounded;
      const gravity = p.vy < 0 ? 1820 : 2280;
      p.vy += gravity * dt;
      p.y += p.vy * dt;

      // Check rideable moving platforms
      let standingOnPlatform = false;
      if (p.vy >= 0) {
        for (const o of run.obstacles) {
          if (o.kind === 'moving_platform' && p.x + p.w - 12 > o.x && p.x + 12 < o.x + o.w) {
            if (prevBottom <= o.y + 18 && p.y + p.h >= o.y) {
              p.y = o.y - p.h;
              p.vy = 0;
              standingOnPlatform = true;
              break;
            }
          }
        }
      }

      if (standingOnPlatform || p.y >= groundY - p.h) {
        if (!standingOnPlatform && p.y >= groundY - p.h) {
          p.y = groundY - p.h;
          p.vy = 0;
        }
        if (!wasGrounded) {
          landedThisFrame = true;
          p.squashX = 1.18;
          p.squashY = 0.82;
          AUDIO.playSfx('land');
          spawnParticles(p.x + p.w * 0.5, p.y + p.h, 6, '#e8c488');
        }
        p.isGrounded = true;
        p.coyoteTimer = 0.09;
        p.jumpsUsed = 0;
        p.rotation = 0;
        p.flipProgress = 0;
      } else {
        if (wasGrounded && p.vy >= 0) {
          p.coyoteTimer = 0.09;
        }
        p.isGrounded = false;
      }

      // Consume buffered Jump or Slide immediately on landing!
      if (landedThisFrame) {
        if (p.jumpBuffer > 0) {
          executeJump(false);
        } else if (p.slideBuffer > 0) {
          p.slideTimer = 0.68;
          p.slideBuffer = 0;
          p.anim = 'slide';
          AUDIO.playSfx('slide');
        }
      }
    }

    // Squash recovery
    p.squashX += (1 - p.squashX) * Math.min(1, dt * 12);
    p.squashY += (1 - p.squashY) * Math.min(1, dt * 12);

    if (p.anim === 'doubleJump') {
      p.flipProgress = Math.min(1, p.flipProgress + dt / 0.42);
      p.rotation = p.flipProgress * Math.PI * 2;
    }

    if (p.slideTimer > 0) {
      p.slideTimer -= dt;
      p.anim = 'slide';
      if (Math.random() < 0.45) {
        spawnParticles(p.x + 8, groundY, 1, 'rgba(232, 196, 136, 0.7)');
      }
    } else if (p.animTimer > 0) {
      p.animTimer -= dt;
    } else if (p.isGrounded) {
      p.anim = 'run';
      run.footstepTimer -= dt;
      if (run.footstepTimer <= 0) {
        run.footstepTimer = 0.26;
        AUDIO.playSfx('footstep');
        spawnParticles(p.x + 12, groundY, 2, 'rgba(250, 244, 232, 0.5)');
      }
    }

    // Spawners (paused during boss intro, normal obstacles resume lightly or boss attacks)
    if (!run.boss) {
      run.spawnTimer -= dt;
      if (run.spawnTimer <= 0) {
        spawnObstaclePattern();
        const gapFactor = Math.max(0.55, 1 - (run.speed - run.diff.baseSpeed) / 900);
        run.spawnTimer = (run.diff.spawnMinGap + Math.random() * (run.diff.spawnMaxGap - run.diff.spawnMinGap)) * gapFactor;
      }
    } else {
      updateBoss(dt);
    }

    maybeTriggerBoss();

    run.coinSpawnTimer -= dt;
    if (run.coinSpawnTimer <= 0) {
      spawnCoinFormation();
      run.coinSpawnTimer = 1.3 + Math.random() * 1.4;
    }

    run.powerSpawnTimer -= dt;
    if (run.powerSpawnTimer <= 0) {
      spawnPowerupOrb();
      run.powerSpawnTimer = 10 + Math.random() * 8;
    }

    // Player Hitbox (difficulty-aware forgiveness & clean slide crouch on ground or platforms)
    const pad = run.diff.hitboxPad || 11;
    const pHit = p.slideTimer > 0
      ? { x: p.x + 8, y: p.y + p.h - 40, w: p.w - 14, h: 38 }
      : { x: p.x + pad, y: p.y + pad, w: p.w - pad * 2, h: p.h - pad - 4 };
    const pPickup = { x: pHit.x - 12, y: pHit.y - 12, w: pHit.w + 24, h: pHit.h + 24 };

    // Update Obstacles & Collisions
    for (let i = run.obstacles.length - 1; i >= 0; i--) {
      const o = run.obstacles[i];
      const obsSpeed = effSpeed + (o.vxExtra || 0);
      o.x -= obsSpeed * dt;

      if (!o.passed && o.x + o.w < pHit.x) {
        o.passed = true;
        run.dodged += 1;
        save.stats.avoidObstacles += 1;
        if (gameMode === 'mission') STORAGE.addActiveMissionDelta('avoid_obstacles', 1);
        if (o.isMoving) {
          save.stats.avoidMoving += 1;
          if (gameMode === 'mission') STORAGE.addActiveMissionDelta('avoid_moving', 1);
        }
        if (p.slideTimer > 0 && o.isAir) {
          save.stats.slideObstacles += 1;
          if (gameMode === 'mission') STORAGE.addActiveMissionDelta('slide_obstacles', 1);
        } else if (!p.isGrounded) {
          save.stats.jumpObstacles += 1;
          if (gameMode === 'mission') STORAGE.addActiveMissionDelta('jump_obstacles', 1);
        }

        // Near-miss bonus
        if (Math.abs((pHit.y + pHit.h) - o.y) < 35) {
          run.score += 25;
          run.floatingTexts.push({ x: p.x + 20, y: p.y - 10, text: 'NEAR MISS +25', life: 0.8 });
        }
      }

      // AABB Collision (immune while flying high, or standing safely on a moving_platform)
      if (run.activePowers.flight) {
        continue;
      }
      if (o.kind === 'moving_platform' && p.y + p.h <= o.y + 6) {
        continue;
      }
      if (rectsOverlap(pHit, o)) {
        if (run.activePowers.invincibility || run.activePowers.speed) {
          // Smash obstacle!
          spawnParticles(o.x + o.w / 2, o.y + o.h / 2, 14, '#ffd700');
          run.obstacles.splice(i, 1);
          run.score += 40;
          continue;
        }
        if (p.invulnTimer > 0) continue;

        if (run.activePowers.shield) {
          delete run.activePowers.shield;
          p.invulnTimer = 1.4;
          p.anim = 'damage';
          p.animTimer = 0.35;
          run.shakeTimer = 0.25;
          AUDIO.playSfx('hit');
          showToast('🛡️ Royal Shield Absorbed Hit!');
          run.obstacles.splice(i, 1);
          continue;
        }

        // Game Over!
        run.noHitTime = 0;
        p.anim = 'gameOver';
        run.shakeTimer = 0.35;
        AUDIO.playSfx('hit');
        endRun(false);
        return;
      }

      if (o.x + o.w < -100) {
        run.obstacles.splice(i, 1);
      }
    }

    // Update Collectibles
    for (let i = run.collectibles.length - 1; i >= 0; i--) {
      const c = run.collectibles[i];
      if (c.kind === 'coin' && run.activePowers.magnet) {
        const dx = (p.x + p.w / 2) - (c.x + c.w / 2);
        const dy = (p.y + p.h / 2) - (c.y + c.h / 2);
        const dist = Math.hypot(dx, dy);
        if (dist < 280) {
          c.x += (dx / Math.max(1, dist)) * 620 * dt;
          c.y += (dy / Math.max(1, dist)) * 620 * dt;
        } else {
          c.x -= effSpeed * dt;
        }
      } else {
        c.x -= effSpeed * dt;
      }

      if (rectsOverlap(pPickup, c)) {
        if (c.kind === 'coin') {
          const gain = run.activePowers.doubleCoin ? 2 : 1;
          run.coins += gain;
          run.score += 15 * gain;
          save.stats.coinsTotal += gain;
          if (gameMode === 'mission') STORAGE.addActiveMissionDelta('coins_total', gain);
          AUDIO.playSfx('coin');
          spawnParticles(c.x + 12, c.y + 12, 6, '#ffd700');
          if (c.lineId) {
            run.lineCollected[c.lineId] = (run.lineCollected[c.lineId] || 0) + 1;
            if (run.lineCollected[c.lineId] === c.lineTotal) {
              save.stats.coinLines += 1;
              if (gameMode === 'mission') STORAGE.addActiveMissionDelta('coin_lines', 1);
            }
          }
        } else if (c.kind === 'gem') {
          run.gems += 1;
          run.score += 75;
          save.stats.gemsTotal += 1;
          if (gameMode === 'mission') STORAGE.addActiveMissionDelta('gems_total', 1);
          AUDIO.playSfx('gem');
          spawnParticles(c.x + 12, c.y + 12, 10, '#38bdf8');
        } else if (c.kind === 'chakram') {
          p.anim = 'bossAttack';
          p.animTimer = 0.45;
          AUDIO.playSfx('powerup');
          damageBoss(2);
          run.floatingTexts.push({ x: p.x + 40, y: p.y - 16, text: 'CHAKRAM STRIKE!', life: 0.9 });
        } else if (c.kind === 'powerup') {
          activatePowerup(c.powerType);
        }
        run.collectibles.splice(i, 1);
        continue;
      }

      if (c.x + c.w < -80) {
        run.collectibles.splice(i, 1);
      }
    }

    // Update Particles & Floating Text
    for (let i = run.particles.length - 1; i >= 0; i--) {
      const pt = run.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 400 * dt;
      pt.life -= dt;
      if (pt.life <= 0) run.particles.splice(i, 1);
    }
    for (let i = run.floatingTexts.length - 1; i >= 0; i--) {
      const ft = run.floatingTexts[i];
      ft.y -= 40 * dt;
      ft.life -= dt;
      if (ft.life <= 0) run.floatingTexts.splice(i, 1);
    }

    // Periodic Mission Check during gameplay (stops immediately if mission passed)
    if (Math.floor(run.elapsed * 2) !== Math.floor((run.elapsed - dt) * 2)) {
      save.stats.bestRunScore = Math.max(save.stats.bestRunScore, Math.floor(run.score));
      save.stats.bestSurviveTime = Math.max(save.stats.bestSurviveTime, run.elapsed);
      save.stats.bestNoHitTime = Math.max(save.stats.bestNoHitTime, run.noHitTime);
      save.stats.bestMaxSpeedTime = Math.max(save.stats.bestMaxSpeedTime, run.maxSpeedTime);
      if (checkMissionsAndAchievements()) return;
    }

    // Throttle HUD DOM updates to ~12 Hz to eliminate mobile DOM reflow lag
    run.hudTimer = (run.hudTimer || 0) - dt;
    if (run.hudTimer <= 0) {
      run.hudTimer = 0.08;
      updateHud();
    }
  }

  let lastPowerHtml = '';
  let lastHudScore = -1;
  let lastHudMult = '';
  let lastHudDist = -1;
  let lastHudCoins = -1;
  let lastHudGems = -1;
  let lastHudMissionText = '';
  let lastHudMissionPassed = null;
  let lastSpecialOpacity = '';
  let lastSpecialLabel = '';

  function resetHudCache() {
    lastPowerHtml = '';
    lastHudScore = -1;
    lastHudMult = '';
    lastHudDist = -1;
    lastHudCoins = -1;
    lastHudGems = -1;
    lastHudMissionText = '';
    lastHudMissionPassed = null;
    lastSpecialOpacity = '';
    lastSpecialLabel = '';
  }

  function updateHud() {
    const scoreInt = Math.floor(run.score);
    if (scoreInt !== lastHudScore) {
      lastHudScore = scoreInt;
      el.hudScore.textContent = scoreInt.toLocaleString();
    }

    const mult = (run.activePowers.speed ? 2 : 1) * run.diff.scoreMult;
    const multStr = `x${mult.toFixed(mult % 1 === 0 ? 0 : 1)}`;
    if (multStr !== lastHudMult) {
      lastHudMult = multStr;
      el.hudMultiplier.textContent = multStr;
    }

    const distInt = Math.floor(run.distance);
    if (distInt !== lastHudDist) {
      lastHudDist = distInt;
      el.hudDistance.textContent = `${distInt}m`;
    }

    if (run.coins !== lastHudCoins) {
      lastHudCoins = run.coins;
      el.hudCoins.textContent = run.coins;
    }

    if (run.gems !== lastHudGems) {
      lastHudGems = run.gems;
      el.hudGems.textContent = run.gems;
    }

    // Active Mission / Endless HUD Pill (only update DOM when changed)
    let missionText = '';
    let missionPassed = false;
    if (gameMode === 'endless') {
      missionText = '∞ ENDLESS MODE — Chase High Score & Asharfi!';
    } else {
      const save = STORAGE.getState();
      const am = STORAGE.getCurrentMission();
      const target = STORAGE.getMissionTarget(am);
      missionPassed = save.completedMissions.includes(am.id);
      const val = missionPassed ? target : Math.min(target, STORAGE.getMissionCurrentValue(am));
      missionText = missionPassed
        ? `#${am.id} ${am.title} — PASSED ✓`
        : `#${am.id} ${am.title} (${val}/${target})`;
    }
    if (missionPassed !== lastHudMissionPassed) {
      lastHudMissionPassed = missionPassed;
      el.hudMissionPill.classList.toggle('passed', missionPassed);
    }
    if (missionText !== lastHudMissionText) {
      lastHudMissionText = missionText;
      el.hudMissionText.textContent = missionText;
    }

    // Active Powerup Pills (only touch DOM when changed)
    let powerHtml = '';
    for (const [key, rem] of Object.entries(run.activePowers)) {
      const def = DATA.POWERUPS[key];
      if (!def) continue;
      const pct = Math.max(0, Math.min(100, (rem / def.duration) * 100));
      powerHtml += `<div class="powerup-pill"><span>${def.icon} ${def.name}</span>
        <div class="powerup-bar-wrap"><div class="powerup-bar-fill" style="width:${pct.toFixed(0)}%;background:${def.color}"></div></div></div>`;
    }
    if (powerHtml !== lastPowerHtml) {
      el.activePowerups.innerHTML = powerHtml;
      lastPowerHtml = powerHtml;
    }

    const spOpacity = run.specialCooldown > 0 ? '0.45' : '1';
    if (spOpacity !== lastSpecialOpacity) {
      lastSpecialOpacity = spOpacity;
      el.btnSpecialMobile.style.opacity = spOpacity;
    }
    const specialText = el.btnSpecialMobile.querySelector('.special-text');
    if (specialText) {
      const spLabel = run.specialCooldown > 0 ? `${Math.ceil(run.specialCooldown)}s` : 'POWER';
      if (spLabel !== lastSpecialLabel) {
        lastSpecialLabel = spLabel;
        specialText.textContent = spLabel;
      }
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ==================== RENDER LOOP ====================
  function render() {
    const save = STORAGE.getState();
    const skin = DATA.SKINS.find(s => s.id === save.selectedSkin) || DATA.SKINS[0];

    if (gameState === 'MENU' || gameState === 'LOADING') {
      // Draw ambient palace background behind menu
      const world = DATA.WORLDS.find(w => w.id === save.selectedWorld) || DATA.WORLDS[0];
      RENDERER.drawBackground(ctx, width, height, groundY, world, globalTime * 60, globalTime);

      // Draw animated Sheru Bhai in Menu Showcase
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      RENDERER.drawSheru(previewCtx, 96, 84, 128, 224, {
        anim: 'idle',
        time: globalTime,
        skin
      });
      return;
    }

    if (!run) return;

    ctx.save();
    if (run.shakeTimer > 0 && save.settings.screenShake) {
      const mag = 7;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    RENDERER.drawBackground(ctx, width, height, groundY, run.world, run.scrollX, globalTime);

    // Collectibles
    for (const c of run.collectibles) {
      RENDERER.drawCollectible(ctx, c, globalTime);
    }

    // Obstacles
    for (const o of run.obstacles) {
      RENDERER.drawObstacle(ctx, o, globalTime);
    }

    // Boss
    if (run.boss) {
      RENDERER.drawBoss(ctx, run.boss, globalTime);
    }

    // Sheru Bhai
    const p = run.player;
    RENDERER.drawSheru(ctx, p.x, p.y, p.w, p.h, {
      anim: p.anim,
      time: globalTime,
      skin,
      groundY,
      activePowers: run.activePowers,
      squashX: p.squashX,
      squashY: p.squashY,
      rotation: p.rotation,
      flash: p.invulnTimer > 0 && Math.floor(globalTime * 20) % 2 === 0
    });

    // Particles (fast rects/arcs)
    if (run.particles.length > 0) {
      for (let i = 0; i < run.particles.length; i++) {
        const pt = run.particles[i];
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Floating Texts (avoid setting ctx.font when list is empty)
    if (run.floatingTexts.length > 0) {
      ctx.font = 'bold 15px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd966';
      for (let i = 0; i < run.floatingTexts.length; i++) {
        const ft = run.floatingTexts[i];
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1;
    }

    // Speed Streaks (single batched stroke path)
    if (run.activePowers.speed) {
      ctx.strokeStyle = 'rgba(255, 224, 125, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const sy = ((i * 110 + globalTime * 300) % groundY);
        const sx = ((i * 270 - globalTime * 1200) % width + width) % width;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 80, sy);
      }
      ctx.stroke();
    }

    // Sandstorm or Time Freeze Overlay
    if (run.sandstormActive) {
      ctx.fillStyle = 'rgba(217, 145, 70, 0.24)';
      ctx.fillRect(0, 0, width, height);
    }
    if (run.activePowers.freeze) {
      ctx.fillStyle = 'rgba(103, 232, 249, 0.14)';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // ==================== INPUT HANDLERS ====================
  function closeOpenMenuModals() {
    const ids = ['missionsModal', 'shopModal', 'worldsModal', 'achievementsModal', 'settingsModal', 'controlsModal'];
    let closed = false;
    ids.forEach(id => {
      const node = document.getElementById(id);
      if (node && !node.classList.contains('hidden')) {
        node.classList.add('hidden');
        closed = true;
      }
    });
    return closed;
  }

  function isAnyMenuModalOpen() {
    return ['missionsModal', 'shopModal', 'worldsModal', 'achievementsModal', 'settingsModal', 'controlsModal']
      .some(id => !document.getElementById(id).classList.contains('hidden'));
  }

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (gameState === 'PLAYING') {
        e.preventDefault();
        triggerJump();
      }
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (gameState === 'PLAYING') {
        e.preventDefault();
        triggerSlide();
      }
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      if (gameState === 'PLAYING') triggerSpecial();
    } else if (e.code === 'Escape') {
      if (closeOpenMenuModals()) return;
      if (gameState === 'PLAYING') pauseGame();
      else if (gameState === 'PAUSED') resumeGame();
    } else if (e.code === 'Enter') {
      if (isAnyMenuModalOpen()) return;
      if (gameState === 'MENU') startGame();
      else if (gameState === 'GAMEOVER') {
        if (gameMode === 'mission' && el.btnMissionNext.dataset.passed === '1') {
          STORAGE.advanceToNextMission();
        }
        startGame();
      }
    }
  });

  // Mobile Touch Controls (Tap = Jump, Swipe Up = Jump, Swipe Down = Slide)
  let touchStartY = 0;
  let touchHandled = false;
  canvas.addEventListener('touchstart', (e) => {
    if (gameState !== 'PLAYING') return;
    touchStartY = e.touches[0].clientY;
    touchHandled = false;
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (gameState !== 'PLAYING' || touchHandled) return;
    const dy = e.touches[0].clientY - touchStartY;
    if (dy < -28) {
      touchHandled = true;
      triggerJump();
    } else if (dy > 28) {
      touchHandled = true;
      triggerSlide();
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    if (gameState === 'PLAYING' && !touchHandled) {
      triggerJump();
    }
  });

  // Mouse click on canvas jumps on desktop
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && gameState === 'PLAYING') {
      triggerJump();
    }
  });

  // Auto-pause if player switches tabs so runs aren't lost unfairly
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState === 'PLAYING') {
      pauseGame();
    }
  });

  function bindTouchActionButton(btn, actionFn) {
    if (!btn) return;
    let lastTouchTs = 0;
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      lastTouchTs = performance.now();
      btn.classList.add('pressed');
      if (gameState === 'PLAYING') actionFn();
    }, { passive: false });
    const release = () => btn.classList.remove('pressed');
    btn.addEventListener('touchend', release, { passive: true });
    btn.addEventListener('touchcancel', release, { passive: true });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (performance.now() - lastTouchTs < 450) return;
      if (gameState === 'PLAYING') actionFn();
    });
  }

  bindTouchActionButton(el.btnSpecialMobile, triggerSpecial);
  bindTouchActionButton(el.btnJumpMobile, triggerJump);
  bindTouchActionButton(el.btnSlideMobile, triggerSlide);

  // ==================== MODALS & RENDERERS ====================
  function openModal(id) {
    AUDIO.playSfx('click');
    document.getElementById(id).classList.remove('hidden');
  }

  function closeModal(id) {
    AUDIO.playSfx('click');
    document.getElementById(id).classList.add('hidden');
  }

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  function renderMissionsModal() {
    const save = STORAGE.getState();
    const tabs = document.getElementById('chapterTabs');
    const list = document.getElementById('missionsList');
    tabs.innerHTML = '';
    list.innerHTML = '';

    for (let ch = 1; ch <= DATA.CHAPTER_TITLES.length; ch++) {
      const btn = document.createElement('button');
      btn.className = `chapter-tab ${ch === activeChapter ? 'active' : ''}`;
      const unlocked = STORAGE.isChapterUnlocked(ch);
      btn.textContent = `${unlocked ? '' : '🔒 '}Ch ${ch}`;
      btn.addEventListener('click', () => {
        activeChapter = ch;
        renderMissionsModal();
      });
      tabs.appendChild(btn);
    }

    const chTitle = document.createElement('div');
    chTitle.style.gridColumn = '1 / -1';
    chTitle.style.color = '#ffd966';
    chTitle.style.fontWeight = '700';
    chTitle.textContent = `CHAPTER ${activeChapter}: ${DATA.CHAPTER_TITLES[activeChapter - 1]}`;
    list.appendChild(chTitle);

    const unlocked = STORAGE.isChapterUnlocked(activeChapter);
    const chMissions = DATA.MISSIONS.filter(m => m.chapter === activeChapter);

    for (const m of chMissions) {
      const done = save.completedMissions.includes(m.id);
      const target = STORAGE.getMissionTarget(m);
      const val = done ? target : unlocked ? Math.min(target, STORAGE.getMissionCurrentValue(m)) : 0;
      const pct = Math.min(100, Math.round((val / target) * 100));

      const isActive = save.currentMissionId === m.id && !done;
      const card = document.createElement('div');
      card.className = `mission-card ${done ? 'completed' : !unlocked ? 'locked' : ''} ${isActive ? 'active-mission' : ''}`;
      card.innerHTML = `
        <div class="mission-top">
          <span class="mission-name">#${m.id} ${m.title}</span>
          <span class="mission-status">${done ? 'DONE' : unlocked ? `${val}/${target}` : 'LOCKED'}</span>
        </div>
        <div class="mission-desc">${m.desc}</div>
        <div class="mission-progress-bar"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
        <div class="mission-footer"><span>Reward: +${m.rewardCoins}🪙 +${m.rewardGems}◆</span><span>${pct}%</span></div>
        ${unlocked && !done ? `<button class="mission-select-btn">${isActive ? '★ ACTIVE MISSION' : 'SET ACTIVE'}</button>` : ''}
      `;
      const selBtn = card.querySelector('.mission-select-btn');
      if (selBtn) {
        selBtn.addEventListener('click', () => {
          save.currentMissionId = m.id;
          STORAGE.save();
          AUDIO.playSfx('click');
          renderMissionsModal();
        });
      }
      list.appendChild(card);
    }
  }

  function renderShopModal() {
    const save = STORAGE.getState();
    document.getElementById('shopCoins').textContent = save.totalCoins.toLocaleString();
    document.getElementById('shopGems').textContent = save.totalGems.toLocaleString();
    document.getElementById('shopCrowns').textContent = save.totalCrowns.toLocaleString();

    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';

    for (const skin of DATA.SKINS) {
      const owned = save.unlockedSkins.includes(skin.id);
      const equipped = save.selectedSkin === skin.id;
      const canAfford = save.totalCoins >= skin.cost.coins && save.totalGems >= skin.cost.gems;

      const card = document.createElement('div');
      card.className = `item-card ${equipped ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="item-swatch" style="background:linear-gradient(135deg, ${skin.suit}, ${skin.vest})"></div>
        <div>
          <div class="item-title">${skin.name}</div>
          <div class="item-desc">${skin.desc}</div>
        </div>
        <button class="item-btn ${equipped ? 'equipped' : ''}" ${!owned && !canAfford ? 'disabled' : ''}>
          ${equipped ? 'EQUIPPED' : owned ? 'EQUIP' : `BUY (${skin.cost.coins}🪙 ${skin.cost.gems ? skin.cost.gems + '◆' : ''})`}
        </button>
      `;

      card.querySelector('button').addEventListener('click', () => {
        if (owned) {
          save.selectedSkin = skin.id;
          STORAGE.save();
          AUDIO.playSfx('click');
        } else if (canAfford) {
          save.totalCoins -= skin.cost.coins;
          save.totalGems -= skin.cost.gems;
          save.unlockedSkins.push(skin.id);
          save.selectedSkin = skin.id;
          STORAGE.save();
          AUDIO.playSfx('powerup');
          showToast(`👔 Unlocked ${skin.name}!`);
        }
        renderShopModal();
        refreshMenuUI();
      });

      grid.appendChild(card);
    }
  }

  function renderWorldsModal() {
    const save = STORAGE.getState();
    const grid = document.getElementById('worldsGrid');
    grid.innerHTML = '';

    for (const w of DATA.WORLDS) {
      const owned = save.unlockedWorlds.includes(w.id);
      const selected = save.selectedWorld === w.id;
      const canAfford = save.totalCoins >= w.unlockCost.coins && save.totalGems >= w.unlockCost.gems;

      const card = document.createElement('div');
      card.className = `item-card ${selected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="item-swatch" style="background:linear-gradient(180deg, ${w.skyTop}, ${w.skyBottom})"></div>
        <div>
          <div class="item-title">${w.name}</div>
          <div class="item-desc">${w.subtitle}</div>
        </div>
        <button class="item-btn ${selected ? 'equipped' : ''}" ${!owned && !canAfford ? 'disabled' : ''}>
          ${selected ? 'SELECTED' : owned ? 'SELECT' : `UNLOCK (${w.unlockCost.coins}🪙 ${w.unlockCost.gems ? w.unlockCost.gems + '◆' : ''})`}
        </button>
      `;

      card.querySelector('button').addEventListener('click', () => {
        if (owned) {
          save.selectedWorld = w.id;
          STORAGE.save();
          AUDIO.playSfx('click');
        } else if (canAfford) {
          save.totalCoins -= w.unlockCost.coins;
          save.totalGems -= w.unlockCost.gems;
          save.unlockedWorlds.push(w.id);
          save.selectedWorld = w.id;
          STORAGE.save();
          AUDIO.playSfx('victory');
          checkMissionsAndAchievements();
          showToast(`🏰 Unlocked ${w.name}!`);
        }
        renderWorldsModal();
        refreshMenuUI();
      });

      grid.appendChild(card);
    }
  }

  function renderAchievementsModal() {
    const save = STORAGE.getState();
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';

    for (const a of DATA.ACHIEVEMENTS) {
      const unlocked = save.achievements.includes(a.id);
      const card = document.createElement('div');
      card.className = `item-card ${unlocked ? 'selected' : ''}`;
      card.innerHTML = `
        <div>
          <div class="item-title">${unlocked ? '🏆' : '🔒'} ${a.name}</div>
          <div class="item-desc">${a.desc}</div>
        </div>
        <div style="font-size:0.8rem;color:#ffd966;font-weight:700;">
          ${unlocked ? 'UNLOCKED' : `Reward: +${a.rewardCrowns}♛`}
        </div>
      `;
      grid.appendChild(card);
    }
  }

  // ==================== BUTTON BINDINGS ====================
  document.getElementById('btnPlay').addEventListener('click', startGame);
  document.getElementById('btnPause').addEventListener('click', pauseGame);
  let hudMuted = false;
  function syncMuteUI() {
    const span = el.btnMuteHud.querySelector('span');
    if (span) span.textContent = hudMuted ? '🔇' : '🔊';
  }
  el.btnMuteHud.addEventListener('click', () => {
    hudMuted = !hudMuted;
    const s = STORAGE.getState().settings;
    AUDIO.setVolumes(hudMuted ? 0 : s.musicVolume, hudMuted ? 0 : s.sfxVolume);
    syncMuteUI();
  });

  // Fullscreen toggle & portrait-to-landscape rotate button
  function enterLandscapeFullscreen() {
    try {
      const root = document.documentElement;
      if (!document.fullscreenElement && root.requestFullscreen) {
        root.requestFullscreen().catch(() => {});
      }
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) { /* unsupported */ }
  }
  const btnForceLandscape = document.getElementById('btnForceLandscape');
  if (btnForceLandscape) {
    btnForceLandscape.addEventListener('click', enterLandscapeFullscreen);
  }
  const btnFullscreen = document.getElementById('btnFullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          enterLandscapeFullscreen();
        }
      } catch (e) { /* unsupported */ }
    });
    document.addEventListener('fullscreenchange', () => {
      const span = btnFullscreen.querySelector('span');
      if (span) span.textContent = document.fullscreenElement ? '⊟' : '⛶';
    });
  }
  AUDIO.onTrackChange((track) => {
    if (el.hudTrackInfo && track) {
      el.hudTrackInfo.textContent = `${track.title} • ${track.artist}`;
    }
  });
  if (el.btnNextTrackHud) {
    el.btnNextTrackHud.addEventListener('click', () => {
      const t = AUDIO.nextTrack();
      showToast(`🎵 Now Playing: ${t.title} (${t.artist})`);
    });
  }
  if (el.musicTrackSelect) {
    el.musicTrackSelect.addEventListener('change', () => {
      const s = STORAGE.getState();
      s.settings.musicTrack = el.musicTrackSelect.value;
      AUDIO.setTrackMode(s.settings.musicTrack);
      STORAGE.save();
      const t = AUDIO.getCurrentTrack();
      if (el.hudTrackInfo && t) {
        el.hudTrackInfo.textContent = `${t.title} • ${t.artist}`;
      }
    });
  }
  document.getElementById('btnResume').addEventListener('click', resumeGame);
  document.getElementById('btnRestartPause').addEventListener('click', startGame);
  document.getElementById('btnMainMenuPause').addEventListener('click', returnToMainMenu);
  el.btnRetryRun.addEventListener('click', () => {
    startGame();
  });
  el.btnMissionNext.addEventListener('click', () => {
    if (el.btnMissionNext.dataset.passed === '1') {
      STORAGE.advanceToNextMission();
    }
    startGame();
  });
  document.getElementById('btnGoMainMenu').addEventListener('click', () => {
    if (gameMode === 'mission' && el.btnMissionNext.dataset.passed === '1') {
      STORAGE.advanceToNextMission();
    }
    returnToMainMenu();
  });

  document.getElementById('btnMissions').addEventListener('click', () => {
    renderMissionsModal();
    openModal('missionsModal');
  });
  document.getElementById('btnShop').addEventListener('click', () => {
    renderShopModal();
    openModal('shopModal');
  });
  document.getElementById('btnWorlds').addEventListener('click', () => {
    renderWorldsModal();
    openModal('worldsModal');
  });
  document.getElementById('btnAchievements').addEventListener('click', () => {
    renderAchievementsModal();
    openModal('achievementsModal');
  });
  document.getElementById('btnSettings').addEventListener('click', () => openModal('settingsModal'));
  document.getElementById('btnSettingsPause').addEventListener('click', () => openModal('settingsModal'));
  document.getElementById('btnControlsHelp').addEventListener('click', () => openModal('controlsModal'));

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      STORAGE.getState().settings.difficulty = btn.dataset.diff;
      STORAGE.save();
      AUDIO.playSfx('click');
      refreshMenuUI();
    });
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gameMode = btn.dataset.mode;
      AUDIO.playSfx('click');
      refreshMenuUI();
    });
  });

  el.musicVolume.addEventListener('input', () => {
    hudMuted = false;
    syncMuteUI();
    const s = STORAGE.getState();
    s.settings.musicVolume = el.musicVolume.value / 100;
    AUDIO.setVolumes(s.settings.musicVolume, s.settings.sfxVolume);
    STORAGE.save();
  });

  el.sfxVolume.addEventListener('input', () => {
    hudMuted = false;
    syncMuteUI();
    const s = STORAGE.getState();
    s.settings.sfxVolume = el.sfxVolume.value / 100;
    AUDIO.setVolumes(s.settings.musicVolume, s.settings.sfxVolume);
    STORAGE.save();
  });

  el.toggleParticles.addEventListener('change', () => {
    STORAGE.getState().settings.particles = el.toggleParticles.checked;
    STORAGE.save();
  });

  el.toggleShake.addEventListener('change', () => {
    STORAGE.getState().settings.screenShake = el.toggleShake.checked;
    STORAGE.save();
  });

  document.getElementById('btnResetProgress').addEventListener('click', () => {
    el.resetConfirmBox.classList.remove('hidden');
  });
  document.getElementById('btnCancelReset').addEventListener('click', () => {
    el.resetConfirmBox.classList.add('hidden');
  });
  document.getElementById('btnConfirmReset').addEventListener('click', () => {
    STORAGE.reset();
    el.resetConfirmBox.classList.add('hidden');
    closeModal('settingsModal');
    if (gameState !== 'MENU') {
      returnToMainMenu();
    } else {
      refreshMenuUI();
    }
    showToast('Progress Reset Complete');
  });

  // ==================== LOADING SCREEN ====================
  function startLoadingScreen() {
    if (!el.loadingScreen) {
      gameState = 'MENU';
      el.mainMenu.classList.remove('hidden');
      el.mainMenu.classList.add('active');
      return;
    }

    const loadingSteps = [
      { at: 0, text: 'Summoning Sheru Bhai...' },
      { at: 22, text: 'Polishing Royal Gold & Chains...' },
      { at: 46, text: 'Preparing 11 Indian Kingdoms...' },
      { at: 72, text: 'Tuning Official Phonk Soundtrack...' },
      { at: 92, text: 'Opening Palace Gates...' },
      { at: 100, text: 'Welcome, Sheru Bhai!' }
    ];

    const loadingTips = [
      'Tip: Press <strong>SPACE</strong> or <strong>Swipe Up</strong> twice for a Royal Double Jump!',
      'Tip: Hit <strong>SHIFT</strong> or tap <strong>⚡</strong> to unleash your Royal Strike!',
      'Tip: Explore <strong>11 Indian Kingdoms</strong> from Jaipur to Chennai & Bengaluru!',
      'Tip: Hold <strong>S / Swipe Down</strong> in mid-air for a fast slam & slide!'
    ];

    const preloadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
      if (img.complete) resolve(true);
    });

    const waitFonts = (document.fonts && document.fonts.ready)
      ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))])
      : Promise.resolve();

    let assetsReady = false;
    Promise.all([
      preloadImage('assets/royal-sheru-bhai-name-wallpaper.png'),
      preloadImage('assets/sheru-bhai-logo-768x768.jpg'),
      waitFonts
    ]).then(() => {
      assetsReady = true;
    });

    // Safety fallback so loading never stalls
    setTimeout(() => { assetsReady = true; }, 3200);

    const minDurationMs = 2400;
    const startTs = performance.now();
    let tipIdx = 0;
    let finished = false;
    const trackEl = el.loadingBarFill ? el.loadingBarFill.parentElement : null;

    const tipInterval = setInterval(() => {
      tipIdx = (tipIdx + 1) % loadingTips.length;
      if (el.loadingTipText) {
        el.loadingTipText.innerHTML = loadingTips[tipIdx];
      }
    }, 1400);

    function finishLoading() {
      if (finished) return;
      finished = true;
      clearInterval(tipInterval);
      if (el.loadingBarFill) el.loadingBarFill.style.width = '100%';
      if (el.loadingPercent) el.loadingPercent.textContent = '100%';
      if (el.loadingStatusText) el.loadingStatusText.textContent = 'Welcome, Sheru Bhai!';
      if (trackEl) trackEl.setAttribute('aria-valuenow', '100');

      gameState = 'MENU';
      el.mainMenu.classList.remove('hidden');
      el.mainMenu.classList.add('active');
      el.loadingScreen.classList.add('fade-out');

      setTimeout(() => {
        el.loadingScreen.classList.add('hidden');
      }, 580);
    }

    if (el.btnSkipLoading) {
      el.btnSkipLoading.addEventListener('click', () => {
        AUDIO.ensureContext();
        AUDIO.playSfx('click');
        finishLoading();
      });
    }

    function tickLoading(now) {
      if (finished) return;
      const elapsed = now - startTs;
      const rawRatio = Math.min(1, elapsed / minDurationMs);
      // Ease out smoothly, capping at 94% until assets finish decoding
      const eased = 1 - Math.pow(1 - rawRatio, 2.2);
      const maxPct = assetsReady ? 100 : 94;
      const pct = Math.min(maxPct, Math.floor(eased * 100));

      if (el.loadingBarFill) el.loadingBarFill.style.width = `${pct}%`;
      if (el.loadingPercent) el.loadingPercent.textContent = `${pct}%`;
      if (trackEl) trackEl.setAttribute('aria-valuenow', String(pct));

      let status = loadingSteps[0].text;
      for (const s of loadingSteps) {
        if (pct >= s.at) status = s.text;
      }
      if (el.loadingStatusText) el.loadingStatusText.textContent = status;

      if (pct >= 100 && assetsReady) {
        setTimeout(finishLoading, 320);
        return;
      }
      requestAnimationFrame(tickLoading);
    }

    requestAnimationFrame(tickLoading);
  }

  // Init
  refreshMenuUI();
  render();
  startLoadingScreen();
  requestAnimationFrame(loop);
})();
