// LocalStorage Persistence for ZUNO

const DEFAULT_PROFILE = {
  username: "Alex",
  title: "Legend",
  level: 28,
  xp: 12490,
  xpNextLevel: 15000,
  coins: 4500,
  avatar: "🎮",
  streak: 5,
  gamesPlayed: 47,
  achievementsCount: 12,
  completedMissions: {
    tictactoe: false,
    snake: false,
    quiz: false,
    creative: false,
    spin: false,
  },
  savedIdeas: [],
  bestScores: {
    memory: null,
    snake: 0,
    flappy: 0,
    quizStreak: 0,
  },
};

export const getProfile = () => {
  try {
    const data = localStorage.getItem("zuno_user_profile");
    if (!data) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile) => {
  try {
    localStorage.setItem("zuno_user_profile", JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile:", err);
  }
};

export const addXPAndCoins = (xpToAdd = 50, coinsToAdd = 100) => {
  const current = getProfile();
  let newXP = current.xp + xpToAdd;
  let newLevel = current.level;
  let newXPNext = current.xpNextLevel;

  while (newXP >= newXPNext) {
    newLevel += 1;
    newXP -= newXPNext;
    newXPNext = Math.round(newXPNext * 1.2);
  }

  const updated = {
    ...current,
    xp: newXP,
    level: newLevel,
    xpNextLevel: newXPNext,
    coins: current.coins + coinsToAdd,
  };
  saveProfile(updated);
  return updated;
};

export const recordMissionCompletion = (missionKey) => {
  const current = getProfile();
  if (current.completedMissions && current.completedMissions[missionKey]) {
    return current;
  }
  const updatedMissions = {
    ...current.completedMissions,
    [missionKey]: true,
  };
  const updated = {
    ...current,
    completedMissions: updatedMissions,
    coins: current.coins + 1000,
    xp: current.xp + 250,
  };
  saveProfile(updated);
  return updated;
};
