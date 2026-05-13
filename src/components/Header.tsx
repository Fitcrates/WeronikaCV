"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import ContactModal from "./ContactModal";
import type { ContactInfo } from "@/lib/site";

interface HeaderProps {
  contact: ContactInfo;
}

type Language = "pl" | "en";

interface TextSnapshot {
  original: string;
}

interface TranslateResponsePayload {
  translations?: string[];
  error?: string;
}

const LANGUAGE_STORAGE_KEY = "grzesiowska-language";
const TRANSLATION_CACHE_PREFIX = "grzesiowska-translation:";
const TRANSLATABLE_ROOT_SELECTOR = "body";
const IGNORED_SELECTOR =
  "script, style, noscript, svg, input, textarea, select, option, [data-translate-ignore]";
const TRANSLATION_BATCH_SIZE = 80;

function getSavedLanguage(): Language {
  if (typeof window === "undefined") {
    return "pl";
  }

  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "pl";
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
    /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(trimmed) &&
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

export default function Header({ contact }: HeaderProps) {
  const pathname = usePathname();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("pl");
  const [isTranslating, setIsTranslating] = useState(false);
  const originalTextByNode = useRef<WeakMap<Text, TextSnapshot>>(new WeakMap());
  const translationObserver = useRef<MutationObserver | null>(null);
  const translateTimer = useRef<number | null>(null);
  const isApplyingTranslation = useRef(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const restoreOriginalText = useCallback(() => {
    collectTextNodes().forEach((node) => {
      const snapshot = originalTextByNode.current.get(node);

      if (snapshot) {
        node.nodeValue = snapshot.original;
      }
    });
  }, []);

  const translatePage = useCallback(async (target: Language) => {
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
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pl");
      setLanguage("pl");
      restoreOriginalText();
    } finally {
      window.setTimeout(() => {
        isApplyingTranslation.current = false;
      }, 0);
      setIsTranslating(false);
    }
  }, [restoreOriginalText]);

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

  const handleLanguageChange = (nextLanguage: Language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguage(nextLanguage);
    scheduleTranslation(nextLanguage);
  };

  const toggleLanguage = () => {
    handleLanguageChange(language === "en" ? "pl" : "en");
  };

  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    scheduleTranslation(savedLanguage);
    window.setTimeout(() => {
      setLanguage(savedLanguage);
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

  const easing = [0.22, 1, 0.36, 1] as const;

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: easing
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: easing
      }
    }
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.08,
        duration: 0.4,
        ease: easing
      }
    })
  };

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          {/* Desktop Navigation */}
          <nav className="header__nav header__nav--desktop">
            <Link href="/#projekty">Projekty</Link>
            <Link href="/o-mnie">O mnie</Link>
            <Link href="/cv">CV</Link>
            <button onClick={() => setIsContactOpen(true)}>Kontakt</button>
            <button
              type="button"
              className="header__language"
              data-translate-ignore
              aria-label={language === "en" ? "Switch to Polish" : "Switch to English"}
              aria-pressed={language === "en"}
              onClick={toggleLanguage}
              disabled={isTranslating}
            >
              <span className={language === "pl" ? "header__language-active" : undefined}>
                PL
              </span>
              <span aria-hidden="true">/</span>
              <span className={language === "en" ? "header__language-active" : undefined}>
                ENG
              </span>
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            className="header__hamburger"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          >
            <motion.span
              animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: easing }}
            />
            <motion.span
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: easing }}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="header__mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMobileMenu}
            />
            <motion.nav
              className="header__nav--mobile"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <button 
                className="header__mobile-close"
                onClick={closeMobileMenu}
                aria-label="Zamknij menu"
              >
                ✕
              </button>
              <motion.div custom={0} variants={itemVariants}>
                <Link href="/#projekty" onClick={closeMobileMenu}>
                  Projekty
                </Link>
              </motion.div>
              <motion.div custom={1} variants={itemVariants}>
                <Link href="/o-mnie" onClick={closeMobileMenu}>
                  O mnie
                </Link>
              </motion.div>
              <motion.div custom={2} variants={itemVariants}>
                <Link href="/cv" onClick={closeMobileMenu}>
                  CV
                </Link>
              </motion.div>
              <motion.div custom={3} variants={itemVariants}>
                <button 
                  onClick={() => {
                    closeMobileMenu();
                    setIsContactOpen(true);
                  }}
                >
                  Kontakt
                </button>
              </motion.div>
              <motion.div custom={4} variants={itemVariants}>
                <button
                  type="button"
                  className="header__language header__language--mobile"
                  data-translate-ignore
                  aria-label={language === "en" ? "Switch to Polish" : "Switch to English"}
                  aria-pressed={language === "en"}
                  onClick={toggleLanguage}
                  disabled={isTranslating}
                >
                  <span className={language === "pl" ? "header__language-active" : undefined}>
                    PL
                  </span>
                  <span aria-hidden="true">/</span>
                  <span className={language === "en" ? "header__language-active" : undefined}>
                    ENG
                  </span>
                </button>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} contact={contact} />
    </>
  );
}
