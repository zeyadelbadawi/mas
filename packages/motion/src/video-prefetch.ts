import { PORTRAIT_BELOW } from "./manifest";

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
};

export type VideoPrefetchMap = Record<string, VideoPrefetch>;

/**
 * Inline script for the page: starts downloading the scene videos for this screen's shape right after the
 * first paint (so they never hold up the first content), two seconds or more before the players hydrate on a
 * slow phone. Skipped wherever the players would
 * not load videos (reduced motion, Save-Data, 2G connections). Requested at low priority, so the page's own
 * scripts, styles and poster go first on a busy connection. `bases` are the scenes' folders (the
 * manifest URL without "manifest.json"); the file names follow the video build (`desktop.mp4`, `mobile.mp4`).
 * Static input only.
 */
export function videoPrefetchScript(manifestUrls: readonly string[]): string {
  const bases = manifestUrls.map((u) => u.slice(0, u.lastIndexOf("/") + 1));
  return `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var c=navigator.connection;if(c&&(c.saveData||/2g$/.test(c.effectiveType||"")))return;var s=innerWidth/innerHeight<${PORTRAIT_BELOW}?"mobile":"desktop";var m=window.__masVideoPrefetch=window.__masVideoPrefetch||{};var go=function(){${JSON.stringify(bases)}.forEach(function(b){var u=b+s+".mp4";if(m[u])return;var o=m[u]={loaded:0,total:0,done:false,chunks:[],on:null};var end=function(){o.on&&o.on()};fetch(u,{priority:"low"}).then(function(r){if(!r.ok||!r.body)throw 0;o.total=+r.headers.get("content-length")||0;var d=r.body.getReader();var p=function(){return d.read().then(function(x){if(x.done){o.done=true;end();return}o.chunks.push(x.value);o.loaded+=x.value.byteLength;end();return p()})};return p()}).catch(function(){o.error=true;o.done=true;end()})})};requestAnimationFrame(function(){setTimeout(go,0)})}catch(e){}})()`;
}
