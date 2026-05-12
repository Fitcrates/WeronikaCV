"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import ContactModal from "./ContactModal";
import type { ContactInfo } from "@/lib/site";

interface HeaderProps {
  contact: ContactInfo;
}

export default function Header({ contact }: HeaderProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} contact={contact} />
    </>
  );
}
