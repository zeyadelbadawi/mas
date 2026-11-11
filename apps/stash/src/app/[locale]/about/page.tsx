import { simplePage } from "@/lib/simple-page";

const page = simplePage({ key: "about", path: "/about", current: "about" });

export const generateMetadata = page.generateMetadata;
export default page.Page;
