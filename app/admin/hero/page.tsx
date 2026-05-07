"use client";

import { useEffect, useState } from "react";

type HeroSettings = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
};

const emptyHero: HeroSettings = {
  id: "default",
  title: "",
  subtitle: "",
  image_url: "",
};

export default function AdminHeroPage() {
  const [hero, setHero] = useState<HeroSettings>(emptyHero);

  const fetchHero = async () => {
    const response = await fetch("/api/hero");
    const data = await response.json();
    setHero(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHero();
  }, []);

  const uploadImage = async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    if (data.url) setHero((prev) => ({ ...prev, image_url: data.url }));
  };

  const save = async () => {
    await fetch("/api/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hero),
    });
  };

  return (
    <section>
      <h1 className="font-serif text-5xl">Hero Manager</h1>
      <div className="mt-8 max-w-2xl space-y-4 border p-4">
        <input
          className="w-full border px-3 py-2"
          placeholder="Main Title"
          value={hero.title}
          onChange={(e) => setHero((prev) => ({ ...prev, title: e.target.value }))}
        />
        <textarea
          rows={4}
          className="w-full border px-3 py-2"
          placeholder="Subtitle"
          value={hero.subtitle}
          onChange={(e) => setHero((prev) => ({ ...prev, subtitle: e.target.value }))}
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
          }}
        />
        {hero.image_url ? <img src={hero.image_url} alt="Hero preview" className="h-40 w-full object-cover" /> : null}

        <button className="bg-black px-5 py-3 text-sm uppercase tracking-[0.1em] text-white" onClick={save}>
          Save Hero
        </button>
      </div>
    </section>
  );
}
