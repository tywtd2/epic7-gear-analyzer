"use strict";

// Under 72 and 72-84 use the older ranges published by meowyih.
// Level 85 flats are the Korean chart: attack 31-46, defense 25-34, health 149-202.
// Level 88 flats were not confirmed as their own published chart. They are the
// 85 flats stepped up by 1 on the minimum and the maximum, the same step as
// Attack % 4-8 to 5-9. Level 90 uses the 85 ranges plus the reforge bonus.
var tables = {
  maxRolls: 6,
  enhanceSteps: [0, 3, 6, 9, 12, 15],
  leftSlots: ["weapon", "helmet", "armor"],
  rightSlots: ["necklace", "ring", "boots"],
  slotOrder: ["weapon", "helmet", "armor", "necklace", "ring", "boots"],
  gradeOrder: ["normal", "good", "rare", "heroic", "epic"],
  levelOrder: ["under72", "72-84", "85", "88", "90"],
  substats: [
    "attack", "health", "defense", "critChance", "critDamage",
    "effectiveness", "effectResistance", "speed",
    "flatAttack", "flatDefense", "flatHealth"
  ],
  flatStats: ["flatAttack", "flatDefense", "flatHealth"],
  corePercents: ["attack", "health", "defense", "critChance", "critDamage"],
  offensivePercents: ["attack", "critChance", "critDamage"],
  // Speed alone is worth finishing only once it is already past one low roll.
  // +0 is one roll, so it cannot qualify.
  speedStrongAt: { "0": 99, "3": 8, "6": 10, "9": 12, "12": 15 },
  mains: {
    weapon: ["flatAttack"],
    helmet: ["flatHealth"],
    armor: ["flatDefense"],
    necklace: ["attack", "health", "defense", "critChance", "critDamage"],
    ring: [
      "attack", "health", "defense", "effectiveness", "effectResistance",
      "flatAttack", "flatHealth", "flatDefense"
    ],
    boots: [
      "attack", "health", "defense", "speed",
      "flatAttack", "flatHealth", "flatDefense"
    ]
  },
  // How many substat rows are visible.
  substatCounts: {
    normal: { "0": 0, "3": 1, "6": 2, "9": 3, "12": 4, "15": 4 },
    good: { "0": 1, "3": 2, "6": 3, "9": 4, "12": 4, "15": 4 },
    rare: { "0": 2, "3": 2, "6": 2, "9": 3, "12": 4, "15": 4 },
    heroic: { "0": 3, "3": 3, "6": 3, "9": 3, "12": 4, "15": 4 },
    epic: { "0": 4, "3": 4, "6": 4, "9": 4, "12": 4, "15": 4 }
  },
  // Innate lines plus one roll at each +3 step. Epic +0 is 4.
  rollTotals: {
    normal: { "0": 0, "3": 1, "6": 2, "9": 3, "12": 4, "15": 5 },
    good: { "0": 1, "3": 2, "6": 3, "9": 4, "12": 5, "15": 6 },
    rare: { "0": 2, "3": 3, "6": 4, "9": 5, "12": 6, "15": 7 },
    heroic: { "0": 3, "3": 4, "6": 5, "9": 6, "12": 7, "15": 8 },
    epic: { "0": 4, "3": 5, "6": 6, "9": 7, "12": 8, "15": 9 }
  },
  // Bonus added at level 90. Index 0 is 1 roll. Reforge does not reroll.
  reforge: {
    speed: [0, 1, 2, 3, 4, 4],
    percent: [1, 3, 4, 5, 7, 8],
    critChance: [1, 2, 3, 4, 5, 6],
    critDamage: [1, 2, 3, 4, 6, 7],
    flatAttack: [11, 22, 33, 44, 55, 66],
    flatDefense: [9, 18, 27, 36, 45, 54],
    flatHealth: [56, 112, 168, 224, 280, 336]
  },
  rollRanges: {
    under72: {
      attack: { min: 3, max: 7 },
      health: { min: 3, max: 7 },
      defense: { min: 3, max: 7 },
      effectiveness: { min: 3, max: 7 },
      effectResistance: { min: 3, max: 7 },
      critChance: { min: 2, max: 4 },
      critDamage: { min: 3, max: 6 },
      speed: { min: 1, max: 4 },
      flatAttack: { min: 28, max: 42 },
      flatDefense: { min: 23, max: 30 },
      flatHealth: { min: 124, max: 180 }
    },
    "72-84": {
      attack: { min: 4, max: 8 },
      health: { min: 4, max: 8 },
      defense: { min: 4, max: 8 },
      effectiveness: { min: 4, max: 8 },
      effectResistance: { min: 4, max: 8 },
      critChance: { min: 3, max: 5 },
      critDamage: { min: 3, max: 7 },
      speed: { min: 1, max: 4 },
      flatAttack: { min: 30, max: 46 },
      flatDefense: { min: 25, max: 33 },
      flatHealth: { min: 147, max: 202 }
    },
    "85": {
      attack: { min: 4, max: 8 },
      health: { min: 4, max: 8 },
      defense: { min: 4, max: 8 },
      effectiveness: { min: 4, max: 8 },
      effectResistance: { min: 4, max: 8 },
      critChance: { min: 3, max: 5 },
      critDamage: { min: 4, max: 7 },
      speed: { min: 1, max: 4 },
      flatAttack: { min: 31, max: 46 },
      flatDefense: { min: 25, max: 34 },
      flatHealth: { min: 149, max: 202 }
    },
    "88": {
      attack: { min: 5, max: 9 },
      health: { min: 5, max: 9 },
      defense: { min: 5, max: 9 },
      effectiveness: { min: 5, max: 9 },
      effectResistance: { min: 5, max: 9 },
      critChance: { min: 3, max: 6 },
      critDamage: { min: 4, max: 8 },
      speed: { min: 2, max: 5 },
      flatAttack: { min: 32, max: 47 },
      flatDefense: { min: 26, max: 35 },
      flatHealth: { min: 150, max: 203 }
    }
  }
};
