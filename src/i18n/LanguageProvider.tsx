"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  translate,
  type Locale,
} from "@/i18n/translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const TRANSLATED_ATTRIBUTES = ["placeholder", "title", "aria-label"] as const;

function replaceTextNode(node: Text, locale: Locale) {
  const parent = node.parentElement;
  if (!parent || parent.closest("[data-no-translate],script,style,code,pre")) return;

  const current = node.nodeValue ?? "";
  if (!originalText.has(node)) originalText.set(node, current);
  const source = originalText.get(node) ?? current;
  const trimmed = source.trim();
  if (!trimmed) return;

  const translated = translate(locale, trimmed);
  const next = source.replace(trimmed, translated);
  if (node.nodeValue !== next) node.nodeValue = next;
}

function replaceAttributes(element: Element, locale: Locale) {
  if (element.closest("[data-no-translate]")) return;

  let originals = originalAttributes.get(element);
  if (!originals) {
    originals = new Map<string, string>();
    originalAttributes.set(element, originals);
  }

  for (const attribute of TRANSLATED_ATTRIBUTES) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    if (!originals.has(attribute)) originals.set(attribute, value);
    const source = originals.get(attribute) ?? value;
    const next = translate(locale, source);
    if (value !== next) element.setAttribute(attribute, next);
  }
}

function translateTree(root: Node, locale: Locale) {
  if (root.nodeType === Node.TEXT_NODE) {
    replaceTextNode(root as Text, locale);
    return;
  }
  if (!(root instanceof Element) && root !== document.body) return;

  if (root instanceof Element) replaceAttributes(root, locale);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) replaceTextNode(current as Text, locale);
    else if (current instanceof Element) replaceAttributes(current, locale);
    current = walker.nextNode();
  }
}

function AutomaticPageTranslation({ locale }: { locale: Locale }) {
  useEffect(() => {
    translateTree(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          replaceTextNode(mutation.target as Text, locale);
        }
        mutation.addedNodes.forEach((node) => translateTree(node, locale));
      }
    });

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const applyDocumentLocale = useCallback((nextLocale: Locale) => {
    document.documentElement.lang = nextLocale === "ko" ? "ko" : "en-IN";
    document.documentElement.dataset.locale = nextLocale;
  }, []);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      localStorage.setItem(LOCALE_COOKIE, nextLocale);
      applyDocumentLocale(nextLocale);
    },
    [applyDocumentLocale]
  );

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale, applyDocumentLocale]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_COOKIE);
    if (isLocale(stored) && stored !== initialLocale) setLocale(stored);
  }, [initialLocale, setLocale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "en" ? "ko" : "en"),
      t: (text) => translate(locale, text),
    }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      <AutomaticPageTranslation locale={locale} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
