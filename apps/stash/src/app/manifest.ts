import type { MetadataRoute } from "next";

/** The web app manifest: name, colours and icons for "add to home screen" and browser chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "STASH · Packaging Solutions",
    short_name: "STASH",
    description:
      "Design your own cups, boxes, bags and wraps, see them before they're made, and have them produced by the STASH factory.",
    start_url: "/",
    display: "browser",
    background_color: "#f7f5f0",
    theme_color: "#f7f5f0",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
