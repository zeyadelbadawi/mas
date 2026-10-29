import { masServices } from "@mas/content";
import { createFormRoute } from "@mas/forms/server";

export const POST = createFormRoute({
  brandId: "mas",
  emailBrand: { name: "MAS", accent: "#c21f30", ink: "#0b0b0c", paper: "#f3efe7" },
  inquiry: { services: masServices },
});
