// app/admin/components/guest-slug.ts
export const ANON_SLUG = "_anonim";
export const ANON_LABEL = "Mysafirë anonimë";

export function encodeGuestSlug(guestName: string): string {
  return encodeURIComponent(guestName);
}

export function decodeGuestSlug(slug: string): { isAnonymous: boolean; guestName: string | null } {
  const decoded = decodeURIComponent(slug);
  if (decoded === ANON_SLUG) {
    return { isAnonymous: true, guestName: null };
  }
  return { isAnonymous: false, guestName: decoded };
}
