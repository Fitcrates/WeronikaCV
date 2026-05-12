"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface AccessFormProps {
  redirectTo: string;
}

export default function AccessForm({ redirectTo }: AccessFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("password", password);
    formData.set("redirectTo", redirectTo);

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
  }

  return (
    <form className="access-form" onSubmit={handleSubmit}>
      <label className="access-form__label" htmlFor="portfolio-password">
        Hasło dostępu
      </label>
      <input
        id="portfolio-password"
        className="access-form__input"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        autoFocus
        required
      />
      {error && <p className="access-form__error">{error}</p>}
      <button className="access-form__button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sprawdzam..." : "Odblokuj portfolio"}
      </button>
    </form>
  );
}
