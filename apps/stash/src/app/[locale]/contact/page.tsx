import { simplePage } from "@/lib/simple-page";

const page = simplePage({ key: "contact", path: "/contact", current: "contact" });

export const generateMetadata = page.generateMetadata;
export default page.Page;
