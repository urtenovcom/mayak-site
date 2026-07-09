import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";

export const metadata: Metadata = {
  title: "Каталог модульных зданий и конструкций | ООО «Маяк»",
  description:
    "Каталог решений ООО «Маяк»: бытовки, блок-контейнеры, модульные здания, санитарные модули, хозблоки и металлоконструкции. Фильтр по назначению, типу и эксплуатации. Индивидуальное изготовление под задачу.",
  alternates: { canonical: "/catalog" },
  openGraph: {
    title: "Каталог модульных зданий и конструкций | ООО «Маяк»",
    description:
      "Готовые и индивидуальные модульные решения: бытовки, блок-контейнеры, офисные и санитарные модули, ангары и металлоконструкции.",
    type: "website",
  },
};

export default function CatalogPage() {
  return <CatalogView />;
}
