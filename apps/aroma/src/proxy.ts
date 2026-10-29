import { i18nProxy } from "@mas/i18n/proxy";

export default i18nProxy;

export const config = {
  // Everything except API routes, Next internals, Vercel internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
