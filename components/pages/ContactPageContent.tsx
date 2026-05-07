"use client";

import { Check, MessageCircle } from "lucide-react";
import { FormEvent, useState } from "react";

export function ContactPageContent() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? "+77XXXXXXXXX";
  const cleanPhone = whatsapp.replace(/[^\d]/g, "");
  const contactLink = `https://wa.me/${cleanPhone}`;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("Заполните все поля");
      return;
    }
    setError("");
    const text = `Имя: ${name}\nТелефон: ${phone}\nСообщение: ${message}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
    setName("");
    setPhone("");
    setMessage("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <section className="container-dala section-space grid gap-12 lg:grid-cols-2">
      <div>
        <p className="gold-label">ПЕРСОНАЛЬНЫЙ МЕНЕДЖЕР</p>
        <h1 className="mt-4 font-serif text-5xl">Мы на связи</h1>
        <p className="mt-5 max-w-lg text-[var(--color-on-surface-2)]">
          Напишите нам - и мы подберем для вас идеальный образ, поможем с размером и организуем доставку.
        </p>
        <a
          className="mt-8 inline-flex w-full max-w-md items-center justify-center gap-2 bg-[#775A19] px-10 py-4 text-sm uppercase tracking-[0.12em] text-white"
          href={contactLink}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} />
          Написать в WhatsApp
        </a>
        <p className="mt-5 text-sm text-[var(--color-on-surface-2)]">Пн-Вс · 9:00-21:00</p>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm underline">
          Instagram
        </a>
      </div>
      <form className="space-y-8" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.15em]">Имя</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="mt-2 w-full border-b border-black bg-transparent py-2 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.15em]">Номер телефона</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="+7 ___ ___ __ __"
            className="mt-2 w-full border-b border-black bg-transparent py-2 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.15em]">Сообщение</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Расскажите что вас интересует..."
            rows={4}
            className="mt-2 w-full border-b border-black bg-transparent py-2 outline-none"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? (
          <p className="inline-flex items-center gap-2 text-sm text-green-700">
            <Check size={16} />
            Спасибо! Мы свяжемся с вами скоро
          </p>
        ) : null}
        <button className="w-full bg-black px-10 py-4 text-sm uppercase tracking-[0.1em] text-white">ОТПРАВИТЬ</button>
      </form>
    </section>
  );
}
