# Plan Implementacji - Grzesiowska Art Portfolio

## 1. Stan Projektu (Zrealizowane)

### Design & Branding
- [x] Wdrożenie systemu "Monochrome" (białe tło, czarny tekst).
- [x] Konfiguracja typografii **Host Grotesk** (Google Fonts).
- [x] Implementacja globalnych stylów CSS w `src/app/globals.css`.

### Komponenty UI
- [x] **Hero Section**: Nagłówek tekstowy zasilany z Sanity/fallbacków oraz interaktywna grupa twarzy (`FloatingFaces`).
- [x] **FloatingFaces**: Animacja lewitacji (CSS) oraz efekt "rozchodzenia się" (scatter) na hover (JS physics-based).
- [x] **FolderCard**: Kształt folderu oparty na `Union.svg`, wybór kolorów, efekt "peeking thumbnail" z tyłu folderu.
- [x] **ProjectGrid**: Responsywna siatka folderów na stronie głównej.
- [x] **Header**: Nawigacja zintegrowana z modalem kontaktowym i danymi z `siteSettings`.
- [x] **ContactModal**: Modal z informacjami kontaktowymi z Sanity/fallbacków.
- [x] **AccessForm**: Prosty formularz hasła dla ograniczonego dostępu do portfolio.

### Podstrony
- [x] **Homepage**: Integracja Hero, Grid i Header.
- [x] **Project Detail Page (`[slug]`)**: Dynamiczne renderowanie projektów, obsługa meta-danych (zakres, rok), galeria.
- [x] **ProjectGallery**: System renderowania różnych układów siatki zdjęć (full, two-col, one-two, two-one, three-col, hero-two, grid).
- [x] **O mnie**: Dedykowana strona `src/app/o-mnie/page.tsx`, treść z Sanity/fallbacków.
- [x] **CV**: Dedykowana strona `src/app/cv/page.tsx`, treść i opcjonalny PDF z Sanity/fallbacków.
- [x] **Restricted Access**: Strona `/access`, API `/api/access` oraz `src/proxy.ts` ograniczające publiczne portfolio hasłem.

### Integracja Sanity CMS
- [x] Instalacja i konfiguracja `next-sanity` oraz `sanity`.
- [x] **Schematy**: Definicja typu `project`, modułowego `galleryBlock` oraz globalnego `siteSettings`.
- [x] **Client & Image Utils**: Konfiguracja klienta Sanity i buildera URL dla obrazów, zgodna z aktualnym `@sanity/image-url`.
- [x] **Embedded Studio**: Dostęp do panelu pod adresem `/studio`.
- [x] **Data Fetching**: Logika pobierania danych w `lib/projects.ts` z fallbackiem do hardkodowanych placeholderów.
- [x] **Global Site Settings**: Logika pobierania `siteSettings` w `src/lib/site.ts` z fallbackami dla Hero, kontaktu, O mnie i CV.
- [x] **Sanity Images**: `next.config.ts` dopuszcza obrazy z `cdn.sanity.io`.

---

## 2. Co wciąż wymaga implementacji / Dalsze kroki

### Konfiguracja Środowiska
- [x] **Sanity fallback env**: `NEXT_PUBLIC_SANITY_PROJECT_ID` ma fallback `fzfmzmfr`, a `NEXT_PUBLIC_SANITY_DATASET` ma fallback `production`.
- [ ] **Hasło dostępu**: Ustawić docelowo `PORTFOLIO_ACCESS_PASSWORD` w `.env.local` / hostingu. Aktualny fallback developerski to `portfolio`.

### Treści i CMS
- [ ] **Zasilenie Sanity**: Dodanie rzeczywistych projektów w panelu `/studio`.
- [x] **Walidacja kolorów**: `folderColor` ma walidację HEX w schemacie `project`.
- [ ] **Uzupełnienie siteSettings**: Dodać finalne treści Hero, kontaktu, O mnie, CV i opcjonalny PDF CV w Sanity.

### Dostęp ograniczony
- [x] **Bramka hasła**: Publiczne strony portfolio są chronione przez `src/proxy.ts` i cookie `portfolio_access`.
- [x] **Wyjątki tras**: `/access`, `/api`, `/studio`, `/_next`, pliki statyczne i favicon są wyłączone z blokady.
- [ ] **Docelowe hasło**: Przed publikacją zmienić fallback `portfolio` na realne hasło w zmiennej środowiskowej.

### Optymalizacje
- [x] **SEO podstawowe**: Metadata strony głównej, projektu, O mnie, CV i Access korzystają z `siteSettings`.
- [x] **Performance podstawowe**: Obrazy projektu korzystają z `next/image`, także dla `cdn.sanity.io`.
- [ ] **Performance docelowe**: Dalsza optymalizacja rozmiarów i priorytetów dla ciężkich obrazów galerii.

---

## 3. Uwagi Techniczne
- Projekt korzysta z **Next.js 16 (App Router)** i **Tailwind CSS v4**.
- Większość logiki wizualnej (animacje, layouty folderów) została umieszczona w `globals.css` dla łatwiejszego utrzymania.
- Komponent `FloatingFaces` wykorzystuje `requestAnimationFrame` dla płynnej interakcji 60fps.
- Zgodnie z Next.js 16 ograniczenie dostępu jest zaimplementowane przez `src/proxy.ts`, nie klasyczne `middleware.ts`.
- Mechanizm hasła jest celowo lekki: nie jest pełnym systemem authentication, tylko barierą dostępu dla wybranego grona.
- Ostatnia walidacja po pełnej integracji Sanity: `npm run lint; if ($LASTEXITCODE -eq 0) { npm run build }` zakończyła się powodzeniem.
