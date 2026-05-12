"use client";

import { useEffect } from "react";
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">Kontakt</h2>
        <div className="modal-info">
          <p><strong>Imię i Nazwisko:</strong> {contact.name}</p>
          <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
          <p><strong>Telefon:</strong> <a href={`tel:${contact.phone.replaceAll(" ", "")}`}>{contact.phone}</a></p>
        </div>
      </div>
    </div>
  );
}
