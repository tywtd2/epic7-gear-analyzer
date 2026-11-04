"use strict";

// A finished left-side piece at this percent or higher counts as a high roll.
var HIGH_ROLL_PERCENT = 80;
// A right-side piece whose stats match the main stat.
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

function unfinishedBoots(piece) {
  var cores = coreCount(piece.subs);
  if (onlyFlats(piece.subs)) {
    return decision(strings.sellOnlyFlats, "", "tone-sell");
  }
  if (cores >= 2) {
    return decision(withNext(strings.worthStats, piece.enhance), "", "tone-keep");
  }
  if (cores === 1) {
    return decision(withNext(strings.lookAgainOne, piece.enhance), "", "tone-extract");
  }
  return decision(strings.sellSpeedBootsThin, "", "tone-sell");
}

function unfinished(piece) {
  var cores = coreCount(piece.subs);
  var speed = speedSub(piece.subs);
  if (isSpeedBoots(piece)) {
    return unfinishedBoots(piece);
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
  if (cores >= 2) {
    return decision(withNext(strings.worthStats, piece.enhance), "", "tone-keep");
  }
  if (speed > 0 && cores >= 1) {
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

function finishedBoots(piece) {
  if (coreCount(piece.subs) >= 1) {
    return decision(strings.keepSpeedBoots, "", "tone-keep");
  }
  return decision(strings.keepSpeedBootsWeakEnd, strings.keepSpeedBootsWeakNew, "tone-extract");
}

function finished(piece, scored) {
  var speed = speedSub(piece.subs);
  var cores = coreCount(piece.subs);
  var percent = scored ? scored.percent : 0;
  if (isSpeedBoots(piece)) {
    return finishedBoots(piece);
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
    return decision(strings.matchedLowEnd, strings.matchedLowNew, "tone-extract");
  }
  if (speed >= 9) {
    return decision(strings.speedMidEnd, strings.speedMidNew, "tone-extract");
  }
  if (cores === 0 && speed === 0) {
    return decision(strings.finishedEmpty, "", "tone-extract");
  }
  return decision(strings.finishedMixedEnd, strings.finishedMixedNew, "tone-extract");
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
    return unfinished(piece);
  }
  return finished(piece, scored);
}
