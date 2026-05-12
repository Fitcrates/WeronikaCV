"use client";

import Link from "next/link";
import { useState } from "react";
import ContactModal from "./ContactModal";
import type { ContactInfo } from "@/lib/site";

interface HeaderProps {
  contact: ContactInfo;
}

export default function Header({ contact }: HeaderProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <nav className="header__nav">
            <Link href="/#projekty">Projekty</Link>
            <Link href="/o-mnie">O mnie</Link>
            <Link href="/cv">CV</Link>
            <button onClick={() => setIsContactOpen(true)}>Kontakt</button>
          </nav>
        </div>
      </header>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} contact={contact} />
    </>
  );
}
