"use client";

import { useLanguage } from "@/lib/i18n";

export function CheckoutPageContent() {
  const { t } = useLanguage();

  return (
    <section className="container-dala section-space max-w-4xl">
      <h1 className="font-serif text-5xl">{t("checkout")}</h1>
      <div className="mt-8 flex gap-3 text-xs uppercase tracking-[0.14em]">
        <span className="border-b border-black pb-1">1 {t("shipping")}</span>
        <span>2 {t("payment")}</span>
        <span>3 {t("confirmation")}</span>
      </div>
      <form className="mt-10 grid gap-6 md:grid-cols-2">
        {[t("name"), t("phone"), t("city"), t("address")].map((field) => (
          <label key={field} className="block">
            <span className="text-xs uppercase tracking-[0.12em]">{field}</span>
            <input className="mt-2 w-full border-b border-black bg-transparent py-2 outline-none" />
          </label>
        ))}
      </form>
      <button className="btn-primary mt-10 px-10 py-4 text-sm uppercase tracking-[0.1em]">{t("continue")}</button>
    </section>
  );
}
