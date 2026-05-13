"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLanguage } from "./LanguageProvider";

interface AccessFormProps {
  redirectTo: string;
}

export default function AccessForm({ redirectTo }: AccessFormProps) {
  const router = useRouter();
  const { language, isTranslating, toggleLanguage } = useLanguage();
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("password", password);
    formData.set("redirectTo", redirectTo);
    formData.set("language", language);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.message || "Nie udało się odblokować strony.");
        setIsSubmitting(false);
        return;
      }

      router.replace(result.redirectTo || "/");
      router.refresh();
    } catch {
      setError("Nie udało się odblokować strony.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="access-form" onSubmit={handleSubmit}>
      <div className="access-form__toolbar" data-translate-ignore>
        <button
          type="button"
          className="header__language access-form__language"
          aria-label={language === "en" ? "Switch to Polish" : "Switch to English"}
          aria-pressed={language === "en"}
          onClick={toggleLanguage}
          disabled={isTranslating || isSubmitting}
        >
          <span className={language === "pl" ? "header__language-active" : undefined}>
            PL
          </span>
          <span aria-hidden="true">/</span>
          <span className={language === "en" ? "header__language-active" : undefined}>
            ENG
          </span>
        </button>
      </div>
      <label className="access-form__label" htmlFor="portfolio-password">
        Hasło dostępu
      </label>
      <input
        type="text"
        name="username"
        value="portfolio"
        autoComplete="username"
        hidden
        readOnly
      />
      <div className="access-form__password-field">
        <input
          id="portfolio-password"
          className="access-form__input access-form__input--password"
          type={isPasswordVisible ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          autoFocus
          required
        />
        <button
          type="button"
          className="access-form__password-toggle"
          aria-label={isPasswordVisible ? "Ukryj hasło" : "Pokaż hasło"}
          aria-pressed={isPasswordVisible}
          onClick={() => setIsPasswordVisible((current) => !current)}
        >
          {isPasswordVisible ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 3L21 21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M9.7 5.25C10.43 5.09 11.2 5 12 5C17 5 20.25 9.13 21 12C20.72 13.08 20.1 14.33 19.15 15.47"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.12 14.12C13.58 14.66 12.83 15 12 15C10.34 15 9 13.66 9 12C9 11.17 9.34 10.42 9.88 9.88"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.53 6.88C4.68 8.24 3.5 10.21 3 12C3.75 14.87 7 19 12 19C13.64 19 15.1 18.56 16.33 17.86"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 12C3.75 9.13 7 5 12 5C17 5 20.25 9.13 21 12C20.25 14.87 17 19 12 19C7 19 3.75 14.87 3 12Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="access-form__error">{error}</p>}
      <button className="access-form__button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sprawdzam..." : "Odblokuj portfolio"}
      </button>
    </form>
  );
}
