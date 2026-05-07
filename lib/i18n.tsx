"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type Language = "kz" | "ru" | "en";

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  kz: {
    navCollections: "Каталог",
    navAbout: "Біз туралы",
    navJournal: "Журнал",
    navContact: "Байланыс",
    heroLabel: "Мұра және шеберлік",
    heroTitle: "Күш дәстүрде",
    heroSubtitle: "Қазақ мұрасы. Заманауи люкс.",
    exploreCollection: "Каталогты көру",
    contactManager: "Менеджерге жазу",
    featuredCollection: "Таңдаулы каталог",
    viewAllCollection: "Барлық каталог →",
    homeStory:
      "DALA силуэт, текстура және мәдени жад біртұтас естілетін топтамалар жасайды.",
    collection: "Каталог",
    aboutLabel: "Біздің тарих",
    aboutTitle: "Дәстүрлер заманауи пішінде сақталған.",
    aboutBody:
      "DALA қазақ мұрасын заманауи люкс силуэттері арқылы жеткізеді, шеберлікті, отбасылық сабақтастықты және мәдени жадты құрметтейді.",
    journal: "Журнал",
    readArticle: "Мақаланы оқу",
    personalManager: "Жеке менеджер",
    contactUs: "Бізбен байланысыңыз",
    submit: "Жіберу",
    name: "Аты",
    phoneWhatsApp: "Телефон / WhatsApp",
    message: "Хабарлама",
    addToCart: "Себетке қосу",
    cart: "Себет",
    size: "Өлшем",
    remove: "Жою",
    subtotal: "Барлығы",
    proceedOrder: "Тапсырысқа өту",
    checkout: "Төлем",
    shipping: "Жеткізу",
    payment: "Төлем тәсілі",
    confirmation: "Растау",
    phone: "Телефон",
    city: "Қала",
    address: "Мекенжай",
    continue: "Жалғастыру",
    footerTagline: "Қазақ мұрасы. Заманауи люкс.",
    menuHome: "Басты бет",
    menuCatalog: "Каталог",
    menuAbout: "Біз туралы",
    menuJournal: "Журнал",
    menuContact: "Байланыс",
    menuLabel: "Мәзір",
    mobileLanguageLabel: "Тіл / Language",
    logoutAdmin: "Админнен шығу",
    catalogHeritageLabel: "Мұра және шеберлік",
    catalogTitle: "Каталог",
    catalogFound: "Табылды",
    catalogItems: "бұйым",
    catalogSearchPlaceholder: "Каталогтан іздеу...",
    catalogAll: "Барлығы",
    catalogKamzol: "Камзолдар",
    catalogChapan: "Шапандар",
    catalogDress: "Көйлектер",
    catalogAccessories: "Аксессуарлар",
    catalogHeadwear: "Бас киімдер",
    catalogNew: "Жаңалар",
    catalogPrice: "Бағасы бойынша",
    catalogCreateProduct: "Тауар қосу",
  },
  ru: {
    navCollections: "Каталог",
    navAbout: "О нас",
    navJournal: "Журнал",
    navContact: "Контакты",
    heroLabel: "Наследие и ремесло",
    heroTitle: "Сила в традициях",
    heroSubtitle: "Казахское наследие. Современная роскошь.",
    exploreCollection: "Смотреть каталог",
    contactManager: "Связаться с менеджером",
    featuredCollection: "Избранный каталог",
    viewAllCollection: "Весь каталог →",
    homeStory:
      "DALA создает коллекции, где силуэт, текстура и культурная память звучат как единое высказывание.",
    collection: "Каталог",
    aboutLabel: "Наша история",
    aboutTitle: "Традиции, сохраненные в современной форме.",
    aboutBody:
      "DALA интерпретирует казахское наследие через современную luxury-эстетику, уважая ремесло, семейную преемственность и культурную память.",
    journal: "Журнал",
    readArticle: "Читать статью",
    personalManager: "Персональный менеджер",
    contactUs: "Свяжитесь с нами",
    submit: "Отправить",
    name: "Имя",
    phoneWhatsApp: "Телефон / WhatsApp",
    message: "Сообщение",
    addToCart: "Добавить в корзину",
    cart: "Корзина",
    size: "Размер",
    remove: "Удалить",
    subtotal: "Итого",
    proceedOrder: "Оформить заказ",
    checkout: "Оформление",
    shipping: "Доставка",
    payment: "Оплата",
    confirmation: "Подтверждение",
    phone: "Телефон",
    city: "Город",
    address: "Адрес",
    continue: "Продолжить",
    footerTagline: "Казахское наследие. Современная роскошь.",
    menuHome: "Главная",
    menuCatalog: "Каталог",
    menuAbout: "О нас",
    menuJournal: "Журнал",
    menuContact: "Контакты",
    menuLabel: "Меню",
    mobileLanguageLabel: "Язык / Language",
    logoutAdmin: "Выйти из админки",
    catalogHeritageLabel: "Наследие и ремесло",
    catalogTitle: "Каталог",
    catalogFound: "Найдено",
    catalogItems: "изделий",
    catalogSearchPlaceholder: "Поиск по коллекции...",
    catalogAll: "Все",
    catalogKamzol: "Камзолы",
    catalogChapan: "Чапаны",
    catalogDress: "Платья",
    catalogAccessories: "Аксессуары",
    catalogHeadwear: "Головные уборы",
    catalogNew: "Новинки",
    catalogPrice: "По цене",
    catalogCreateProduct: "Создать товар",
  },
  en: {
    navCollections: "Catalog",
    navAbout: "About",
    navJournal: "Journal",
    navContact: "Contact",
    heroLabel: "Heritage & Craft",
    heroTitle: "Strength in Tradition",
    heroSubtitle: "Kazakh heritage. Contemporary luxury.",
    exploreCollection: "Explore Catalog",
    contactManager: "Contact Manager",
    featuredCollection: "Featured catalog",
    viewAllCollection: "View full catalog →",
    homeStory:
      "DALA creates collections where silhouette, texture, and cultural memory speak as one statement.",
    collection: "Catalog",
    aboutLabel: "Our story",
    aboutTitle: "Traditions preserved in contemporary form.",
    aboutBody:
      "DALA interprets Kazakh heritage through contemporary luxury silhouettes, honoring craftsmanship, family continuity, and cultural memory.",
    journal: "Journal",
    readArticle: "Read article",
    personalManager: "Personal manager",
    contactUs: "Get in touch",
    submit: "Submit",
    name: "Name",
    phoneWhatsApp: "Phone / WhatsApp",
    message: "Message",
    addToCart: "Add to cart",
    cart: "Cart",
    size: "Size",
    remove: "Remove",
    subtotal: "Subtotal",
    proceedOrder: "Proceed to order",
    checkout: "Checkout",
    shipping: "Shipping",
    payment: "Payment",
    confirmation: "Confirmation",
    phone: "Phone",
    city: "City",
    address: "Address",
    continue: "Continue",
    footerTagline: "Kazakh heritage. Contemporary luxury.",
    menuHome: "Home",
    menuCatalog: "Catalog",
    menuAbout: "About",
    menuJournal: "Journal",
    menuContact: "Contacts",
    menuLabel: "Menu",
    mobileLanguageLabel: "Language",
    logoutAdmin: "Logout from admin",
    catalogHeritageLabel: "Heritage & craft",
    catalogTitle: "Catalog",
    catalogFound: "Found",
    catalogItems: "items",
    catalogSearchPlaceholder: "Search collection...",
    catalogAll: "All",
    catalogKamzol: "Kamzols",
    catalogChapan: "Chapans",
    catalogDress: "Dresses",
    catalogAccessories: "Accessories",
    catalogHeadwear: "Headwear",
    catalogNew: "New",
    catalogPrice: "By price",
    catalogCreateProduct: "Create product",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "ru";
    const stored = window.localStorage.getItem("dala-language") as Language | null;
    return stored && dictionaries[stored] ? stored : "ru";
  });

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (next) => {
        setLanguage(next);
        window.localStorage.setItem("dala-language", next);
      },
      t: (key) => dictionaries[language][key] ?? key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
