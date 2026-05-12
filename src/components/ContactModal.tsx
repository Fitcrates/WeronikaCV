"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ContactInfo } from "@/lib/site";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactInfo;
}

export default function ContactModal({ isOpen, onClose, contact }: ContactModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const easing = [0.22, 1, 0.36, 1] as const;

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants: Variants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: easing
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay" 
          onClick={onClose}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
            <h2 className="modal-title">Kontakt</h2>
            <div className="modal-info">
              <p><strong>Imię i Nazwisko:</strong> {contact.name}</p>
              <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
              <p><strong>Telefon:</strong> <a href={`tel:${contact.phone.replaceAll(" ", "")}`}>{contact.phone}</a></p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
