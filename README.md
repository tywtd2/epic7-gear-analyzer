# Epic Seven gear analyzer

A page for deciding what to do with **one piece of gear**.

Open it here: [https://tywtd2.github.io/epic7-gear-analyzer/](https://tywtd2.github.io/epic7-gear-analyzer/)

Type the slot, level, grade, enhance, main stat, and substats. The right side answers in plain language: keep upgrading, roll once more and look again, sell, extract, or wear it for now. You do not need to know how the page is built. If you can read a gear screen in Epic Seven, you can use this.

The **Summary** is the decision. The **Score** only says how high the numbers rolled. A high score on a flat-main ring is still a piece to sell or extract.

## Enter the piece the way it looks in game

1. Choose the slot: Weapon, Helmet, Armor, Necklace, Ring, or Boots.
2. Choose the item level. Hunt and arena gear is usually **85**. After reforge, choose **90 reforged** and type the numbers you see on the reforged piece. **Under 72** and **72–84** use older published ranges.
3. Choose the grade and the enhance. Enhance only goes in steps of 3: +0, +3, +6, +9, +12, +15.
4. Choose the main stat. The list changes with the slot. A weapon can only be flat Attack. A necklace can be Attack %, Health %, Defense %, Crit Chance, or Crit Damage.
5. Choose each substat and type the number from the gear screen. The grey text in the box is the range that piece can reach. It grows when the enhance goes up. On an Epic level 85 piece, Attack % shows `0% - 8%` at +0 and `0% - 48%` at +15. Crit Chance shows `0% - 5%` at +0 and `0% - 30%` at +15.
6. Press **Calculate**.

A substat can only be picked once. The main stat is also removed from the substat lists, so a weapon will not offer flat Attack as a substat.

The grey range starts at 0 so it is easy to read. The check still uses the real roll. On level 85, Attack % starts at 4, so typing 0 or 2 is rejected. The message tells you the real range.

## The three boxes

**Summary** is the largest line. Follow that sentence.

- Green means keep the piece, or keep upgrading it.
- Red means sell it. Do not spend more charms on it.
- Gold means look again. Either roll only to the next enhance, or the piece is usable for now and replaceable later.

Some gold lines have a second sentence. One line is for an endgame account. The other is for a new account that still needs any usable piece.

**Score** looks like `366 / 400 (91%)`. Each roll is scored from the bottom of its range to the top. Flat Attack, flat Defense, and flat Health count for half. The note under the score says the same thing the box is for: the percent measures the height of the rolls, not whether the piece is worth wearing.

**Detail** shows how the page split the substats into rolls. Those counts are a guess. If you watched the upgrades and one line rolled twice, change that count. The counts have to be whole numbers from 1 to 6, and they have to add up to the roll total for that grade and enhance. An Epic +15 has 9 rolls. An Epic +0 has 4.

## What the page calls a real stat

A **real stat** is one of these percent lines:

- Attack %
- Health %
- Defense %
- Crit Chance
- Crit Damage

Speed is counted on its own. It is not folded into that list.

Effectiveness, Effect Resistance, flat Attack, flat Defense, and flat Health do not count as a real stat. A piece whose only percent lines are Effectiveness and Effect Resistance is treated as having no real stat.

A flat main on a **weapon, helmet, or armor** is normal. The page never tells you to sell those because the main is flat. A flat main on a **necklace, ring, or boots** is different: sell it if it is not +15 yet, and extract it if it is already +15.

## While the piece is not +15 yet

Check again after every upgrade. "Worth finishing" means the next upgrades are worth paying for. It does not mean the finished piece is a keep. A good start can still miss.

| What is on the piece | What the page says |
| --- | --- |
| Necklace, ring, or boots with a flat main | Sell. Do not upgrade it. |
| Substats are only flats | Sell. |
| No speed, and no real stat | Sell. |
| Speed boots with no real stat | Sell. |
| Speed is still a single low roll, all four lines are already visible, and there is no real stat | Sell. This starts at +6. A Rare or Heroic piece can still reveal a new line, so that case says to look again instead of selling. |
| Two real stats | Worth finishing. Upgrade to the next step. |
| Speed and one real stat | Worth finishing. |
| Speed is already high for this enhance, even with no real stat yet | Worth finishing. |
| Speed boots with one real stat | Roll only to the next step, then check again. |
| Speed boots with two real stats | Worth finishing. |
| Speed is still one low roll | Roll only to the next step, then check again. |
| Only one real stat, and no speed | Roll only to the next step, then check again. |

Speed counts as already high at these amounts. Level 88 asks for 1 more.

| Enhance | Speed |
| --- | --- |
| +0 | Never. One roll cannot be "already high." |
| +3 | 8 |
| +6 | 10 |
| +9 | 12 |
| +12 | 15 |

A single low speed roll means speed is still inside one roll: 1–4 on level 85, or 2–5 on level 88.

## When the piece is +15

| What is on the piece | What the page says |
| --- | --- |
| Necklace, ring, or boots with a flat main | Extract. |
| Speed is 15 or higher | Keep. |
| Speed boots with at least one real stat | Keep. |
| Speed boots with no real stat | Endgame: extract them when a speed boot with a real stat exists. New account: wear them. A speed main is still your fastest boots. |
| Attack, Crit Chance, or Crit Damage main, with two of those same stats in the subs, and the score is 70% or higher | Keep. Speed is not required. |
| Health % or Defense % main, with two real stats, and the score is 70% or higher | Keep. Speed is not required. |
| Weapon, helmet, or armor with two real stats and a score of 80% or higher | Keep. |
| The same matching stats, but the score is under 70% | Endgame: the right stats are here, but the rolls are low. Replace it when a higher roll exists. New account: wear it. |
| Speed is 9 to 14 | Endgame: wear it until a faster piece replaces it. New account: wear it. |
| No speed and no real stat | Extract. |
| Anything else that is finished | Endgame: extract it once a better piece for this slot exists. New account: wear it until a better piece drops. |

## Reforge

Reforge does not reroll the piece. It adds a bonus on top of the rolls you already have.

On a **level 85** piece at **+12** or **+15**, the detail box says what each stat becomes if the current roll counts stay. At +12 it also reminds you that one upgrade is still left, and that roll can still raise a stat before reforge.

If the piece is already reforged, choose **90 reforged** and type the numbers on the gear screen. The score then includes the reforge bonus.

Only level 85 gear at +15 can be reforged.

## When Calculate does not score the piece

The page will not invent a keep or a sell from a broken entry. The bad box is marked, and the summary says what to fix.

- Every box is empty: enter a number for every substat. Each box shows the range.
- One box is empty: it names that substat.
- The value is a decimal, a word, or a negative: that substat has to be a whole number.
- The number cannot roll on this piece: it names the stat and the real range. `21222` on Attack % is rejected.
- Each number looks possible on its own, but together they need more rolls than this enhance has: the numbers do not fit this piece.
- A Normal piece at +0: it has no substats yet. Upgrade it to +3 and the first one appears.

## What this page will not do

It looks at one piece. It does not look at the set, so Speed, Rage, Destruction, Immunity, and the rest do not change the sentence. It does not compare two pieces. It does not know which hero you are building, or what is already in your inventory.

Use it on each new piece before you spend charms. After the next upgrade, enter the piece again. Gear that is already enhanced, or already on a hero, stays as it is until you enter that piece too.

## For anyone changing the page

The site is a few files and has no build step. GitHub Pages serves the `main` branch.

- `index.html` is the page.
- `styles.css` is the dark layout, including the phone and tablet layout.
- `strings.js` is every sentence. Change the words there.
- `tables.js` holds the roll ranges, the reforge bonus, which main stats each slot can have, and how many substats each grade shows.
- `rolls.js` turns a substat number into roll counts.
- `score.js` scores those rolls.
- `verdict.js` writes the summary.
- `page.js` connects the form to those files.

Level 85 flat ranges follow the published Korean chart: flat Attack 31–46, flat Defense 25–34, flat Health 149–202. Level 88 flats were not published as their own chart. They are the level 85 flats raised by 1 on both ends, the same step Attack % takes from 4–8 to 5–9.
