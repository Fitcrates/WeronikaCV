"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

export type Language = "pl" | "en";

interface TextSnapshot {
  original: string;
}

interface TranslateResponsePayload {
  translations?: string[];
  error?: string;
}

interface LanguageContextValue {
  language: Language;
  isTranslating: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LANGUAGE_STORAGE_KEY = "grzesiowska-language";
const LANGUAGE_COOKIE_NAME = "grzesiowska_language";
const TRANSLATION_CACHE_PREFIX = "grzesiowska-translation:";
const TRANSLATABLE_ROOT_SELECTOR = "body";
const IGNORED_SELECTOR =
  "script, style, noscript, svg, input, textarea, select, option, [data-translate-ignore]";
const TRANSLATION_BATCH_SIZE = 80;

const LanguageContext = createContext<LanguageContextValue | null>(null);

function normalizeLanguage(value: string | null | undefined): Language {
  return value === "en" ? "en" : "pl";
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function getSavedLanguage(): Language {
  if (typeof window === "undefined") {
    return "pl";
  }

  return normalizeLanguage(
    window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ||
      getCookieValue(LANGUAGE_COOKIE_NAME)
  );
}

function persistLanguage(language: Language) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = language;
}

function splitWhitespace(value: string) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);

  return {
    leading: match?.[1] || "",
    text: match?.[2] || value,
    trailing: match?.[3] || "",
  };
}

function shouldTranslateText(text: string) {
  const trimmed = text.trim();

  return (
    trimmed.length > 1 &&
    /[A-Za-z\u0104\u0106\u0118\u0141\u0143\u00d3\u015a\u0179\u017b\u0105\u0107\u0119\u0142\u0144\u00f3\u015b\u017a\u017c]/.test(
      trimmed
    ) &&
    !/^https?:\/\//i.test(trimmed) &&
    !/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(trimmed)
  );
}

function collectTextNodes() {
  const root = document.querySelector(TRANSLATABLE_ROOT_SELECTOR);
  const nodes: Text[] = [];

  if (!root) {
    return nodes;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;

      if (!parent || parent.closest(IGNORED_SELECTOR)) {
        return NodeFilter.FILTER_REJECT;
      }

      return shouldTranslateText(node.nodeValue || "")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  let current = walker.nextNode();

  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  return nodes;
}

function getCacheKey(text: string, target: Language) {
  return `${TRANSLATION_CACHE_PREFIX}${target}:${text}`;
}

function decodeHtmlEntities(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>("pl");
  const [isTranslating, setIsTranslating] = useState(false);
  const originalTextByNode = useRef<WeakMap<Text, TextSnapshot>>(new WeakMap());
  const translationObserver = useRef<MutationObserver | null>(null);
  const translateTimer = useRef<number | null>(null);
  const isApplyingTranslation = useRef(false);

  const restoreOriginalText = useCallback(() => {
    collectTextNodes().forEach((node) => {
      const snapshot = originalTextByNode.current.get(node);

      if (snapshot) {
        node.nodeValue = snapshot.original;
      }
    });
  }, []);

  const translatePage = useCallback(
    async (target: Language) => {
      if (target === "pl") {
        isApplyingTranslation.current = true;
        restoreOriginalText();
        window.setTimeout(() => {
          isApplyingTranslation.current = false;
        }, 0);
        return;
      }

      const nodes = collectTextNodes();
      const uniqueTexts = new Set<string>();

      nodes.forEach((node) => {
        if (!originalTextByNode.current.has(node)) {
          originalTextByNode.current.set(node, { original: node.nodeValue || "" });
        }

        const original = originalTextByNode.current.get(node)?.original || "";
        const { text } = splitWhitespace(original);

        if (shouldTranslateText(text)) {
          uniqueTexts.add(text);
        }
      });

      const missingTexts = Array.from(uniqueTexts).filter(
        (text) => !window.localStorage.getItem(getCacheKey(text, target))
      );

      setIsTranslating(true);

      try {
        for (let index = 0; index < missingTexts.length; index += TRANSLATION_BATCH_SIZE) {
          const batch = missingTexts.slice(index, index + TRANSLATION_BATCH_SIZE);

          if (batch.length === 0) {
            continue;
          }

          const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ texts: batch, target }),
          });

          const payload = (await response.json()) as TranslateResponsePayload;

          if (!response.ok) {
            throw new Error(payload.error || "Translation request failed");
          }

          batch.forEach((text, batchIndex) => {
            const translatedText = payload.translations?.[batchIndex];

            if (translatedText) {
              window.localStorage.setItem(
                getCacheKey(text, target),
                decodeHtmlEntities(translatedText)
              );
            }
          });
        }

        isApplyingTranslation.current = true;

        nodes.forEach((node) => {
          const original = originalTextByNode.current.get(node)?.original || "";
          const { leading, text, trailing } = splitWhitespace(original);
          const translatedText = window.localStorage.getItem(getCacheKey(text, target));

          if (translatedText && node.nodeValue !== `${leading}${translatedText}${trailing}`) {
            node.nodeValue = `${leading}${translatedText}${trailing}`;
          }
        });
      } catch (error) {
        console.warn("Unable to translate page.", error);
        persistLanguage("pl");
        setLanguageState("pl");
        restoreOriginalText();
      } finally {
        window.setTimeout(() => {
          isApplyingTranslation.current = false;
        }, 0);
        setIsTranslating(false);
      }
    },
    [restoreOriginalText]
  );

  const scheduleTranslation = useCallback(
    (target: Language) => {
      if (translateTimer.current) {
        window.clearTimeout(translateTimer.current);
      }

      translateTimer.current = window.setTimeout(() => {
        void translatePage(target);
      }, 80);
    },
    [translatePage]
  );

  const setLanguage = useCallback(
    (nextLanguage: Language) => {
      persistLanguage(nextLanguage);
      setLanguageState(nextLanguage);
      scheduleTranslation(nextLanguage);
    },
    [scheduleTranslation]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "pl" : "en");
  }, [language, setLanguage]);

  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    document.documentElement.lang = savedLanguage;
    scheduleTranslation(savedLanguage);
    window.setTimeout(() => {
      setLanguageState(savedLanguage);
    }, 0);
  }, [pathname, scheduleTranslation]);

  useEffect(() => {
    if (language !== "en") {
      translationObserver.current?.disconnect();
      translationObserver.current = null;
      return;
    }

    translationObserver.current = new MutationObserver(() => {
      if (isApplyingTranslation.current) {
        return;
      }

      scheduleTranslation("en");
    });

    translationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      translationObserver.current?.disconnect();
      translationObserver.current = null;
    };
  }, [language, scheduleTranslation]);

  const contextValue = useMemo(
    () => ({
      language,
      isTranslating,
      setLanguage,
      toggleLanguage,
    }),
    [isTranslating, language, setLanguage, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
