import sanitizeHtml from "sanitize-html";

export function sanitizeHtmlCustom(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "br",
      "hr",
      "u",
    ]),
    allowedAttributes: Object.assign(
      {
        "*": ["style", "class"],
        td: ["colspan", "rowspan"],
        th: ["colspan", "rowspan"],
      },
      sanitizeHtml.defaults.allowedAttributes
    ),
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/],
        "text-indent": [/^.+$/],
      },
    },
  });
}
