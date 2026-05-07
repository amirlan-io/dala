"use client";

import storyImage from "@/public/about/story.jpg";
import { useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { HeroTextBlock } from "@/components/home/HeroTextBlock";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { StoryBlock } from "@/components/home/StoryBlock";
import { FeaturedCatalog } from "@/components/home/FeaturedCatalog";
import { normalizeProducts } from "@/lib/safe-products";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    slug: "tkan-premium",
    name: "Ткань",
    category: "ACCESSORIES",
    price: 1500000,
    currency: "KZT",
    material: "Premium Textile",
    description: "Эксклюзивная ткань ручной выделки для couture-коллекций.",
    sizes: ["M"],
    images: ["/placeholder-product.svg"],
    featured: true,
    new: true,
  },
  {
    id: "mock-2",
    slug: "platye-premium",
    name: "Платье",
    category: "DRESS",
    price: 250000,
    currency: "KZT",
    material: "Premium Textile",
    description: "Платье из шелка с ручной отделкой.",
    sizes: ["S", "M", "L"],
    images: ["/placeholder-product.svg"],
    featured: true,
    new: false,
  },
  {
    id: "mock-3",
    slug: "kamzol-heritage",
    name: "Камзол",
    category: "KAMZOL",
    price: 380000,
    currency: "KZT",
    material: "Heritage Line",
    description: "Камзол с казахским орнаментом и шелковой подкладкой.",
    sizes: ["S", "M", "L"],
    images: ["/placeholder-product.svg"],
    featured: true,
    new: false,
  },
  {
    id: "mock-4",
    slug: "saukele-accessories",
    name: "Саукеле",
    category: "HEADWEAR",
    price: 420000,
    currency: "KZT",
    material: "Accessories",
    description: "Традиционный саукеле в современном исполнении.",
    sizes: ["M"],
    images: ["/placeholder-product.svg"],
    featured: true,
    new: false,
  },
];

export function HomePageContent({
  organizationSchemaJson,
}: {
  organizationSchemaJson: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(normalizeProducts(data)))
      .catch(() => setProducts([]));
  }, []);

  const featured = useMemo(() => (products.length > 0 ? products.slice(0, 4) : MOCK_PRODUCTS), [products]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchemaJson }} />
      <section className="relative h-[86svh] min-h-[520px] max-h-[960px] overflow-hidden">
        <HeroSlideshow />
        <HeroTextBlock />
      </section>
      <StoryBlock imageSrc={storyImage} />
      <FeaturedCatalog products={featured} />
    </div>
  );
}
