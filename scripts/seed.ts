import { createClient } from "@supabase/supabase-js";
import products from "../data/products.example.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function run() {
  const payload = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    description: "Seed product",
    price: product.price,
    category: "ACCESSORIES",
    images: product.images,
    is_new: Boolean(product.new),
  }));

  const { error } = await supabaseAdmin
    .from("products")
    .upsert(payload, { onConflict: "slug" });

  if (error) {
    throw new Error(`Seed failed: ${error.message}`);
  }

  console.log(`Seed complete: ${payload.length} products`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
