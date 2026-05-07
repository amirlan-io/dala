import { readJsonFile } from "@/lib/json-store";

export default async function AdminDashboardPage() {
  const products = await readJsonFile<unknown[]>("data/products.json", []);
  const orders = await readJsonFile<{ id: string; date: string; customerName: string; phone: string; total: number; status: string }[]>(
    "data/orders.json",
    [],
  );
  const hero = await readJsonFile<{ visible: boolean }>("data/hero.json", { visible: false });
  const recent = orders.slice(0, 5);

  return (
    <section>
      <h1 className="font-serif text-5xl">Admin dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Total Products", String(products.length)],
          ["New Orders", String(orders.filter((order) => order.status === "new").length)],
          ["Hero Status", hero.visible ? "Active" : "Inactive"],
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
            <span>{new Date(order.date).toLocaleDateString("ru-RU")}</span>
            <span>{order.customerName}</span>
            <span>{order.phone}</span>
            <span>{order.total.toLocaleString("ru-RU")} ₸</span>
            <span>{order.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
