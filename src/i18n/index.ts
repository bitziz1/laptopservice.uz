import { ru } from "./ru";
import { uz } from "./uz";

export const defaultLang = "ru" as const;
export const languages = {
  ru: "Русский",
  uz: "O'zbekcha",
} as const;

export type Lang = keyof typeof languages;

export const dictionaries = {
  ru,
  uz,
};

export function getI18n(lang: Lang = defaultLang) {
  return dictionaries[lang] || dictionaries[defaultLang];
}
