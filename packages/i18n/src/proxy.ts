import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

/** Locale routing for every app's `src/proxy.ts`. */
export const i18nProxy = createMiddleware(routing);
