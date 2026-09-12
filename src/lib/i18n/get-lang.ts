import { cookies } from "next/headers";
import { dictionaries, type Lang } from "./dictionary";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get("lang")?.value;
  return v === "en" ? "en" : "zh";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dictionaries[lang] };
}
