// AST-based, context-aware renaming of class names / ids / custom properties inside JS modules.
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import MagicString from 'magic-string';

export function makeRenamer({ classes, idMap, P = 'lv-' }) {
  const isClass = (t) => classes.has(t);
  const isClassPrefix = (t) => /-$/.test(t) && [...classes].some((c) => c.startsWith(t));
  const cls = (t) => (isClass(t) || isClassPrefix(t) ? P + t : t);
  const tokens = (s) => s.replace(/[^\s]+/g, (t) => cls(t));
  const id = (t) => idMap[t] || t;
  const selector = (s) => s
    .replace(/\.([A-Za-z_][\w-]*)/g, (m, c) => (isClass(c) ? '.' + P + c : m))
    .replace(/#([A-Za-z_][\w-]*)/g, (m, i) => (idMap[i] ? '#' + idMap[i] : m));
  // template text: class="..." (possibly unterminated), id/aria refs, url(#..), href="#.."
  function quasiText(text, state) {
    let out = '', i = 0;
    while (i < text.length) {
      if (state.inClass) {
        const end = text.indexOf('"', i);
        const seg = end === -1 ? text.slice(i) : text.slice(i, end);
        out += seg.replace(/[^\s]+/g, (t, off) => {
          // a token glued to the following ${} (e.g. "obj--") is a class prefix
          return cls(t);
        });
        if (end === -1) return out;
        out += '"'; i = end + 1; state.inClass = false; continue;
      }
      const k = text.indexOf('class="', i);
      if (k === -1) { out += text.slice(i); break; }
      out += text.slice(i, k + 7); i = k + 7; state.inClass = true;
    }
    return out;
  }
  const idText = (text) => text
    .replace(/\b(id|aria-labelledby|aria-controls|aria-describedby|for)="([^"$]*)/g, (m, a, v) => `${a}="${v.split(/\s+/).map((x) => (x ? idMap[x] || 'lv-' + x : x)).join(' ')}`)
    .replace(/url\(#([\w-]+)\)/g, (m, v) => `url(#${idMap[v] || 'lv-' + v})`)
    .replace(/href="#([\w-]+)/g, (m, v) => `href="#${idMap[v] || v}`);

  return function renameModule(code, file) {
    const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
    const ms = new MagicString(code);
    const done = new Set();
    const setLit = (node, fn) => { if (done.has(node.start)) return; done.add(node.start);
      if (node.type === 'Literal' && typeof node.value === 'string') { const v = fn(node.value); if (v !== node.value) ms.overwrite(node.start, node.end, JSON.stringify(v)); }
      else if (node.type === 'TemplateLiteral') node.quasis.forEach((q) => { const v = fn(q.value.raw); if (v !== q.value.raw) ms.overwrite(q.start, q.end, v); });
    };
    // string literals that END UP in a class value; comparison operands (active === 'sukha') are data, not classes
    const classLits = (expr) => walk.fullAncestor(expr, (n, st, anc) => {
      if (n.type !== 'Literal' || typeof n.value !== 'string') return;
      const parent = anc[anc.length - 2];
      if (parent && parent.type === 'BinaryExpression' && /^[!=]==?$/.test(parent.operator)) return;
      if (parent && parent.type === 'SwitchCase') return;
      setLit(n, tokens);
    });
    const used = { Q: false, QS: false };

    walk.ancestor(ast, {
      TemplateLiteral(node) {
        if (done.has(node.start)) return;
        const st = { inClass: false };
        node.quasis.forEach((q, i) => {
          const raw = q.value.raw;
          let v = quasiText(raw, st);
          v = idText(v);
          if (v !== raw) ms.overwrite(q.start, q.end, v);
          done.add(q.start);
          if (st.inClass && node.expressions[i]) classLits(node.expressions[i]);
        });
      },
      Literal(node) {
        // plain string literal carrying markup: '<span class="x">'
        if (typeof node.value !== 'string' || done.has(node.start) || !/(class|id|href|aria-[a-z]+)="/.test(node.value)) return;
        setLit(node, (v) => idText(quasiText(v, { inClass: false })));
      },
      CallExpression(node) {
        const c = node.callee; if (c.type !== 'MemberExpression' || c.computed) return;
        const name = c.property.name;
        // el.classList.add/remove/toggle/contains('x')
        if (c.object.type === 'MemberExpression' && c.object.property.name === 'classList') {
          const args = name === 'toggle' || name === 'contains' ? node.arguments.slice(0, 1) : node.arguments;
          args.forEach((a) => setLit(a, tokens));
          return;
        }
        if (['querySelector', 'querySelectorAll', 'closest', 'matches'].includes(name)) {
          const a = node.arguments[0]; if (a) setLit(a, selector);
          if (c.object.type === 'Identifier' && c.object.name === 'document') { ms.overwrite(c.object.start, c.object.end, '__lvRoot()'); used.root = true; }
          return;
        }
        if (name === 'getElementById' && c.object.type === 'Identifier' && c.object.name === 'document' && !(node.arguments[0] && node.arguments[0].type === 'Identifier' && node.arguments[0].name === 'ROOT_ID')) {
          ms.overwrite(c.start, c.end, '__lvById'); used.byId = true; return;
        }
        if (name === 'setProperty' || name === 'getPropertyValue' || name === 'removeProperty') {
          const a = node.arguments[0]; if (a) setLit(a, (s) => s.replace(/^--(?!lv-)/, '--lv-'));
          return;
        }
        // GSAP string targets -> root-scoped NodeList
        if (['from', 'to', 'fromTo', 'set'].includes(name)) {
          const a = node.arguments[0];
          if (a && a.type === 'Literal' && typeof a.value === 'string' && /^[.#\[]/.test(a.value)) {
            ms.overwrite(a.start, a.end, `__lvQ(${JSON.stringify(selector(a.value))})`); done.add(a.start); used.Q = true;
          }
        }
      },
      AssignmentExpression(node) {
        if (node.left.type === 'MemberExpression' && node.left.property.name === 'className') classLits(node.right);
      },
      Property(node) {
        // ScrollTrigger { trigger: '#id' | '.cls' }
        if (!node.computed && node.key.name === 'trigger' && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          ms.overwrite(node.value.start, node.value.end, `__lvQS(${JSON.stringify(selector(node.value.value))})`); done.add(node.value.start); used.QS = true;
        }
      },
    });
    // var(--x) inside JS strings/templates (inline styles)
    let out = ms.toString().replace(/var\(--(?!lv-)([\w-]+)/g, 'var(--lv-$1');
    const imp = ['__lvRoot', '__lvById', '__lvQ', '__lvQS'].filter((n) => out.includes(n + '('));
    if (imp.length && !/\/dom\.js$/.test(file)) out = `import { ${imp.join(', ')} } from './dom.js';\n` + out;
    return out;
  };
}
