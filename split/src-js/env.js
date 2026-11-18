/**
 * env.js — progressive-enhancement flags (formerly an inline <head> script).
 * State lives on the .livin root element and in this module — nothing on window.
 */
export const state = { static: false, ready: false };

export function initEnv(root) {
  root.classList.remove('livin--no-js');
  root.classList.add('livin--js');
  // Colour tone: corporate web tone by default; ?tone=classic shows the yellow/navy original
  const tone = new URLSearchParams(location.search).get('tone');
  root.setAttribute('data-tone', tone === 'classic' ? 'classic' : 'corp');
  // ?static disables motion (QA screenshots); behaves like prefers-reduced-motion
  state.static = /[?&]static\b/.test(location.search) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!state.static) root.classList.add('livin--motion');
  // Safety net: if the motion engine fails to boot, reveal everything.
  setTimeout(() => { if (!state.ready) root.classList.remove('livin--motion'); }, 3000);
}
