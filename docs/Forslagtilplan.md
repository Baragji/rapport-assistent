Fokus på **tests + CI/CD** nu er fornuftigt – det giver dig en “sikkerheds­net”-pipeline, så alle fremtidige AI-genererede ændringer bliver bygget, testet og (hvis du ønsker det) auto-deployet, før de når *main*.  Nedenfor finder du (1) en kort opsummering af status, (2) en trin-for-trin-plan der kan køres direkte i din IDE-chat til Zencoder-agenten, samt (3) konkrete YAML-udsnit og kommandolinjer.

## 1 · Status‐tjek

* **Repoet bygger lokalt** med Vite/Tailwind/TypeScript, og Vitest/RTL er installeret ✔ ([stevekinney.com][1])
* **DOCX-exporter** laver stadig kun en tekst-Blob ⚠ ([npmjs.com][2])
* **Ingen workflows** i `.github/workflows/` endnu ⚠ (agenten foreslog at sætte dem op)
* Koden ligger allerede på GitHub → perfekt udgangspunkt for Actions.

## 2 · Sprint “CI & Test-net”

### 2.1 – Skriv basale tests (≤½ dag)

| Komponent       | Testidé                                  | Hvorfor                                                                    |
| --------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| `Form` (RJSF)   | Renders schema, calls `onSubmit`         | Sikrer at JSON-schema-ændringer ikke knækker UI ([rjsf-team.github.io][3]) |
| `DocumentUtils` | `toDocx(markdown)` returns Blob.size > 0 | Fanger regressioner når du erstatter placeholder-kode ([npmjs.com][2])     |
| `PieChart`      | Prop-change rerenders data               | Garanterer dynamisk statistik når rapporter ændres ([github.com][4])       |

**Prompt til Zencoder:**

```
create vitest tests for Form.tsx, DocumentUtils.ts, PieChart.tsx using
@testing-library/react. Aim for 80% coverage and add the "test" script
to package.json as "vitest run --coverage".
```

> *Tip:* React Testing Library med Vitest kører lynhurtigt og fungerer fint i CI-miljøer ([testing-library.com][5]).

### 2.2 – Opsæt GitHub Actions (≤½ dag)

<details>
<summary>📄 <code>.github/workflows/ci.yml</code> (kopiér direkte)</summary>

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18.x, 20.x]   # fremtidssikret
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'      # hurtigere builds :contentReference[oaicite:6]{index=6}

      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build

      - name: Upload coverage to job summary
        uses: davelosert/vitest-coverage-report-action@v2 :contentReference[oaicite:7]{index=7}
```

</details>

### 2.3 – (Valgfri) Auto-deploy til Netlify/Vercel

1. Opret site på Netlify og tilføj `NETLIFY_AUTH_TOKEN` & `NETLIFY_SITE_ID` som repo-secrets.
2. Tilføj en ekstra job-skabelon (fx `deploy-netlify.yml`) – se guide ([raulmelo.me][6]).

> Hvis du hellere vil ud på GitHub Pages, brug en enkelt “build → upload”-workflow ([github.com][7]).

### 2.4 – Security & audit-step (30 min)

Tilføj til sidst i job-matricen:

```yaml
- run: npm audit --production
```

Så fejler workflowet, hvis kendte sårbarheder rammer dine afhængigheder ([docs.github.com][8]).

### 2.5 – Branch-protection

* Slå “Require status checks to pass before merge” til på `main`.
* Vælg jobs: **build-test** (og evt. deploy).

Så har du et **rødt/grønt lys** før hver PR-merge.

## 3 · Næste trin efter CI-nettet

| Når CI er grønt     | Gør dette                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ **Tests passer**  | Udskift placeholder‐Blob i `DocumentUtils` med rigtig `md-to-docx` kode ([npmjs.com][9]) og skriv en ekstra test.                       |
| ✅ **DOCX OK**       | Begynd AI-hook + reference-manager (Sprint 2 i den tidligere plan).                                                                     |
| ✅ **AI integreret** | Udvid coverage og sæt minimumsgrænse i `vitest.config.ts`, fx `lines: 80` (Vitest understøtter thresholds direkte ([the-koi.com][10])). |

---

## 4 · Kommandolinje-cheatsheet

```bash
# Kør alle tests lokalt m. coverage
npm run test -- --coverage

# Simulér Actions build lokalt (hurtig sanity)
npm run lint && npm run build

# Start workflow manuelt (fra GitHub UI)
gh workflow run CI
```

---

### Klar til at køre?

1. **Indsæt `ci.yml`** via Zencoder-chat (`create file .github/workflows/ci.yml ...`).
2. **Kør “run tests”** for at sikre at alt passerer lokalt.
3. **Push til GitHub**, se actions-tab – justér hvis matrixen eller ESLint-regler brækker buildet.

Skriv når pipelinen er grøn, så kan vi tage fat på *AI-integration* eller det næste test-hul!

[1]: https://stevekinney.com/courses/testing/continuous-integration?utm_source=chatgpt.com "Setting Up GitHub Actions to Run Vitest Unit Tests - Steve Kinney"
[2]: https://www.npmjs.com/package/%40mohtasham/md-to-docx?utm_source=chatgpt.com "mohtasham/md-to-docx - NPM"
[3]: https://rjsf-team.github.io/react-jsonschema-form/docs/?utm_source=chatgpt.com "Introduction | react-jsonschema-form - GitHub Pages"
[4]: https://github.com/marketplace/actions/vitest-coverage-report?utm_source=chatgpt.com "Vitest Coverage Report · Actions · GitHub Marketplace"
[5]: https://testing-library.com/docs/svelte-testing-library/setup/?utm_source=chatgpt.com "Setup - Testing Library"
[6]: https://www.raulmelo.me/en/blog/deploying-netlify-github-actions-guide?utm_source=chatgpt.com "Deploying on Netlify via GitHub Actions: A Seamless Guide"
[7]: https://github.com/sitek94/vite-deploy-demo?utm_source=chatgpt.com "Deploy Vite app to GitHub Pages using GitHub Actions"
[8]: https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs?utm_source=chatgpt.com "Building and testing Node.js - GitHub Docs"
[9]: https://www.npmjs.com/package/%40adobe/helix-md2docx?utm_source=chatgpt.com "adobe/helix-md2docx - NPM"
[10]: https://www.the-koi.com/projects/setting-up-a-superfast-ci-with-vitest-and-github-actions/?utm_source=chatgpt.com "Setting up a superfast CI with Vitest and GitHub Actions | The Koi"
