export function colorToInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

export function intToColor(int: number): string {
  return "#" + int.toString(16).padStart(6, "0").toUpperCase();
}

export function generateSimilarColor(
  baseColorInt: number,
  variance = 40,
): number {
  // Convert integer → RGB
  let r = (baseColorInt >> 16) & 0xff;
  let g = (baseColorInt >> 8) & 0xff;
  let b = baseColorInt & 0xff;

  // Random small adjustments
  const adjust = () =>
    Math.floor(Math.random() * (variance * 2 + 1)) - variance;

  r = Math.min(255, Math.max(0, r + adjust()));
  g = Math.min(255, Math.max(0, g + adjust()));
  b = Math.min(255, Math.max(0, b + adjust()));

  // Convert back → integer
  return (r << 16) + (g << 8) + b;
}

export const getRandomHexColor = (): string => {
  const randomColor = Math.floor(Math.random() * 0xffffff);
  return `#${randomColor.toString(16).padStart(6, "0")}`;
};
