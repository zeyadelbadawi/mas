import { CONSENT_COOKIE, CONSENT_VERSION } from "./consent";

// Runs before first paint: marks <html> when a consent choice is stored, so the server-rendered
// banner (data-consent-pending) is hidden by CSS instead of flashing until hydration.
const BOOT = `try{if(/(?:^|;\\s*)${CONSENT_COOKIE}=v${CONSENT_VERSION}\\./.test(document.cookie))document.documentElement.setAttribute("data-consent-set","")}catch(e){}`;

/** Put inside <head> in the root layout. Fixed string, no user data. */
export function ConsentBootScript() {
  const html = { __html: BOOT };
  // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static boot script, see BOOT
  return <script dangerouslySetInnerHTML={html} />;
}
