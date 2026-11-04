"use strict";

// Floor the raw sum, then floor the percent of that raw sum.
// Speed 3 on 1-4 is (3-1)/(4-1)*100 = 66.67, and 366.67 shows as 366 and 91%.
function scorePiece(level, subs, rollCounts) {
  var band = level === "90" ? "85" : level;
  var lines = [];
  var points = 0;
  var maxPoints = 0;
  var i;

  for (i = 0; i < subs.length; i++) {
    var stat = subs[i].stat;
    var value = subs[i].value;
    var rolls = rollCounts[i];
    var base = tables.rollRanges[band][stat];
    var bonus = level === "90" ? reforgeBonus(stat, rolls) : 0;
    var span = base.max - base.min;
    var linePoints = 0;
    var range = rollRange(level, stat, rolls);

    if (span !== 0) {
      linePoints = (value - base.min * rolls - bonus) * 100 / span;
    }
    if (tables.flatStats.indexOf(stat) !== -1) {
      linePoints = linePoints / 2;
    }

    points = points + linePoints;
    maxPoints = maxPoints + rolls * 100;
    lines.push({
      stat: stat,
      value: value,
      rolls: rolls,
      max: range.max,
      points: linePoints
    });
  }

  return {
    points: points,
    shown: Math.floor(points),
    percent: maxPoints > 0 ? Math.floor(points * 100 / maxPoints) : 0,
    max: maxPoints,
    lines: lines
  };
}

// Level 85 at +12 or +15. The bonus uses the roll count as it is now.
function reforgeOutlook(level, enhance, subs, rollCounts) {
  var lines = [];
  var i;
  if (level !== "85" || enhance < 12) {
    return lines;
  }
  for (i = 0; i < subs.length; i++) {
    var rolls = rollCounts[i];
    var next = subs[i].value + reforgeBonus(subs[i].stat, rolls);
    if (rolls >= 1 && rolls <= tables.maxRolls && next !== subs[i].value) {
      lines.push({
        stat: subs[i].stat,
        value: subs[i].value,
        next: next
      });
    }
  }
  return lines;
}
