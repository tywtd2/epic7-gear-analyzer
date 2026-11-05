"use strict";

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function optionsFromIds(ids, labels, skip) {
  var list = [];
  var i;
  for (i = 0; i < ids.length; i++) {
    if (ids[i] !== skip) {
      list.push({ value: ids[i], label: labels[ids[i]] });
    }
  }
  return list;
}

function fillSelect(select, options) {
  var previous = select.value;
  var i;
  select.innerHTML = "";
  for (i = 0; i < options.length; i++) {
    var option = document.createElement("option");
    option.value = options[i].value;
    option.textContent = options[i].label;
    select.appendChild(option);
  }
  select.value = previous;
  if (select.value === "") {
    select.selectedIndex = 0;
  }
}

function enhanceOptions() {
  var list = [];
  var i;
  for (i = 0; i < tables.enhanceSteps.length; i++) {
    var step = String(tables.enhanceSteps[i]);
    list.push({ value: step, label: strings.enhances[step] });
  }
  return list;
}

function firstUnusedStat(used) {
  var preferred = ["attack", "health", "defense", "critChance", "critDamage", "speed"];
  var lists = [preferred, tables.substats];
  var listIndex;
  var i;
  for (listIndex = 0; listIndex < lists.length; listIndex++) {
    var list = lists[listIndex];
    for (i = 0; i < list.length; i++) {
      if (!used[list[i]]) {
        return list[i];
      }
    }
  }
  return tables.substats[0];
}

function repairSubChoices() {
  var main = document.getElementById("main").value;
  var used = {};
  var n;
  used[main] = true;
  for (n = 1; n <= 4; n++) {
    var select = document.getElementById("sub-stat-" + n);
    if (!select.value || used[select.value]) {
      select.value = firstUnusedStat(used);
    }
    used[select.value] = true;
  }
}

function isPercentStat(stat) {
  return tables.flatStats.indexOf(stat) === -1 && stat !== "speed";
}

function formatAmount(stat, value) {
  if (isPercentStat(stat)) {
    return String(value) + "%";
  }
  return String(value);
}

function limitSubOptions() {
  var main = document.getElementById("main").value;
  var values = [];
  var n;
  var i;
  for (n = 1; n <= 4; n++) {
    values.push(document.getElementById("sub-stat-" + n).value);
  }
  for (n = 1; n <= 4; n++) {
    var options = [];
    for (i = 0; i < tables.substats.length; i++) {
      var id = tables.substats[i];
      var other;
      var taken = id === main;
      for (other = 0; other < values.length; other++) {
        if (other !== n - 1 && values[other] === id) {
          taken = true;
        }
      }
      if (!taken) {
        options.push({ value: id, label: strings.stats[id] });
      }
    }
    fillSelect(document.getElementById("sub-stat-" + n), options);
  }
}

function updateValueHints() {
  var level = document.getElementById("level").value;
  var grade = document.getElementById("grade").value;
  var enhance = document.getElementById("enhance").value;
  var n;
  for (n = 1; n <= 4; n++) {
    var stat = document.getElementById("sub-stat-" + n).value;
    var input = document.getElementById("sub-value-" + n);
    var span = stat ? statSpan(level, stat, grade, enhance) : null;
    var hint = "";
    if (span) {
      hint = "0" + (isPercentStat(stat) ? "% - " : " - ") + formatAmount(stat, span.max);
      input.max = String(span.max);
    } else {
      input.removeAttribute("max");
    }
    input.placeholder = hint;
    input.title = hint;
  }
}

function refreshSubSelects() {
  var main = document.getElementById("main").value;
  var options = optionsFromIds(tables.substats, strings.stats, main);
  var n;
  for (n = 1; n <= 4; n++) {
    fillSelect(document.getElementById("sub-stat-" + n), options);
  }
  repairSubChoices();
  limitSubOptions();
  updateValueHints();
}

function onSubStatChange(event) {
  var changed = event.target;
  var n;
  for (n = 1; n <= 4; n++) {
    var select = document.getElementById("sub-stat-" + n);
    if (select !== changed && select.value === changed.value) {
      select.value = "";
    }
  }
  repairSubChoices();
  limitSubOptions();
  updateValueHints();
}

function onSlotChange() {
  var slot = document.getElementById("slot").value;
  fillSelect(document.getElementById("main"), optionsFromIds(tables.mains[slot], strings.stats));
  refreshSubSelects();
}

function onMainChange() {
  refreshSubSelects();
}

function onLevelChange() {
  var level = document.getElementById("level").value;
  var enhance = document.getElementById("enhance");
  var note = document.getElementById("level-note");
  if (level === "90") {
    enhance.value = "15";
    enhance.disabled = true;
  } else {
    enhance.disabled = false;
  }
  if (level === "under72" || level === "72-84") {
    note.hidden = false;
    note.textContent = strings.olderRanges;
  } else {
    note.hidden = true;
    note.textContent = "";
  }
  onPieceShapeChange();
}

function onPieceShapeChange() {
  var grade = document.getElementById("grade").value;
  var enhance = document.getElementById("enhance").value;
  var count = tables.substatCounts[grade][enhance];
  var n;
  document.getElementById("substats").hidden = count === 0;
  for (n = 1; n <= 4; n++) {
    document.getElementById("sub-row-" + n).hidden = n > count;
  }
  updateValueHints();
}

function readWholeNumber(text) {
  var trimmed = text.trim();
  var value;
  if (trimmed === "") {
    return { ok: false, empty: true };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, empty: false };
  }
  value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { ok: false, empty: false };
  }
  return { ok: true, value: value };
}

function clearInvalidInputs() {
  var n;
  for (n = 1; n <= 4; n++) {
    document.getElementById("sub-value-" + n).classList.remove("invalid");
  }
}

function markInvalid(n) {
  document.getElementById("sub-value-" + n).classList.add("invalid");
}

function onValueInput(event) {
  event.target.classList.remove("invalid");
}

function rangeLabel(stat, span) {
  return formatAmount(stat, span.min) + " – " + formatAmount(stat, span.max);
}

function readForm() {
  var grade = document.getElementById("grade").value;
  var enhance = Number(document.getElementById("enhance").value);
  var level = document.getElementById("level").value;
  var main = document.getElementById("main").value;
  var count = tables.substatCounts[grade][String(enhance)];
  var subs = [];
  var seen = {};
  var emptyRows = [];
  var problem = "";
  var n;

  clearInvalidInputs();
  if (count === 0) {
    return { error: strings.noSubsYet };
  }

  for (n = 1; n <= count; n++) {
    var stat = document.getElementById("sub-stat-" + n).value;
    var parsed = readWholeNumber(document.getElementById("sub-value-" + n).value);
    var span;
    if (parsed.empty) {
      emptyRows.push(n);
      markInvalid(n);
      continue;
    }
    if (!parsed.ok) {
      markInvalid(n);
      if (problem === "") {
        problem = strings.notWhole.replace("{n}", String(n));
      }
      continue;
    }
    if (stat === main) {
      markInvalid(n);
      if (problem === "") {
        problem = strings.sameAsMain;
      }
      continue;
    }
    if (seen[stat]) {
      markInvalid(n);
      if (problem === "") {
        problem = strings.duplicate;
      }
      continue;
    }
    span = statSpan(level, stat, grade, String(enhance));
    if (!span || parsed.value < span.min || parsed.value > span.max) {
      markInvalid(n);
      if (problem === "") {
        problem = strings.outOfRange
          .replace("{name}", strings.stats[stat])
          .replace("{value}", String(parsed.value))
          .replace("{range}", span ? rangeLabel(stat, span) : "");
      }
      continue;
    }
    seen[stat] = true;
    subs.push({ stat: stat, value: parsed.value });
  }

  if (emptyRows.length === count) {
    return { error: strings.emptyAll };
  }
  if (emptyRows.length > 0) {
    return { error: strings.emptyOne.replace("{n}", String(emptyRows[0])) };
  }
  if (problem !== "") {
    return { error: problem };
  }

  return {
    error: "",
    slot: document.getElementById("slot").value,
    level: level,
    grade: grade,
    enhance: enhance,
    main: main,
    subs: subs
  };
}

function formatPoints(points) {
  var hundredths = Math.round(points * 100) / 100;
  if (hundredths === Math.trunc(hundredths)) {
    return String(hundredths);
  }
  return hundredths.toFixed(2);
}

function formatScore(scored) {
  return strings.scoreLine
    .replace("{score}", String(scored.shown))
    .replace("{max}", String(scored.max))
    .replace("{percent}", String(scored.percent));
}

function blankRolls(count) {
  var rolls = [];
  var i;
  for (i = 0; i < count; i++) {
    rolls.push("");
  }
  return rolls;
}

function readRollInputs() {
  var inputs = document.querySelectorAll(".roll-count");
  var rolls = [];
  var i;
  for (i = 0; i < inputs.length; i++) {
    var parsed = readWholeNumber(inputs[i].value);
    if (!parsed.ok || parsed.value < 1) {
      return { ok: false, rolls: [] };
    }
    rolls.push(parsed.value);
  }
  return { ok: true, rolls: rolls };
}

function appendText(parent, text) {
  parent.appendChild(document.createTextNode(text));
}

function buildDetailList(piece, rollCounts) {
  var box = document.getElementById("detail-text");
  var list = document.createElement("ul");
  var i;
  box.textContent = "";
  for (i = 0; i < piece.subs.length; i++) {
    var item = document.createElement("li");
    var input = document.createElement("input");
    var sub = piece.subs[i];
    input.type = "number";
    input.className = "roll-count";
    input.min = "1";
    input.max = String(tables.maxRolls);
    input.step = "1";
    input.setAttribute("aria-label", strings.rollCountLabel.replace("{name}", strings.stats[sub.stat]));
    if (rollCounts[i] !== "") {
      input.value = String(rollCounts[i]);
    }
    appendText(item, strings.detailLead.replace("{name}", strings.stats[sub.stat]));
    item.appendChild(input);
    appendText(item, " ");
    var unit = document.createElement("span");
    unit.className = "detail-unit";
    item.appendChild(unit);
    appendText(item, strings.detailColon + String(sub.value) + strings.detailSlash);
    var max = document.createElement("span");
    max.className = "detail-max";
    item.appendChild(max);
    appendText(item, strings.detailComma);
    var points = document.createElement("span");
    points.className = "detail-points";
    item.appendChild(points);
    appendText(item, strings.detailTail);
    list.appendChild(item);
  }
  box.appendChild(list);
}

function updateDetailFigures(piece, rollCounts, scored) {
  var items = document.querySelectorAll("#detail-text li");
  var i;
  for (i = 0; i < items.length; i++) {
    var rolls = rollCounts[i];
    var unit = rolls === 1 ? strings.oneTime : strings.manyTimes;
    var points = "—";
    items[i].querySelector(".detail-unit").textContent = unit;
    if (rolls >= 1 && rolls <= tables.maxRolls) {
      var range = rollRange(piece.level, piece.subs[i].stat, rolls);
      items[i].querySelector(".detail-max").textContent = String(range.max);
    } else {
      items[i].querySelector(".detail-max").textContent = "—";
    }
    if (scored) {
      points = formatPoints(scored.lines[i].points);
    }
    items[i].querySelector(".detail-points").textContent = points;
  }
}

function showReforge(piece, rollCounts, fit) {
  var el = document.getElementById("reforge-text");
  var outlook;
  var parts = [];
  var i;
  if (!fit || piece.level !== "85" || piece.enhance < 12) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  outlook = reforgeOutlook(piece.level, piece.enhance, piece.subs, rollCounts);
  for (i = 0; i < outlook.length; i++) {
    parts.push(strings.reforgeBit
      .replace("{name}", strings.stats[outlook[i].stat])
      .replace("{value}", String(outlook[i].value))
      .replace("{next}", String(outlook[i].next)));
  }
  if (parts.length === 0) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  if (piece.enhance === 12) {
    el.textContent = strings.reforgeOpen + " " + parts.join(" ") + " " + strings.reforgeLeft;
  } else {
    el.textContent = strings.reforgeDone + " " + parts.join(" ");
  }
}

function scoreMessage(piece, fit) {
  if (piece.subs.length === 0) {
    return strings.noSubs;
  }
  if (!fit.ok && fit.reason === "sum") {
    return strings.rollSum.replace("{total}", String(fit.total));
  }
  if (!fit.ok && fit.reason === "count") {
    return strings.badRoll;
  }
  return strings.outsideRange;
}

function rollsWereEntered(rollCounts) {
  var i;
  for (i = 0; i < rollCounts.length; i++) {
    if (rollCounts[i] === "") {
      return false;
    }
  }
  return true;
}

function present(piece, rollCounts, rebuild) {
  var totalRolls = tables.rollTotals[piece.grade][String(piece.enhance)];
  lastRolls = rollCounts.slice();
  var fit = { ok: false, reason: "range" };
  var scored = null;
  var hint = document.getElementById("detail-hint");
  if (rollsWereEntered(rollCounts)) {
    fit = rollsFit(piece.level, piece.subs, rollCounts, totalRolls);
  }
  if (fit.ok) {
    scored = scorePiece(piece.level, piece.subs, rollCounts);
  }
  showSummary(verdict(piece, scored));
  if (scored && scored.max > 0) {
    showScore(formatScore(scored), true);
  } else {
    showScore(scoreMessage(piece, fit), false);
  }
  if (piece.subs.length === 0) {
    showDetailMessage(strings.noSubs);
    hint.hidden = true;
  } else {
    if (rebuild) {
      buildDetailList(piece, rollCounts);
    }
    updateDetailFigures(piece, rollCounts, scored);
    hint.hidden = false;
    hint.textContent = strings.detailHint;
  }
  showReforge(piece, rollCounts, fit.ok);
}

var currentPiece = null;
var lastRolls = null;
var resultMode = "waiting";
var currentLanguage = "en";

function showSummary(result) {
  var panel = document.getElementById("results");
  var extra = document.getElementById("summary-extra");
  setText("summary-text", result.text);
  setText("summary-extra", result.extra);
  extra.hidden = result.extra === "";
  panel.className = "panel " + result.tone;
}

function showScore(text, withNote) {
  setText("score-text", text);
  document.getElementById("score-note").hidden = !withNote;
}

function showDetailMessage(text) {
  setText("detail-text", text);
}

function clearResultExtras() {
  document.getElementById("summary-extra").hidden = true;
  document.getElementById("detail-hint").hidden = true;
  document.getElementById("reforge-text").hidden = true;
  document.getElementById("reforge-text").textContent = "";
}

function showResultOnNarrowScreen() {
  if (window.matchMedia("(max-width: 56rem)").matches) {
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function onRollCountChange() {
  var read;
  if (!currentPiece) {
    return;
  }
  read = readRollInputs();
  if (!read.ok) {
    showScore(strings.badRoll, false);
    return;
  }
  present(currentPiece, read.rolls, false);
}

function onCalculate(event) {
  var piece;
  var totalRolls;
  var assigned;
  event.preventDefault();
  piece = readForm();
  if (piece.error) {
    currentPiece = null;
    resultMode = "error";
    showSummary({ text: piece.error, extra: "", tone: "tone-neutral" });
    showScore("", false);
    showDetailMessage("");
    clearResultExtras();
    showResultOnNarrowScreen();
    return;
  }

  currentPiece = piece;
  totalRolls = tables.rollTotals[piece.grade][String(piece.enhance)];
  assigned = assignRolls(piece.level, piece.subs, totalRolls);
  if (!assigned.ok) {
    currentPiece = null;
    resultMode = "error";
    showSummary({
      text: strings.impossibleSplit.replace("{piece}", strings.grades[piece.grade] + " " + strings.enhances[String(piece.enhance)]),
      extra: "",
      tone: "tone-neutral"
    });
    showScore("", false);
    showDetailMessage("");
    clearResultExtras();
    showResultOnNarrowScreen();
    return;
  }
  resultMode = "ready";
  present(piece, assigned.rolls, true);
  showResultOnNarrowScreen();
}

function languageFromLocation() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("lang");
  if (query === "tw" || query === "zh" || query === "zh-Hant" || query === "zh-TW" || query === "zh-HK") {
    return "zh-Hant";
  }
  if (query === "en") {
    return "en";
  }
  return "";
}

function savedLanguage() {
  var saved = "";
  try {
    saved = localStorage.getItem("epic7-gear-lang") || "";
  } catch (error) {
    saved = "";
  }
  if (saved === "zh-Hant" || saved === "en") {
    return saved;
  }
  return "";
}

function rememberLanguage(lang) {
  try {
    localStorage.setItem("epic7-gear-lang", lang);
  } catch (error) {
    return;
  }
}

function paintLanguage() {
  var n;
  document.documentElement.lang = currentLanguage === "zh-Hant" ? "zh-Hant" : "en";
  document.title = strings.title;
  setText("title", strings.title);
  setText("intro", strings.intro);
  setText("slot-label", strings.slot);
  setText("level-label", strings.level);
  setText("grade-label", strings.grade);
  setText("enhance-label", strings.enhance);
  setText("main-label", strings.main);
  setText("substats-legend", strings.substats);
  setText("calculate", strings.calculate);
  setText("summary-title", strings.summaryTitle);
  setText("score-title", strings.scoreTitle);
  setText("detail-title", strings.detailTitle);
  setText("score-note", strings.scoreNote);
  setText("lang-en", strings.langEnglish);
  setText("lang-zh", strings.langChinese);
  document.getElementById("lang-en").setAttribute("aria-pressed", currentLanguage === "en" ? "true" : "false");
  document.getElementById("lang-zh").setAttribute("aria-pressed", currentLanguage === "zh-Hant" ? "true" : "false");
  for (n = 1; n <= 4; n++) {
    setText("sub-stat-label-" + n, strings.substat + " " + n);
    setText("sub-value-label-" + n, strings.value + " " + n);
  }
  fillSelect(document.getElementById("slot"), optionsFromIds(tables.slotOrder, strings.slots));
  fillSelect(document.getElementById("level"), optionsFromIds(tables.levelOrder, strings.levels));
  fillSelect(document.getElementById("grade"), optionsFromIds(tables.gradeOrder, strings.grades));
  fillSelect(document.getElementById("enhance"), enhanceOptions());
  onSlotChange();
  onLevelChange();
}

function refreshResultLanguage() {
  var piece;
  if (resultMode === "ready" && currentPiece && lastRolls) {
    present(currentPiece, lastRolls, true);
    return;
  }
  if (resultMode === "error") {
    piece = readForm();
    if (piece.error) {
      showSummary({ text: piece.error, extra: "", tone: "tone-neutral" });
      return;
    }
  }
  showSummary({ text: strings.waiting, extra: "", tone: "tone-neutral" });
}

function useLanguage(lang) {
  if (!languages[lang]) {
    lang = "en";
  }
  currentLanguage = lang;
  strings = languages[lang];
  rememberLanguage(lang);
  paintLanguage();
  refreshResultLanguage();
}

function onLanguageClick(event) {
  useLanguage(event.currentTarget.id === "lang-zh" ? "zh-Hant" : "en");
}

function start() {
  var n;
  var initial = languageFromLocation() || savedLanguage() || "en";
  useLanguage(initial);
  document.getElementById("level").value = "85";
  document.getElementById("grade").value = "epic";
  document.getElementById("enhance").value = "0";
  document.getElementById("slot").value = "weapon";

  document.getElementById("slot").addEventListener("change", onSlotChange);
  document.getElementById("main").addEventListener("change", onMainChange);
  document.getElementById("level").addEventListener("change", onLevelChange);
  document.getElementById("grade").addEventListener("change", onPieceShapeChange);
  document.getElementById("enhance").addEventListener("change", onPieceShapeChange);
  document.getElementById("gear-form").addEventListener("submit", onCalculate);
  document.getElementById("lang-en").addEventListener("click", onLanguageClick);
  document.getElementById("lang-zh").addEventListener("click", onLanguageClick);
  for (n = 1; n <= 4; n++) {
    document.getElementById("sub-stat-" + n).addEventListener("change", onSubStatChange);
    document.getElementById("sub-value-" + n).addEventListener("input", onValueInput);
  }
  document.getElementById("detail-text").addEventListener("input", onRollCountChange);

  onSlotChange();
  onLevelChange();
  onPieceShapeChange();
}

document.addEventListener("DOMContentLoaded", start);
