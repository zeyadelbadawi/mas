import { locations } from "@mas/content";
import { createFormRoute } from "@mas/forms/server";

export const POST = createFormRoute({
  brandId: "covy",
  emailBrand: { name: "COVY", accent: "#765f4d", ink: "#262d3f", paper: "#efebe8" },
  reservation: { location: locations.covy },
  feedback: true,
});
