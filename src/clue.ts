import { Difficulty, englishNumbers } from "./util";

/* Minor adjustments were made to this file. */

/* The three types of clues*/

export enum Clue {
  Absent,
  Elsewhere,
  Correct,
}

export interface CluedLetter {
  clue?: Clue;
  letter: string;
}

/* Generate the clues given the guess string and the target word*/

export function clue(word: string, target: string): CluedLetter[] {
  let elusive: string[] = [];
  target.split("").forEach((letter, i) => {
    if (word[i] !== letter) {
      elusive.push(letter);
    }
  });
  return word.split("").map((letter, i) => {
    let j: number;
    if (target[i] === letter) {
      return { clue: Clue.Correct, letter };
    } else if ((j = elusive.indexOf(letter)) > -1) {
      // "use it up" so we don't clue at it twice
      elusive[j] = "";
      return { clue: Clue.Elsewhere, letter };
    } else {
      return { clue: Clue.Absent, letter };
    }
  });
}

/* Assign a clueClass for each letter in the guess*/
export function clueClass(clue: Clue): string {
  if (clue === Clue.Absent) {
    return "letter-absent";
  } else if (clue === Clue.Elsewhere) {
    return "letter-elsewhere";
  } else {
    return "letter-correct";
  }
}
/* Assign a word based on the Clue type*/
export function clueWord(clue: Clue): string {
  if (clue === Clue.Absent) {
    return "no";
  } else if (clue === Clue.Elsewhere) {
    return "elsewhere";
  } else {
    return "correct";
  }
}

/* Describe the Clue */
export function describeClue(clue: CluedLetter[]): string {
  return clue
    .map(({ letter, clue }) => letter.toUpperCase() + " " + clueWord(clue!))
    .join(", ");
}
/* Based on the difficulty of the game, determine whether there are any violations (not using all available information). */
export function violation(
  difficulty: Difficulty,
  clues: CluedLetter[],
  guess: string
): string | undefined {
  if (difficulty === Difficulty.Normal) {
    return undefined;
  }
  const ultra = difficulty === Difficulty.Hard;
  let i = 0;
  for (const { letter, clue } of clues) {
    const clueCount = clues.filter(
      (c) => c.letter === letter && c.clue !== Clue.Absent
    ).length;
    const guessCount = guess.split(letter).length - 1;
    const glyph = letter.toUpperCase();
    const glyphs = glyph + (clueCount !== 1 ? "s" : "");
    const n = (i + 1);

    // Hard: enforce greens stay in place.
    if (clue === Clue.Correct && guess[i] !== letter) {
      return "Letter " + n + " must be " + glyph;
    }

    // Hard: enforce yellows are used.
    if (guessCount < clueCount) {
      const atLeastN =
        clueCount > 1 ? `at least ${englishNumbers[clueCount]} ` : "";
      return `Guess must contain ${atLeastN}${glyphs}`;
    }

    // Ultra Hard: disallow would-be greens.
    if (ultra && clue !== Clue.Correct && guess[i] === letter) {
      return "Letter " + n + " can't be " + glyph;
    }

    // Ultra Hard: if the exact amount is known because of an Absent clue, enforce it.
    if (ultra && clue === Clue.Absent && guessCount !== clueCount) {
      return clueCount === 0
        ? `Guess can't contain ${glyph}`
        : `Guess must contain exactly ${englishNumbers[clueCount]} ${glyphs}`;
    }

    ++i;
  }
  return undefined;
}
