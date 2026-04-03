import { apiGet } from "@/lib/api";

export default async function AdminDashboardPage() {
  type AdminSettings = { contact?: { whatsapp_number?: string }; payment?: { usd_ngn_rate?: number } };
  type Product = { id: number };
  const settings = await apiGet<AdminSettings>("/settings/admin/");
  const products = await apiGet<Product[]>("/products/");

  const cards = [
    { label: "Products", value: products?.length || 0 },
    { label: "WhatsApp", value: settings?.contact?.whatsapp_number || "Not set" },
    { label: "USD→NGN", value: settings?.payment?.usd_ngn_rate || "-" },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex">
      <aside className="w-72 bg-neutral-900 border-r border-neutral-800 p-4 hidden md:block">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <nav className="mt-6 space-y-2 text-sm text-neutral-300">
          {[
            "Overview",
            "Orders",
            "Products",
            "SEO",
            "AI Agent",
            "Payment Settings",
            "Cloudinary Settings",
            "SMTP Settings",
            "WhatsApp Settings",
          ].map((item) => (
            <div key={item} className="px-3 py-2 rounded-lg hover:bg-neutral-800">{item}</div>
          ))}
        </nav>
      </aside>

      <section className="flex-1 p-6 md:p-8">
        <h2 className="text-2xl font-bold">Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-neutral-400 text-sm">{card.label}</p>
              <p className="text-2xl font-semibold mt-2">{card.value}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
