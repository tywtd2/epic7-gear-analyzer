"use strict";

// A finished left-side piece at this percent or higher counts as a high roll.
var HIGH_ROLL_PERCENT = 80;
// A right-side piece whose matching stats rolled high enough to keep.
var MATCH_PERCENT = 70;

function isFlatMain(main) {
  return tables.flatStats.indexOf(main) !== -1;
}

function isRightSide(slot) {
  return tables.rightSlots.indexOf(slot) !== -1;
}

function isLeftSide(slot) {
  return tables.leftSlots.indexOf(slot) !== -1;
}

function speedSub(subs) {
  var i;
  for (i = 0; i < subs.length; i++) {
    if (subs[i].stat === "speed") {
      return subs[i].value;
    }
  }
  return 0;
}

function countStats(subs, ids) {
  var count = 0;
  var i;
  for (i = 0; i < subs.length; i++) {
    if (ids.indexOf(subs[i].stat) !== -1) {
      count = count + 1;
    }
  }
  return count;
}

function coreCount(subs) {
  return countStats(subs, tables.corePercents);
}

function offensiveCount(subs) {
  return countStats(subs, tables.offensivePercents);
}

function onlyFlats(subs) {
  var i;
  if (subs.length === 0) {
    return false;
  }
  for (i = 0; i < subs.length; i++) {
    if (tables.flatStats.indexOf(subs[i].stat) === -1) {
      return false;
    }
  }
  return true;
}

function singleRollMax(level) {
  if (level === "88") {
    return 5;
  }
  return 4;
}

function nextEnhance(enhance) {
  var steps = tables.enhanceSteps;
  var i;
  for (i = 0; i < steps.length - 1; i++) {
    if (steps[i] === enhance) {
      return steps[i + 1];
    }
  }
  return enhance;
}

function withNext(template, enhance) {
  return template.replace("{next}", String(nextEnhance(enhance)));
}

function decision(text, extra, tone) {
  return { text: text, extra: extra, tone: tone };
}

function isSpeedBoots(piece) {
  return piece.slot === "boots" && piece.main === "speed";
}

function offensiveMain(piece) {
  return piece.main === "attack" || piece.main === "critChance" || piece.main === "critDamage";
}

function tankMain(piece) {
  return piece.main === "health" || piece.main === "defense";
}

function speedIsStrong(piece) {
  var mark = tables.speedStrongAt[String(piece.enhance)];
  if (piece.level === "88") {
    mark = mark + 1;
  }
  return speedSub(piece.subs) >= mark;
}

// Epic already shows four subs. Other grades can still reveal a sub at +12.
function speedMissed(piece) {
  var speed = speedSub(piece.subs);
  var visible = tables.substatCounts[piece.grade][String(piece.enhance)];
  return visible === 4 && piece.enhance >= 6 && speed > 0 && speed <= singleRollMax(piece.level) && coreCount(piece.subs) === 0;
}

function statIdsForKeep(piece) {
  if (isSpeedBoots(piece) || tankMain(piece) || isLeftSide(piece.slot)) {
    return tables.corePercents;
  }
  if (offensiveMain(piece)) {
    return tables.offensivePercents;
  }
  return [];
}

function relevantScore(piece, scored) {
  var ids = statIdsForKeep(piece);
  var points = 0;
  var max = 0;
  var i;
  if (!scored) {
    return null;
  }
  for (i = 0; i < scored.lines.length; i++) {
    if (ids.indexOf(scored.lines[i].stat) !== -1) {
      points = points + scored.lines[i].points;
      max = max + scored.lines[i].rolls * 100;
    }
  }
  return {
    points: points,
    max: max,
    percent: max > 0 ? Math.floor(points * 100 / max) : 0
  };
}

function speedCeiling(piece) {
  var speed = speedSub(piece.subs);
  var used = tables.rollTotals[piece.grade][String(piece.enhance)];
  var remaining = tables.rollTotals[piece.grade]["15"] - used;
  if (remaining < 0) {
    remaining = 0;
  }
  if (speed === 0) {
    return 0;
  }
  return speed + remaining * singleRollMax(piece.level);
}

function unfinishedBoots(piece, scored) {
  var cores = coreCount(piece.subs);
  if (onlyFlats(piece.subs)) {
    return decision(strings.sellOnlyFlats, "", "tone-sell");
  }
  if (cores === 0) {
    return decision(strings.sellSpeedBootsThin, "", "tone-sell");
  }
  if (rollsTooLowToFinish(piece, scored)) {
    return decision(strings.sellRollsLow, "", "tone-sell");
  }
  if (cores >= 2) {
    return decision(withNext(strings.worthStats, piece.enhance), "", "tone-keep");
  }
  return decision(withNext(strings.lookAgainOne, piece.enhance), "", "tone-extract");
}

function keepBar(piece) {
  if (isSpeedBoots(piece) && coreCount(piece.subs) >= 1) {
    return MATCH_PERCENT;
  }
  if (isLeftSide(piece.slot) && coreCount(piece.subs) >= 2) {
    return HIGH_ROLL_PERCENT;
  }
  if (isRightSide(piece.slot) && offensiveMain(piece) && offensiveCount(piece.subs) >= 2) {
    return MATCH_PERCENT;
  }
  if (isRightSide(piece.slot) && tankMain(piece) && coreCount(piece.subs) >= 2) {
    return MATCH_PERCENT;
  }
  return 0;
}

// From +6 on, all four lines are known. Perfect rolls on the stats that matter still have to clear the keep line.
function rollsTooLowToFinish(piece, scored) {
  var visible = tables.substatCounts[piece.grade][String(piece.enhance)];
  var relevant;
  var rolled;
  var remaining;
  var ceiling;
  var bar;
  if (piece.enhance < 6 || !scored || visible < 4 || speedIsStrong(piece)) {
    return false;
  }
  bar = keepBar(piece);
  if (bar === 0) {
    return false;
  }
  relevant = relevantScore(piece, scored);
  rolled = relevant.max / 100;
  if (rolled === 0) {
    return true;
  }
  remaining = tables.rollTotals[piece.grade]["15"] - scored.max / 100;
  if (remaining < 0) {
    remaining = 0;
  }
  ceiling = (relevant.points + remaining * 100) * 100 / ((rolled + remaining) * 100);
  return ceiling < bar;
}

// One real stat, or a low speed that can never reach 15, cannot become a keep.
function noPathLeft(piece) {
  var visible = tables.substatCounts[piece.grade][String(piece.enhance)];
  if (piece.enhance < 6 || visible < 4 || isSpeedBoots(piece) || speedIsStrong(piece)) {
    return false;
  }
  if (coreCount(piece.subs) >= 2) {
    return false;
  }
  if (speedSub(piece.subs) > 0 && speedCeiling(piece) >= 15) {
    return false;
  }
  return true;
}

function unfinished(piece, scored) {
  var cores = coreCount(piece.subs);
  var speed = speedSub(piece.subs);
  if (isSpeedBoots(piece)) {
    return unfinishedBoots(piece, scored);
  }
  if (onlyFlats(piece.subs)) {
    return decision(strings.sellOnlyFlats, "", "tone-sell");
  }
  if (cores === 0 && speed === 0) {
    return decision(strings.sellThin, "", "tone-sell");
  }
  if (speedMissed(piece)) {
    return decision(strings.sellSpeedMissed, "", "tone-sell");
  }
  if (noPathLeft(piece)) {
    return decision(strings.sellNoHope, "", "tone-sell");
  }
  if (rollsTooLowToFinish(piece, scored)) {
    return decision(strings.sellRollsLow, "", "tone-sell");
  }
  if (cores >= 2) {
    return decision(withNext(strings.worthStats, piece.enhance), "", "tone-keep");
  }
  if (speed > 0 && cores >= 1 && speedIsStrong(piece)) {
    return decision(withNext(strings.worthSpeedAndStat, piece.enhance), "", "tone-keep");
  }
  if (speed > 0 && speedIsStrong(piece)) {
    return decision(withNext(strings.worthSpeed, piece.enhance), "", "tone-keep");
  }
  if (speed > 0) {
    return decision(withNext(strings.lookAgainSpeed, piece.enhance), "", "tone-extract");
  }
  return decision(withNext(strings.lookAgainOne, piece.enhance), "", "tone-extract");
}

function matchedKeep(piece, percent) {
  if (percent < MATCH_PERCENT) {
    return false;
  }
  if (offensiveMain(piece)) {
    return offensiveCount(piece.subs) >= 2;
  }
  if (tankMain(piece)) {
    return coreCount(piece.subs) >= 2;
  }
  return false;
}

function matchedLow(piece, scored) {
  if (!scored) {
    return false;
  }
  if (offensiveMain(piece)) {
    return offensiveCount(piece.subs) >= 2;
  }
  if (tankMain(piece)) {
    return coreCount(piece.subs) >= 2;
  }
  return false;
}

function finishedBoots(piece, percent) {
  if (coreCount(piece.subs) >= 1 && percent >= MATCH_PERCENT) {
    return decision(strings.keepSpeedBoots, "", "tone-keep");
  }
  if (coreCount(piece.subs) >= 1) {
    return decision(strings.extractRollsLow, "", "tone-extract");
  }
  return decision(strings.keepSpeedBootsWeakEnd, "", "tone-extract");
}

function finished(piece, scored) {
  var speed = speedSub(piece.subs);
  var cores = coreCount(piece.subs);
  var relevant = relevantScore(piece, scored);
  var percent = relevant ? relevant.percent : 0;
  if (isSpeedBoots(piece)) {
    return finishedBoots(piece, percent);
  }
  if (speed >= 15) {
    return decision(strings.keepSpeedHigh, "", "tone-keep");
  }
  if (matchedKeep(piece, percent)) {
    return decision(strings.keepMatched, "", "tone-keep");
  }
  if (isLeftSide(piece.slot) && cores >= 2 && percent >= HIGH_ROLL_PERCENT) {
    return decision(strings.keepLeft, "", "tone-keep");
  }
  if (matchedLow(piece, scored)) {
    return decision(strings.extractRollsLow, "", "tone-extract");
  }
  if (cores === 0 && speed === 0) {
    return decision(strings.finishedEmpty, "", "tone-extract");
  }
  return decision(strings.extractNotGood, "", "tone-extract");
}

function verdict(piece, scored) {
  if (isRightSide(piece.slot) && isFlatMain(piece.main)) {
    if (piece.enhance === 15) {
      return decision(strings.extractFlat, "", "tone-extract");
    }
    return decision(strings.sellFlat, "", "tone-sell");
  }
  if (piece.subs.length === 0) {
    return decision(strings.noSubs, "", "tone-neutral");
  }
  if (piece.enhance < 15) {
    return unfinished(piece, scored);
  }
  return finished(piece, scored);
}
