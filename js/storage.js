// ============================================================================
// SHERU BHAI – ROYAL ENDLESS RUN | LOCALSTORAGE SAVE & ONE-BY-ONE MISSION SYSTEM
// ============================================================================

window.GAME_STORAGE = (() => {
  const SAVE_KEY = 'sheru_bhai_royal_save_v1';

  const defaultSave = () => ({
    bestScore: 0,
    totalCoins: 0,
    totalGems: 0,
    totalCrowns: 0,
    unlockedSkins: ['classic'],
    selectedSkin: 'classic',
    unlockedWorlds: ['palace'],
    selectedWorld: 'palace',
    currentMissionId: 1,
    completedMissions: [],
    missionProgress: {},
    achievements: [],
    settings: {
      musicVolume: 0.6,
      sfxVolume: 0.8,
      musicTrack: 'playlist',
      difficulty: 'normal',
      particles: true,
      screenShake: true
    },
    stats: {
      runs: 0,
      distanceTotal: 0,
      coinsTotal: 0,
      gemsTotal: 0,
      jumpObstacles: 0,
      slideObstacles: 0,
      avoidObstacles: 0,
      avoidMoving: 0,
      coinLines: 0,
      bestRunScore: 0,
      bestRunCoins: 0,
      bestRunAvoid: 0,
      bestSurviveTime: 0,
      bestNoHitTime: 0,
      bestMaxSpeedTime: 0,
      powerupsUsedTotal: 0,
      powerupTypesUsed: [],
      powerupTypeCounts: {},
      survivedSandstorm: 0,
      noShieldRuns: 0,
      bossesDefeated: 0,
      finalBossDefeated: 0,
      worldDistance: {}
    }
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      const base = defaultSave();
      return {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed.settings || {}) },
        stats: { ...base.stats, ...(parsed.stats || {}) }
      };
    } catch (e) {
      console.warn('Save load failed, using defaults:', e);
      return defaultSave();
    }
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Save write failed:', e);
    }
  }

  function reset() {
    state = defaultSave();
    save();
    return state;
  }

  function getState() {
    return state;
  }

  function isChapterUnlocked(chapter) {
    if (chapter === 1) return true;
    const prevChapterFinalId = (chapter - 1) * 10;
    return state.completedMissions.includes(prevChapterFinalId);
  }

  function getCurrentMission() {
    const id = state.currentMissionId || 1;
    return window.GAME_DATA.MISSIONS.find(m => m.id === id) || window.GAME_DATA.MISSIONS[0];
  }

  function getMissionTarget(mission) {
    return mission.type === 'complete_chapter' ? 60 : mission.target;
  }

  function getMissionCurrentValue(mission) {
    if (state.completedMissions.includes(mission.id)) {
      return getMissionTarget(mission);
    }
    if (mission.type === 'unlock_all_worlds') {
      return state.unlockedWorlds.length;
    }
    if (mission.type === 'unique_powerups') {
      return state.stats.powerupTypesUsed.length;
    }
    return Math.floor(state.missionProgress[mission.id] || 0);
  }

  // Only increments progress for the SINGLE currently active mission!
  function addActiveMissionDelta(type, amount, extra = null) {
    const m = getCurrentMission();
    if (!m || state.completedMissions.includes(m.id)) return;
    if (m.type !== type) return;
    if (m.extra && m.extra !== extra) return;
    state.missionProgress[m.id] = (state.missionProgress[m.id] || 0) + amount;
  }

  // Updates single-run / state-based progress ONLY for the active mission
  function syncActiveMissionRunState(runSnap) {
    const m = getCurrentMission();
    if (!m || state.completedMissions.includes(m.id) || !runSnap) return;

    switch (m.type) {
      case 'survive_time':
      case 'complete_chapter':
        state.missionProgress[m.id] = Math.floor(runSnap.elapsed);
        break;
      case 'no_hit_time':
        state.missionProgress[m.id] = Math.floor(runSnap.noHitTime);
        break;
      case 'max_speed_time':
        state.missionProgress[m.id] = Math.floor(runSnap.maxSpeedTime);
        break;
      case 'score_run':
        state.missionProgress[m.id] = Math.floor(runSnap.score);
        break;
      case 'coins_run':
        state.missionProgress[m.id] = runSnap.coins;
        break;
      case 'avoid_run':
        state.missionProgress[m.id] = runSnap.dodged;
        break;
      case 'no_shield_run':
        if (!runSnap.usedShield && runSnap.elapsed >= 60) {
          state.missionProgress[m.id] = 1;
        }
        break;
    }
  }

  // Evaluates ONLY the active mission so missions complete strictly one by one
  function evaluateActiveMission() {
    const m = getCurrentMission();
    if (!m || state.completedMissions.includes(m.id)) return null;

    const val = getMissionCurrentValue(m);
    const target = getMissionTarget(m);

    if (val >= target) {
      state.missionProgress[m.id] = target;
      state.completedMissions.push(m.id);
      state.totalCoins += m.rewardCoins;
      state.totalGems += m.rewardGems;
      save();
      return m;
    }
    return null;
  }

  function advanceToNextMission() {
    const currentId = state.currentMissionId || 1;
    const next = window.GAME_DATA.MISSIONS.find(
      m => m.id > currentId && !state.completedMissions.includes(m.id)
    ) || window.GAME_DATA.MISSIONS.find(
      m => !state.completedMissions.includes(m.id)
    );
    if (next) {
      state.currentMissionId = next.id;
      save();
    }
    return getCurrentMission();
  }

  function evaluateAchievements() {
    const s = state.stats;
    const checks = {
      first_run: s.runs >= 1,
      coin_collector: s.coinsTotal >= 500,
      royal_jumper: s.jumpObstacles >= 100,
      master_dodger: s.avoidObstacles >= 200,
      speed_king: s.bestRunScore >= 5000,
      gem_hunter: s.gemsTotal >= 25,
      mission_master: state.completedMissions.length >= 25,
      boss_slayer: s.bossesDefeated >= 1,
      royal_champion: state.unlockedWorlds.length >= 4,
      legendary_sheru: s.finalBossDefeated >= 1
    };

    const unlockedNow = [];
    for (const ach of window.GAME_DATA.ACHIEVEMENTS) {
      if (!state.achievements.includes(ach.id) && checks[ach.id]) {
        state.achievements.push(ach.id);
        state.totalCrowns += ach.rewardCrowns;
        unlockedNow.push(ach);
      }
    }
    if (unlockedNow.length > 0) save();
    return unlockedNow;
  }

  return {
    getState,
    save,
    reset,
    isChapterUnlocked,
    getCurrentMission,
    getMissionTarget,
    getMissionCurrentValue,
    addActiveMissionDelta,
    syncActiveMissionRunState,
    evaluateActiveMission,
    advanceToNextMission,
    evaluateAchievements
  };
})();
