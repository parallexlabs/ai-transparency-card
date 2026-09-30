/**
 * Encode user-controlled text as a Markdown inline code span.
 * Chooses a backtick fence longer than any run inside the value.
 * @param {unknown} value
 * @returns {string}
 */
export function encodeMarkdownLiteral(value, emptyLabel = 'Not provided') {
  if (value == null || value === '') return emptyLabel;
  const text = String(value).replace(/\r\n|\r|\n/g, ' ');
  let maxRun = 0;
  let run = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '`') {
      run++;
      if (run > maxRun) maxRun = run;
    } else {
      run = 0;
    }
  }
  const fence = '`'.repeat(maxRun + 1);
  const needsPadding = /^\s|\s$|^`|`$/.test(text);
  const inner = needsPadding ? ` ${text} ` : text;
  return `${fence}${inner}${fence}`;
}

/** @deprecated use encodeMarkdownLiteral */
export function escapeMarkdownLiteral(value) {
  return encodeMarkdownLiteral(value);
}
