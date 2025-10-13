/**
 * Centralised environment variable access with helpful defaults and explicit
 * error messages. The helpers are used by both API routes and background logic
 * so that every component reads configuration in a consistent manner.
 */
export interface AppEnvironment {
  mongoUri: string;
  mongoDb: string;
  libreTranslateUrl: string;
}

let cachedEnv: AppEnvironment | null = null;

export function getEnvironment(): AppEnvironment {
  if (cachedEnv) {
    return cachedEnv;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "Missing MONGODB_URI. Please provide a connection string to your MongoDB deployment."
    );
  }

  const mongoDb = process.env.MONGODB_DB ?? "pdf_reader";
  const libreTranslateUrl =
    process.env.LIBRE_TRANSLATE_URL ?? "https://libretranslate.de/translate";

  cachedEnv = { mongoUri, mongoDb, libreTranslateUrl };
  return cachedEnv;
}
