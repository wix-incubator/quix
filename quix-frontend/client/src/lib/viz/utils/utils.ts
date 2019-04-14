export function percentage(what: number, of: number): number {
  return Math.round((what / of * 100) * 100) / 100;
}

export function normalize(value, maxValue, min, max): number {
  return Math.max(Math.round(value / maxValue * max), min);
}
