"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Lang, type DictKey } from "@/lib/i18n/dictionary";
import { setLang as setLangAction } from "@/lib/actions/settings";

type LanguageContextValue = {
  lang: Lang;
  t: Record<DictKey, string>;
  setLang: (lang: Lang) => void;
  pending: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function setLang(next: Lang) {
    setLangState(next);
    startTransition(async () => {
      await setLangAction(next);
      router.refresh();
    });
  }

  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang], setLang, pending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
