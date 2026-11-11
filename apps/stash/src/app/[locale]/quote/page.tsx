import { simplePage } from "@/lib/simple-page";

const page = simplePage({ key: "quote", path: "/quote" });

export const generateMetadata = page.generateMetadata;
export default page.Page;
