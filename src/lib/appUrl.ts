export function frontendBaseUrl(): string {
  return process.env.FRONTEND_URL?.trim()?.replace(/\/+$/, "") || `http://localhost:${process.env.PORT || 4000}`;
}