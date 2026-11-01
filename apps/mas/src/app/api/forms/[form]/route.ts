import { masServices } from "@mas/content";
import { createFormRoute } from "@mas/forms/server";

export const POST = createFormRoute({
  brandId: "mas",
  emailBrand: { name: "MAS", accent: "#ddaf52", ink: "#1c1b1c", paper: "#e5e5e5" },
  inquiry: { services: masServices },
});
