"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Route error:", error);

  return (
    <div className="container-dala section-space text-center">
      <h2 className="font-serif text-4xl">Страница временно недоступна</h2>
      <p className="mt-3 text-sm text-[var(--color-on-surface-2)]">
        Мы уже восстановили резервный режим. Попробуйте обновить страницу.
      </p>
      <button className="btn-primary mt-6 px-6 py-3 text-sm uppercase tracking-[0.1em]" onClick={reset}>
        Обновить
      </button>
    </div>
  );
}
