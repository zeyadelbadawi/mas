import { simplePage } from "@/lib/simple-page";

const page = simplePage({ key: "materials", path: "/materials", current: "materials" });

export const generateMetadata = page.generateMetadata;
export default page.Page;
