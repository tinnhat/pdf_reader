/**
 * In a real system the user ID would come from an identity provider. For the
 * sake of the demo application we keep a single deterministic identifier that is
 * used across API calls and database documents.
 */
export const DEMO_USER_ID = "demo-user";

/** Collections used by the application. Keeping them as constants helps avoid
 * typo-based bugs when working with MongoDB.
 */
export const COLLECTIONS = {
  progress: "reading_progress",
  notes: "reading_notes",
} as const;
