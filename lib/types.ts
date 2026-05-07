export type ProductCategory =
  | "ALL"
  | "KAMZOL"
  | "CHAPAN"
  | "DRESS"
  | "ACCESSORIES"
  | "HEADWEAR"
  | "ВЕРХНЯЯ ОДЕЖДА";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Exclude<ProductCategory, "ALL">;
  price: number;
  currency: "KZT";
  material: string;
  description: string;
  sizes: string[];
  images: string[];
  fittingImage?: string;
  featured: boolean;
  new: boolean;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: string;
};
