import { locations } from "@mas/content";
import { createFormRoute } from "@mas/forms/server";

export const POST = createFormRoute({
  brandId: "aroma",
  emailBrand: { name: "Aroma Lounge", accent: "#355e3b", ink: "#202722", paper: "#eeece4" },
  reservation: { location: locations.aroma },
  feedback: true,
});
