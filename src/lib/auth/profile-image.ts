export const PROFILE_AVATAR_ENDPOINT = "/api/users/me/avatar";
export const PROFILE_AVATAR_DATA_URL_PREFIX = "data:image/jpeg;base64,";

/** Keep uploaded image bytes in PostgreSQL, not in the Auth.js cookie/session. */
export function toSessionImage(image: string | null | undefined): string | null {
  if (!image) return null;
  return image.startsWith("data:image/") ? PROFILE_AVATAR_ENDPOINT : image;
}
