import { BlogPost, Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "heritage-kamzol-silk",
    name: "Heritage Kamzol",
    category: "KAMZOL",
    price: 185000,
    currency: "KZT",
    material: "Hand-embroidered silk & gold thread",
    description:
      "A masterpiece of Kazakh craftsmanship. Each stitch is placed by hand by master artisans, preserving a tradition that spans generations.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["/placeholder-product.svg", "/placeholder-product.svg"],
    featured: true,
    new: true,
  },
  {
    id: "2",
    slug: "modern-chapan-wool",
    name: "Modern Chapan",
    category: "CHAPAN",
    price: 220000,
    currency: "KZT",
    material: "Structured virgin wool",
    description:
      "A contemporary reinterpretation of the ancestral Chapan. The architectural silhouette honors tradition while speaking the language of modern luxury.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/placeholder-product.svg"],
    featured: true,
    new: false,
  },
  {
    id: "3",
    slug: "silk-nomad-gown",
    name: "Silk Nomad Gown",
    category: "DRESS",
    price: 310000,
    currency: "KZT",
    material: "Hand-dyed mulberry silk",
    description:
      "Flowing ivory silk with deconstructed nomadic patterns in pearlescent finish. Ethereal, airy, and unmistakably DALA.",
    sizes: ["XS", "S", "M", "L"],
    images: ["/placeholder-product.svg"],
    featured: true,
    new: true,
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "art-of-the-chapan",
    title: "The Art of the Chapan: A Living Tradition",
    excerpt:
      "How one of the most symbolic garments of the steppe continues to evolve in contemporary ateliers.",
    date: "2025-02-14",
    image: "/placeholder-blog.svg",
    content:
      "The Chapan is not merely outerwear. It is architecture in fabric, carrying memory, lineage, and social meaning.",
  },
  {
    slug: "what-is-kamzol",
    title: "What is Kamzol? Kazakhstan's Most Iconic Garment",
    excerpt:
      "From ceremonial vest to modern wardrobe statement, the Kamzol remains a cornerstone of Kazakh style.",
    date: "2025-03-20",
    image: "/placeholder-blog.svg",
    content:
      "Kamzol balances structure and ornament. At DALA, we reinterpret this silhouette with silk, wool, and restrained finishing.",
  },
  {
    slug: "style-kazakh-clothing-2025",
    title: "How to Style Traditional Kazakh Clothing in 2025",
    excerpt:
      "Three practical styling directions for blending heritage garments with modern tailoring.",
    date: "2025-04-09",
    image: "/placeholder-blog.svg",
    content:
      "Contemporary styling starts with proportion. Pair volume with sharp structure and keep accessories intentional.",
  },
];
