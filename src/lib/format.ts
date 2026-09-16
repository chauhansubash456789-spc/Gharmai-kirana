import { colors } from "./constants";

export function formatNPR(value: number): string {
  const rounded = Math.round(value);
  return `Rs. ${rounded.toLocaleString("en-IN")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function placeholderImage(name: string, index = 0): string {
  const color = colors[index % colors.length];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${color}"/><rect width="400" height="400" fill="url(#g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.2"/><stop offset="1" stop-color="#000" stop-opacity="0.25"/></linearGradient></defs><text x="50%" y="46%" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#fff" text-anchor="middle" dominant-baseline="middle">${initials}</text><text x="50%" y="72%" font-family="Arial, sans-serif" font-size="24" fill="#fff" text-anchor="middle" opacity="0.85">Gharmai Kirana</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}