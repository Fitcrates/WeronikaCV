# Status implementacji — GrzesiowskaArt Portfolio

> Ostatnia aktualizacja: 2026-05-12

## 1. Stack technologiczny

- **Next.js** 16.2.6 (App Router, Turbopack)
- **React** 19.2.4
- **Tailwind CSS** v4
- **Sanity** 5.24.0 (`next-sanity` 12.4.5)
- **TypeScript** 5.x
- **Google Fonts**: Host Grotesk

---

## 2. Stan projektu — zrealizowane

### 2.1 Sanity CMS — Schematy

| Typ | Opis | Kluczowe pola |
|-----|------|---------------|
| `project` | Dokument projektu | title, slug, thumbnail, order, **folderColor**, description, scope, actions, year, gallery |
| `galleryBlock` | Blok zdjęć w projekcie | layout (full/two-col/one-two/two-one/three-col/hero-two/**grid**), images[] |
| `siteSettings` | Globalne ustawienia strony | title, description, heroTitleLines[], heroGreeting, heroBio[], projectsTitle, contact (name/email/phone), aboutTitle, aboutContent[], cvTitle, cvContent[], cvFile |

- `folderColor` ma **walidację HEX** oraz **customowy input** `FolderColorInput.tsx` z paletą presetów, natywnym color pickerem i polem tekstowym HEX.
- `galleryBlock.images` wspiera hotspoty i zwraca **metadane orientacji** (`asset->metadata.dimensions`) używane do wymuszania układu `portrait-stack`.

### 2.2 Sanity CMS — Studio

- **Embedded Studio** pod `/studio` działa jako część aplikacji Next.js.
- **Presentation Tool** (`sanity/presentation`) skonfigurowany z resolverami tras dla:
  - Strony głównej (`/`)
  - Strony projektu (`/projekt/:slug`)
  - Strony O mnie (`/o-mnie`)
  - Strony CV (`/cv`)
- **Live Preview / Draft Mode**:
  - Endpoint `GET /api/draft-mode/enable` (via `next-sanity/draft-mode`).
  - Strony pobierają dane z perspektywy `drafts` gdy draft mode jest aktywny.
  - `VisualEditing` z `next-sanity/visual-editing` renderuje się warunkowo w `layout.tsx` tylko w trybie draft.
  - Wymaga `SANITY_API_READ_TOKEN` w `.env.local` do poprawnego działania preview draftów.

### 2.3 Warstwa danych (`src/lib/`)

- **`site.ts`** — `getSiteSettings(preview?)` z fallbackiem do hardkodowanych danych (hero, kontakt, O mnie, CV).
- **`projects.ts`** — `getProjects(preview?)` / `getProjectBySlug(slug, preview?)` z fallbackiem do hardkodowanych projektów.
- **`client.ts`** — `getSanityClient(preview?)` zwraca klienta z `perspective: 'drafts'` i `stega: true` gdy preview = true oraz dostępny jest `SANITY_API_READ_TOKEN`.

### 2.4 Komponenty UI

| Komponent | Rola | Źródło danych |
|-----------|------|---------------|
| `Header` | Nawigacja + trigger modala kontaktowego | `siteSettings.contact` |
| `ContactModal` | Modal z danymi kontaktowymi + linki mailto/tel | `siteSettings.contact` |
| `Hero` | Nagłówek, greeting, bio | `siteSettings` |
| `FloatingFaces` | Interaktywne SVG twarze (levitacja + scatter) | Statyczne `/images/face.svg` |
| `ProjectGrid` | Siatka folderów na stronie głównej | `getProjects()` + `siteSettings.projectsTitle` |
| `FolderCard` | Karta folderu z kolorem i thumbnail | `project.folderColor`, `project.thumbnail` |
| `ProjectGallery` | Renderowanie galerii z różnymi layoutami | `project.gallery` |
| `AccessForm` | Formularz hasła dla restricted access | Własny stan (client) |

### 2.5 Strony (`src/app/`)

| Trasa | Typ | Źródło danych | Draft aware |
|-------|-----|---------------|-------------|
| `/` (home) | Static + dynamic data | `siteSettings`, `getProjects()` | Tak |
| `/projekt/[slug]` | SSG (`generateStaticParams`) | `getProjectBySlug()`, `siteSettings` | Tak |
| `/o-mnie` | Static | `siteSettings` | Tak |
| `/cv` | Static | `siteSettings` | Tak |
| `/access` | Dynamic | `siteSettings` | — |
| `/studio/[[...index]]` | Dynamic (Studio) | — | — |
| `/api/access` | API Route | — | — |
| `/api/draft-mode/enable` | API Route | Sanity token | — |

### 2.6 Ograniczenie dostępu (Restricted Access)

- **`src/proxy.ts`** — Next.js 16 Proxy (zamiast klasycznego middleware).
- Wszystkie publiczne trasy portfolio są przekierowywane na `/access` bez cookie `portfolio_access`.
- Wyjątki: `/access`, `/api`, `/studio`, `/_next`, pliki statyczne, `/favicon.ico`.
- Hasło: zdefiniowane przez `PORTFOLIO_ACCESS_PASSWORD` / `PORTFOLIO_ACCESS_TOKEN` w `.env.local`.
- Domyślne developerskie hasło: `portfolio`.
- Cookie: `portfolio_access`, `httpOnly`, `sameSite: lax`, 30 dni.

### 2.7 CSS / Styling

- Wszystkie style w `src/app/globals.css` (bez inline Tailwind w komponentach).
- System design: białe tło, czarny tekst, pastelowe foldery.
- Animacje: `fadeInUp`, `levitate`, `galleryImageReveal`.
- Layouty galerii: `full`, `two-col`, `one-two`, `two-one`, `three-col`, `hero-two`, `grid`, **`portrait-stack`**.
- Responsywność: breakpointy `640px` i `768px`.
- `prefers-reduced-motion` obsługiwane dla animacji galerii.

### 2.8 Obrazy

- `next/image` używane globalnie.
- `next.config.ts` pozwala na obrazy z `cdn.sanity.io`.
- `FloatingFaces` używa `preload` (zamiast zdeprecjonowanego `priority`) dla pierwszej twarzy, `loading="eager"` + `fetchPriority="high"` dla pozostałych.

---

## 3. Architektura danych — orientacja zdjęć w galerii

- Obrazy z Sanity mają pobierane metadane `asset->metadata.dimensions.aspectRatio`.
- Typ `GalleryImage` zawiera `src` + `orientation` (`landscape` | `portrait` | `square`).
- `ProjectGallery` automatycznie:
  - Jeśli w bloku jest zdjęcie `portrait` i minimum 3 obrazy → renderuje `gallery-row--portrait-stack` (portret lewy, dwa kwadraty prawe).
  - Jeśli w bloku jest `portrait` ale mniej niż 3 obrazy → pomija blok (nie pokazuje samotnego portretu).
  - W przeciwnym razie renderuje zadeklarowany layout.

---

## 4. Środowisko / Zmienne

Wymagane w `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...         # wymagane dla draft preview
PORTFOLIO_ACCESS_PASSWORD=...       # docelowe hasło dla portfolio
# PORTFOLIO_ACCESS_TOKEN=...      # opcjonalny osobny token cookie
```

Fallbacki developerskie:
- `projectId`: `fzfmzmfr`
- `dataset`: `production`
- `access password`: `portfolio`

---

## 5. Walidacja (ostatni build)

```
npm run lint   → OK
npm run build  → OK (12/12 stron, Proxy aktywny)
```

---

## 6. Co wymaga dalszej pracy / Uwagi

### 6.1 Treści w Sanity
- [ ] Uzupełnić rzeczywiste projekty w panelu `/studio`.
- [ ] Uzupełnić finalne treści w `siteSettings` (hero, kontakt, O mnie, CV, opcjonalny PDF CV).

### 6.2 Hasło dostępu
- [ ] Ustawić `PORTFOLIO_ACCESS_PASSWORD` na docelowe hasło przed publikacją.
- [ ] Opcjonalnie: ustawić `PORTFOLIO_ACCESS_TOKEN` jako losowy token cookie.

### 6.3 Live Preview
- [ ] Upewnić się, że `SANITY_API_READ_TOKEN` ma uprawnienia do odczytu `drafts.*`.
- [ ] Przetestować Preview w Studio na środowisku docelowym (lokalnie działa, ale wymaga poprawnego `origin` i CORS).

### 6.4 Optymalizacje
- [ ] Dalsza optymalizacja ładowania ciężkich obrazów galerii (rozmiary, priorytety, `sizes`).
- [ ] Możliwość dodania Sanity CDN caching strategies.

### 6.5 Studio Hosting
- [ ] Aktualnie Studio jest embedded pod `/studio`. Jeśli potrzebny osobny adres, można użyć `npx sanity deploy`.

---

## 7. Struktura plików (kluczowe)

```
src/
  app/
    page.tsx                 # homepage
    layout.tsx               # root layout + VisualEditing (draft)
    globals.css              # cały design system
    access/page.tsx          # bramka hasła
    api/
      access/route.ts         # walidacja hasła + cookie
      draft-mode/enable/route.ts  # włączanie draft mode
    o-mnie/page.tsx
    cv/page.tsx
    projekt/[slug]/page.tsx
    studio/[[...index]]/page.tsx
  components/
    Header.tsx
    ContactModal.tsx
    Hero.tsx
    FloatingFaces.tsx
    ProjectGrid.tsx
    FolderCard.tsx
    ProjectGallery.tsx
    AccessForm.tsx
  lib/
    site.ts                  # siteSettings + fallback
    projects.ts              # projects + fallback + orientation
  sanity/
    schemaTypes/
      projectType.ts
      galleryBlockType.ts
      siteSettingsType.ts
    components/
      FolderColorInput.tsx   # custom color picker
    presentation.ts          # resolvery tras dla Presentation Tool
    lib/
      client.ts
      image.ts
  proxy.ts                  # Next.js 16 Proxy (restricted access)
sanity.config.ts
next.config.ts
```

---

## 8. Decyzje architektoniczne

- **Brak inline Tailwind** — wszystkie style w `globals.css` dla łatwiejszego utrzymania.
- **Server Components domyślnie** — dane pobierane serwerowo, przekazywane jako props do client components.
- **Fallbacki hardcoded** — każda funkcja fetch z Sanity ma fallback, więc strona działa bez podłączonego CMS.
- **Next.js 16 Proxy zamiast middleware.ts** — zgodnie z konwencją Next.js 16.
- **Custom color input zamiast pluginu** — uniknięcie dodatkowych dependency; input zrobiony natywnie w React + Sanity UI.
