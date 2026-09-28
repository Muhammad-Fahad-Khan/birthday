export const qs = (selector, scope = document) => scope.querySelector(selector);

export const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape user-editable content before it is interpolated into markup. */
export const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

/**
 * Split an element's text into word-wrapped character spans for per-letter animation.
 * The original text stays available to assistive tech through aria-label.
 */
export function splitChars(element) {
  const text = element.textContent.trim();
  element.textContent = '';
  element.setAttribute('aria-label', text);

  const chars = [];
  const words = text.split(/\s+/);

  words.forEach((word, index) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'split-word';
    wordEl.setAttribute('aria-hidden', 'true');

    [...word].forEach((char) => {
      const charEl = document.createElement('span');
      charEl.className = 'split-char';
      charEl.textContent = char;
      wordEl.appendChild(charEl);
      chars.push(charEl);
    });

    element.appendChild(wordEl);
    if (index < words.length - 1) element.appendChild(document.createTextNode(' '));
  });

  return chars;
}
