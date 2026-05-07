import { getSupabaseClients } from "@/lib/supabase";

export default async function AdminDashboardPage() {
  const clients = getSupabaseClients();
  const [productsResponse, ordersResponse] = clients
    ? await Promise.all([
        clients.supabaseAdmin.from("products").select("id, is_new"),
        clients.supabaseAdmin
          .from("orders")
          .select("id, created_at, customer_name, customer_phone, total_price")
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const products = productsResponse.data ?? [];
  const orders = ordersResponse.data ?? [];
  const recent = orders.slice(0, 5);

  return (
    <section>
      <h1 className="font-serif text-5xl">Admin dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Total Products", String(products.length)],
          ["Total Orders", String(orders.length)],
          ["New Products", String(products.filter((product) => product.is_new).length)],
        ].map(([label, value]) => (
          <article key={label} className="border p-5">
            <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
            <p className="mt-3 font-serif text-4xl">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 border">
        <div className="grid grid-cols-5 border-b px-4 py-3 text-xs uppercase tracking-[0.12em]">
          <span>Date</span>
          <span>Name</span>
          <span>Phone</span>
          <span>Total</span>
          <span>Status</span>
        </div>
        {recent.map((order) => (
          <div key={order.id} className="grid grid-cols-5 px-4 py-3 text-sm border-b last:border-b-0">
            <span>{new Date(order.created_at).toLocaleDateString("ru-RU")}</span>
            <span>{order.customer_name}</span>
            <span>{order.customer_phone}</span>
            <span>{order.total_price.toLocaleString("ru-RU")} ₸</span>
            <span>—</span>
          </div>
        ))}
      </div>
    </section>
  );
}
