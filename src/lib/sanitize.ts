import sanitizeHtml from "sanitize-html";

/**
 * Sanitize HTML content from the TipTap editor for safe rendering.
 * Allows standard formatting tags but strips scripts, event handlers, etc.
 */
export function sanitizeArticleHtml(dirty: string): string {
    return sanitizeHtml(dirty, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "img", "h1", "h2", "h3", "h4", "h5", "h6",
            "figure", "figcaption", "video", "source",
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt", "title", "width", "height", "loading"],
            a: ["href", "name", "target", "rel"],
            video: ["src", "controls", "width", "height"],
            source: ["src", "type"],
        },
        allowedSchemes: ["http", "https", "mailto"],
    });
}
