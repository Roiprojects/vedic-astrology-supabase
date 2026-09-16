import { Helmet } from "react-helmet-async";
import { TempleHome } from "@/components/sections/TempleHome";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <link rel="canonical" href={siteConfig.url} />
      </Helmet>
      <TempleHome />
    </>
  );
}
