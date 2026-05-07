import Image from "next/image";

export function WhatsAppFab() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP ?? "7XXXXXXXXXX";
  const href = `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Здравствуйте! Я хочу узнать подробнее о коллекции DALA")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-fab fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg md:bottom-6 md:right-6"
      aria-label="Open WhatsApp"
    >
      <Image src="/icons/whatsapp.png" alt="WhatsApp" width={30} height={30} className="h-[30px] w-[30px]" />
    </a>
  );
}
