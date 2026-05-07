"use client";

import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";

export function AboutPageContent() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.58) 40%, rgba(0,0,0,0.1) 100%), url('/about/hero.jpg')",
          }}
        />
        <div className="container-dala absolute bottom-12 left-0 right-0 z-10">
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#C9A96E]">НАША ИСТОРИЯ</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl text-white md:text-6xl">
            Традиции, сохранённые в современной форме
          </h1>
        </div>
      </section>

      <section className="container-dala section-space grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative h-[620px] w-full overflow-hidden">
          <Image src="/about/story.jpg" alt="DALA story" fill className="object-cover" />
        </div>
        <div>
          <p className="gold-label">О БРЕНДЕ DALA</p>
          <h2 className="mt-4 font-serif text-4xl">Мы — цифровое ателье казахского наследия</h2>
          <p className="mt-6 text-lg text-[var(--color-on-surface-2)]">{t("aboutBody")}</p>
        </div>
      </section>

      <section className="bg-[#1E1B15] py-[60px] text-white">
        <div className="container-dala grid min-h-[280px] gap-6 md:grid-cols-3">
          {[
            ["01", "ТРАДИЦИИ", "Мы сохраняем культурный код и передаем его в современных силуэтах.", "/about/value-1.jpg"],
            ["02", "АУТЕНТИЧНОСТЬ", "Каждая коллекция отражает казахскую идентичность без стилистических компромиссов.", "/about/value-2.jpg"],
            ["03", "СЕМЬЯ", "Бренд строится на уважении к преемственности и теплу семейных ценностей.", "/about/value-3.jpg"],
          ].map(([num, title, body, src], index) => (
            <article
              key={title}
              className={`relative overflow-hidden px-4 py-6 ${index < 2 ? "md:border-r md:border-[#C9A96E]/50 md:pr-8" : ""}`}
            >
              <Image src={src} alt={title} fill className="object-cover opacity-30" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96E]">{num}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#C9A96E]">{title}</p>
                <p className="mt-4 text-white/90">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-dala py-24 text-center">
        <p className="font-serif text-3xl tracking-[-0.02em] md:text-5xl">
          Величие <span className="text-[#C9A96E]">·</span> Эксклюзивность <span className="text-[#C9A96E]">·</span>{" "}
          Единство
        </p>
      </section>

      <section className="container-dala pb-24 text-center">
        <div className="mx-auto max-w-xl border border-[var(--divider)] px-8 py-8">
          <p className="gold-label">Резиденты Astana Hub</p>
          <p className="mt-3 text-[var(--color-on-surface-2)]">Развиваем цифровую экосистему luxury fashion в Казахстане.</p>
        </div>
      </section>

      <section className="bg-[#1E1B15] py-24 text-center text-white">
        <div className="container-dala">
          <h2 className="font-serif text-4xl md:text-5xl">Откройте для себя коллекцию</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
            <Link href="/catalog" className="bg-white px-10 py-4 text-sm uppercase tracking-[0.1em] text-[#1E1B15]">
              СМОТРЕТЬ КАТАЛОГ
            </Link>
            <Link
              href="/contact"
              className="border border-[#C9A96E] px-10 py-4 text-sm uppercase tracking-[0.1em] text-[#C9A96E]"
            >
              СВЯЗАТЬСЯ С НАМИ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
