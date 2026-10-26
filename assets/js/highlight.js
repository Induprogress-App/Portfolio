// Minimalne podświetlanie składni: komentarze, łańcuchy, liczby i słowa kluczowe ST oraz JavaScript.
const KEYWORDS = {
  'Structured Text': 'FUNCTION_BLOCK|END_FUNCTION_BLOCK|VAR_INPUT|VAR_OUTPUT|VAR_IN_OUT|VAR|END_VAR|TYPE|END_TYPE|CASE|OF|END_CASE|IF|THEN|ELSIF|ELSE|END_IF|AND|OR|NOT|TRUE|FALSE|BOOL|INT|DWORD|TIME|TON|SHL',
  default: 'export|function|const|let|return|for|of|if|throw|new|import|from|true|false|class|await|async'
};

const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

export function highlight(code, lang = '') {
  const kw = KEYWORDS[lang] || KEYWORDS.default;
  const token = new RegExp(`(\\/\\/[^\\n]*|\\(\\*[\\s\\S]*?\\*\\)|\\/\\*[\\s\\S]*?\\*\\/)|(\`[^\`]*\`|'[^'\\n]*'|"[^"\\n]*")|\\b(T#\\w+|DWORD#\\d+|\\d+(?:\\.\\d+)?)\\b|\\b(${kw})\\b`, 'g');
  let out = '';
  let last = 0;
  for (const m of code.matchAll(token)) {
    out += esc(code.slice(last, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : 'k';
    out += `<span class="tok-${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}
