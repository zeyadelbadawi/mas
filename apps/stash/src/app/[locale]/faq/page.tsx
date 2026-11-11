import { simplePage } from "@/lib/simple-page";

const page = simplePage({ key: "faq", path: "/faq" });

export const generateMetadata = page.generateMetadata;
export default page.Page;
