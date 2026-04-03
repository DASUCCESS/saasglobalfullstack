import { DefaultSeo } from "next-seo";
import SEO from "../../../next-seo.config";

export default function SeoHead() {
  return <DefaultSeo {...SEO} />;
}
