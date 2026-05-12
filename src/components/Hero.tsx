import FloatingFaces from "./FloatingFaces";
import type { SiteSettings } from "@/lib/site";

interface HeroProps {
  settings: SiteSettings;
}

export default function Hero({ settings }: HeroProps) {
  return (
    <section className="hero">
      <div className="container">
        {/* Full-width title */}
        <h1 className="hero__title animate-fade-in">
          {settings.heroTitleLines.map((line, index) => (
            <span key={line}>
              {line}
              {index < settings.heroTitleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Bio left + Faces right */}
        <div className="hero__content">
          <div className="hero__bio animate-fade-in-delay-1">
            <p className="hero__greeting">{settings.heroGreeting}</p>
            {settings.heroBio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="animate-fade-in-delay-2">
            <FloatingFaces />
          </div>
        </div>
      </div>
    </section>
  );
}
