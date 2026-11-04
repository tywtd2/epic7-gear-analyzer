"use strict";

function reforgeBonus(stat, rollCount) {
  var table;
  if (rollCount < 1 || rollCount > tables.maxRolls) {
    return 0;
  }
  if (stat === "speed") {
    table = tables.reforge.speed;
  } else if (stat === "critChance") {
    table = tables.reforge.critChance;
  } else if (stat === "critDamage") {
    table = tables.reforge.critDamage;
  } else if (stat === "flatAttack") {
    table = tables.reforge.flatAttack;
  } else if (stat === "flatDefense") {
    table = tables.reforge.flatDefense;
  } else if (stat === "flatHealth") {
    table = tables.reforge.flatHealth;
  } else {
    table = tables.reforge.percent;
  }
  return table[rollCount - 1];
}

function rollRange(level, stat, rollCount) {
  var band = level === "90" ? "85" : level;
  var base = tables.rollRanges[band][stat];
  var min = base.min * rollCount;
  var max = base.max * rollCount;
  var bonus = 0;
  if (level === "90") {
    bonus = reforgeBonus(stat, rollCount);
    min = min + bonus;
    max = max + bonus;
  }
  return { min: min, max: max };
}

function possibleRollCounts(level, stat, value, minRolls, maxRolls) {
  var counts = [];
  var rolls;
  for (rolls = minRolls; rolls <= maxRolls; rolls++) {
    var range = rollRange(level, stat, rolls);
    if (value >= range.min && value <= range.max) {
      counts.push(rolls);
    }
  }
  return counts;
}

// Keep the split whose values sit closest to the middle of each range.
function assignRolls(level, subs, totalRolls) {
  var count = subs.length;
  var choices = [];
  var index = [];
  var bestRolls = null;
  var bestDistance = 0;
  var maxForOne;
  var i;

  if (count === 0) {
    if (totalRolls === 0) {
      return { ok: true, rolls: [] };
    }
    return { ok: false };
  }

  maxForOne = totalRolls - (count - 1);
  if (maxForOne > tables.maxRolls) {
    maxForOne = tables.maxRolls;
  }
  if (maxForOne < 1) {
    return { ok: false };
  }

  for (i = 0; i < count; i++) {
    var found = possibleRollCounts(level, subs[i].stat, subs[i].value, 1, maxForOne);
    if (found.length === 0) {
      return { ok: false };
    }
    choices.push(found);
    index.push(0);
  }

  while (true) {
    var rolls = [];
    var sum = 0;
    for (i = 0; i < count; i++) {
      var n = choices[i][index[i]];
      rolls.push(n);
      sum = sum + n;
    }

    if (sum === totalRolls) {
      var distance = 0;
      for (i = 0; i < count; i++) {
        var range = rollRange(level, subs[i].stat, rolls[i]);
        var width = range.max - range.min;
        if (width > 0) {
          var mid = (range.min + range.max) / 2;
          distance = distance + Math.abs(subs[i].value - mid) / width;
        }
      }
      if (bestRolls === null || distance + 1e-9 < bestDistance) {
        var saved = [];
        var copy;
        for (copy = 0; copy < count; copy++) {
          saved.push(rolls[copy]);
        }
        bestRolls = saved;
        bestDistance = distance;
      }
    }

    var digit = count - 1;
    while (digit >= 0 && index[digit] === choices[digit].length - 1) {
      index[digit] = 0;
      digit = digit - 1;
    }
    if (digit < 0) {
      break;
    }
    index[digit] = index[digit] + 1;
  }

  if (bestRolls === null) {
    return { ok: false };
  }
  return { ok: true, rolls: bestRolls };
}

// One line keeps at least one roll, and every other visible line keeps one too.
function maxRollsOnOneLine(grade, enhance) {
  var visible = tables.substatCounts[grade][String(enhance)];
  var total = tables.rollTotals[grade][String(enhance)];
  var room;
  if (visible < 1 || total < 1) {
    return 0;
  }
  room = total - (visible - 1);
  if (room > tables.maxRolls) {
    room = tables.maxRolls;
  }
  if (room < 1) {
    room = 1;
  }
  return room;
}

function statSpan(level, stat, grade, enhance) {
  var rolls = maxRollsOnOneLine(grade, enhance);
  var low;
  var high;
  if (rolls < 1) {
    return null;
  }
  low = rollRange(level, stat, 1);
  high = rollRange(level, stat, rolls);
  return { min: low.min, max: high.max };
}

function rollsFit(level, subs, rollCounts, totalRolls) {
  var sum = 0;
  var i;
  if (rollCounts.length !== subs.length) {
    return { ok: false, reason: "count" };
  }
  for (i = 0; i < rollCounts.length; i++) {
    var rolls = rollCounts[i];
    var range;
    if (rolls < 1 || rolls > tables.maxRolls) {
      return { ok: false, reason: "count" };
    }
    range = rollRange(level, subs[i].stat, rolls);
    if (subs[i].value < range.min || subs[i].value > range.max) {
      return { ok: false, reason: "range" };
    }
    sum = sum + rolls;
  }
  if (sum !== totalRolls) {
    return { ok: false, reason: "sum", total: totalRolls };
  }
  return { ok: true, total: totalRolls };
}
