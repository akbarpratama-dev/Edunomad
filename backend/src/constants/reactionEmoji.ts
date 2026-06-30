// Phase 12.3 — allowed emoji reactions on discussion messages. Kept a small,
// curated set (validated server-side) rather than free-form input.
export const REACTION_EMOJIS = ["👍", "❤️", "🎉", "✅", "👀", "🙌"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];
