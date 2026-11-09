import { PORTRAIT_BELOW } from "./manifest";
import { SCENE_FILES } from "./media";

/**
 * A download started by the page's first inline script, before any JavaScript bundle has loaded
 * (videoPrefetchScript). video-preload picks it up when its turn comes, keeping the progress it has made.
 */
export type VideoPrefetch = {
  loaded: number;
  total: number;
  done: boolean;
  error?: boolean;
  chunks: Uint8Array[];
  /** Called on every chunk and at the end; set by video-preload once it adopts the download. */
  on: (() => void) | null;
  /** Cancels the transfer (the line turned out too slow, or the player streams the file instead). */
  abort?: () => void;
};

export type VideoPrefetchMap = Record<string, VideoPrefetch>;

/** The global the inline script leaves its downloads on, for video-preload to adopt (short on purpose, D76). */
export const PREFETCH_GLOBAL = "__vp";

/**
 * Inline script for the page: starts downloading the scene videos for this screen's shape right after the
 * first paint (so they never hold up the first content), two seconds or more before the players hydrate on a
 * slow phone. Skipped wherever the players would not load videos (reduced motion, Save-Data, 2G connections).
 * Requested at low priority, so the page's own scripts, styles and poster go first on a busy connection. The
 * video URLs follow the scene's folder: one-letter names in an opaque folder on the media host (D76), the
 * build's `desktop.mp4` / `mobile.mp4` for the committed drafts. Static input only.
 */
export function videoPrefetchScript(manifestUrls: readonly string[]): string {
  const pairs = manifestUrls.map((u) => {
    const base = u.slice(0, u.lastIndexOf("/") + 1);
    return u.endsWith("/" + SCENE_FILES.manifest)
      ? [base + SCENE_FILES.desktop, base + SCENE_FILES.mobile]
      : [base + "desktop.mp4", base + "mobile.mp4"];
  });
  return `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var c=navigator.connection;if(c&&(c.saveData||/2g$/.test(c.effectiveType||"")))return;var s=innerWidth/innerHeight<${PORTRAIT_BELOW}?1:0;var m=window.${PREFETCH_GLOBAL}=window.${PREFETCH_GLOBAL}||{};var go=function(){${JSON.stringify(pairs)}.forEach(function(b){var u=b[s];if(m[u])return;var ac=typeof AbortController=="function"?new AbortController():null;var o=m[u]={loaded:0,total:0,done:false,chunks:[],on:null,abort:function(){ac&&ac.abort()}};var end=function(){o.on&&o.on()};fetch(u,{priority:"low",signal:ac?ac.signal:void 0}).then(function(r){if(!r.ok||!r.body)throw 0;o.total=+r.headers.get("content-length")||0;var d=r.body.getReader();var p=function(){return d.read().then(function(x){if(x.done){o.done=true;end();return}o.chunks.push(x.value);o.loaded+=x.value.byteLength;end();return p()})};return p()}).catch(function(){o.error=true;o.done=true;end()})})};requestAnimationFrame(function(){setTimeout(go,0)})}catch(e){}})()`;
}
