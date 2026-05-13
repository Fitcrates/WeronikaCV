"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import ContactModal from "./ContactModal";
import PreviewAwareLink from "./PreviewAwareLink";
import type { ContactInfo } from "@/lib/site";
import { useLanguage } from "./LanguageProvider";

interface HeaderProps {
  contact: ContactInfo;
}

export default function Header({ contact }: HeaderProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, isTranslating, toggleLanguage } = useLanguage();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const easing = [0.22, 1, 0.36, 1] as const;

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: easing,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: easing,
      },
    },
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.08,
        duration: 0.4,
        ease: easing,
      },
    }),
  };

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <nav className="header__nav header__nav--desktop">
            <PreviewAwareLink href="/#projekty">Projekty</PreviewAwareLink>
            <PreviewAwareLink href="/o-mnie">O mnie</PreviewAwareLink>
            <PreviewAwareLink href="/cv">CV</PreviewAwareLink>
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
                ×
              </button>
              <motion.div custom={0} variants={itemVariants}>
                <PreviewAwareLink href="/#projekty" onClick={closeMobileMenu}>
                  Projekty
                </PreviewAwareLink>
              </motion.div>
              <motion.div custom={1} variants={itemVariants}>
                <PreviewAwareLink href="/o-mnie" onClick={closeMobileMenu}>
                  O mnie
                </PreviewAwareLink>
              </motion.div>
              <motion.div custom={2} variants={itemVariants}>
                <PreviewAwareLink href="/cv" onClick={closeMobileMenu}>
                  CV
                </PreviewAwareLink>
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

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        contact={contact}
      />
    </>
  );
}
