/**
 * Inline `<head>` script for a site with a splash gate (D62). It runs before the body is parsed, so the first
 * paint of a landing page is already covered and locked:
 *
 * - `data-splash="hold"`: the page can't scroll, and an opaque cover in the panel's colour (each site's
 *   globals.css, `html[data-splash="hold"]::after`) hides everything until the splash panel is up. The splash
 *   script takes over (`data-splash-js`); if it never does, the lock lets go after 10 s.
 * - `data-splash="seen"`: no panel at all, where no scene video would play (reduced motion, Save-Data, 2G).
 *   Same rules as the device tier (device-tier.ts), so the panel never waits for videos that won't load.
 * - Every visit to a landing page starts at the top of the walk: the browser doesn't restore the old scroll
 *   position. A link to a section (#menu) still goes there once the gate opens.
 *
 * Only the landing pages (`/`, `/ar`) have a splash; other pages are left alone. Static, no input.
 */
export function splashBootScript(): string {
  return `try{var d=document.documentElement;if(/^\\/(ar\\/?)?$/.test(location.pathname)){history.scrollRestoration="manual";var c=navigator.connection,low=!!c&&(c.saveData===true||/(^|-)2g$/.test(c.effectiveType||""));if(low||matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.splash="seen";else{d.dataset.splash="hold";setTimeout(function(){if(d.dataset.splash==="hold"&&!d.dataset.splashJs)delete d.dataset.splash},10000)}}}catch(e){}`;
}
