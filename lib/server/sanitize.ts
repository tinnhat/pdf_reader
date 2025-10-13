import sanitizeHtml from "sanitize-html";

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "figure",
  "figcaption",
]);

const allowedAttributes: Record<string, string[]> = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "alt", "title"],
  a: ["href", "title", "target", "rel"],
};

/**
 * Sanitises user submitted rich text so it is safe to persist and render.
 */
export function sanitizeNoteContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}

/**
 * Creates a plain text version of the note for previews and search.
 */
export function extractPlainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim();
}
