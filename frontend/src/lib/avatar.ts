// Deterministic real-face placeholder photo per user, so avatars look real
// across the app without threading a stored photo URL through every payload.
// Gender (men/women) + portrait index are derived from a stable seed (the user
// id), so each user always gets the same face. Source: randomuser.me portraits
// (free, hotlinkable, 0–99 per gender).
export function avatarPhotoUrl(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const gender = h % 2 === 0 ? "men" : "women";
  const index = h % 100;
  return `https://randomuser.me/api/portraits/${gender}/${index}.jpg`;
}
