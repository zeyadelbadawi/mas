# Checking the scroll scenes on real devices (D62)

The automated tests run in Chromium only. Safari (iPhone, iPad, Mac) and Firefox (desktop, Android) are checked by hand with a meter built into the site. Each device takes about 5 minutes.

## What you need

- The site's address: the Vercel preview link of the PR, or the live site.
- Each device on its normal Wi-Fi, without Low Power Mode or Data Saver (these are tested separately in step 5).

## Steps (each device)

1. **Open the page with the meter.** Add `?debug=scrub` to the address of a **preview deployment** (the production site leaves the meter out, D76), for example `https://<preview address>.vercel.app/?debug=scrub`. A black box appears at the top left once the splash has gone.
2. **Watch the opening.** Close the tab, open a new one with the same address, and watch the first second.
   - **Pass:** the first thing you see is the splash (marble with the cup on Aroma, sand with the COVY mark on COVY). The scene never shows behind it or before it, and the page doesn't move while the splash is up, even if you try to scroll.
3. **Read the second line of the meter.**
   - `gate … (ready)` means the page opened only after everything was ready.
   - `webcodecs yes` means the fast engine is available.
   - Each scene line should say `engine … ready`. On Firefox for Android, or an iPhone with iOS older than 16.4, it says `video (no WebCodecs H.264 decoder) … ready`. That is the expected fallback.
4. **Scroll and read the first line.** Press **Reset** in the box, then run each scroll from the top to the end of the last scene. Press Reset again before the next one.

   | Scroll | How |
   |---|---|
   | Slow | Mouse wheel or a finger, steadily |
   | Fast | One quick, long swipe or flick, as far as it goes |
   | Jerky | Short hard flicks with stops in between |
   | Back up | The same, from the end of the walk to the top |

   **Pass on a computer from the last 5 years and a recent phone:**
   - `refresh` at least 55/s on a computer, at least 50/s on a phone;
   - `lagging still` below 10%;
   - `max step` 4 or less on slow, 12 or less on fast;
   - when you stop scrolling, the picture comes to rest within a fraction of a second.

   With the fallback (`video`), passing means no blank picture, no jump backwards, and the picture comes to rest when you stop.
5. **Special cases (one device of each kind is enough).**
   - Reload in the middle of the walk. **Pass:** the splash shows briefly, and the page starts again at the top.
   - Open `/#menu`. **Pass:** after the splash, the page is at the menu.
   - Turn on Low Power Mode (iPhone) or Data Saver (Android) and reload. **Pass:** with Data Saver there is no splash and the scenes are still pictures. Low Power Mode keeps the scenes, and they should still pass step 4.
6. **Send a screenshot** of the meter after the fast scroll, with the device and browser name.

## Reading a failure

| Meter shows | Likely cause | What to send |
|---|---|---|
| A scene `not ready` and the splash never goes | A file failed to download or decode | Screenshot plus the device and browser version |
| `video (decoder failed)` or `(decoder too slow)` | The browser's decoder gave up; the fallback took over | Screenshot; it still has to pass the fallback criteria |
| `refresh` far below 55/s | The device is busy, or something on the page redraws too much | Screenshot and a screen recording |
| `frames kept` above 350 MB (computer) or 250 MB (phone) | Memory is too high | Screenshot |
