const NO_BREAK_AFTER_WORDS = [
  "a",
  "ale",
  "bez",
  "czy",
  "dla",
  "do",
  "i",
  "ku",
  "lub",
  "na",
  "nad",
  "nie",
  "o",
  "od",
  "oraz",
  "po",
  "pod",
  "przy",
  "sie",
  "się",
  "to",
  "u",
  "w",
  "we",
  "z",
  "za",
  "ze",
];

const noBreakAfterWordPattern = new RegExp(
  `(^|[\\s([{])(${NO_BREAK_AFTER_WORDS.join("|")})\\s+`,
  "giu"
);
const noBreakAroundDashPattern = /\s+([-–—])\s+/g;

export function preventOrphans(text: string) {
  return text
    .replace(noBreakAfterWordPattern, "$1$2\u00a0")
    .replace(noBreakAroundDashPattern, "\u00a0$1\u00a0");
}
