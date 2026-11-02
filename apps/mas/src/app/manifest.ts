import type { MetadataRoute } from "next";

/** The web app manifest (D70): name, colours and icons for "add to home screen" and browser chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAS · Café & Restaurant Management",
    short_name: "MAS",
    description:
      "MAS plans, opens and runs cafés and restaurants in Egypt: concept, brand, menu, people, operations and growth.",
    start_url: "/",
    display: "browser",
    background_color: "#1c1b1c",
    theme_color: "#1c1b1c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
