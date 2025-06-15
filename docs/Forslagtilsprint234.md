Your core pipeline is solid—builds are green, 53 unit-tests pass with ≈ 89 % coverage, and every push to **main** now runs automatically in GitHub Actions and can deploy. The next logical milestone is to **unlock real user value** by adding smart AI-writing, richer data entry, and persistence, while keeping quality gates tight. Below is an actionable roadmap that picks up where your “Implementation Plan” left off.

## TL;DR – next three sprints

| Sprint | Focus                             | Key wins                                                    |
| ------ | --------------------------------- | ----------------------------------------------------------- |
| **2**  | **AI-assist + Reference-manager** | Gemini/OpenAI hook, “rød tråd” suggestions, CRUD-referencer |
| **3**  | **Visuals & UX polish**           | Interactive charts, live validation, responsive tweaks      |
| **4**  | **Persistence & Auth**            | LocalForage offline cache → Supabase cloud DB + auth        |

Each sprint is 2-3 days of focused work and can be executed almost entirely through Zencoder chat commands.

---

## 1 Sprint 2 – AI-assist & Reference-manager (2–3 days)

### 1.1 Wire up an AI client

1. **Choose provider**

   * **OpenAI** – `openai` NPM SDK supports streaming completions in TS/React 🡪 quick PoC. ([github.com][1], [medium.com][2])
   * **Gemini** – Google’s Gen-AI SDK, if you want multimodal later. ([ai.google.dev][3], [cloud.google.com][4])

2. **Add service layer**

   ```ts
   // src/services/aiClient.ts
   import OpenAI from 'openai';
   export const ai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_KEY });
   export async function complete(prompt: string) {
     return ai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] });
   }
   ```

   > Prompt templates live in `src/prompts/`.

3. **Hook into the form**

   * On each section’s *blur* or explicit “Improve” button, send content + schema context to `complete()`, then stream the replacement text.

### 1.2 RJSF “array of objects” for references

* Define a `references` array in `report.schema.json` with an `items` object that exposes fields like *author, title, url*. RJSF renders add/remove UI out of the box. ([rjsf-team.github.io][5], [stackoverflow.com][6])

### 1.3 Persist references in component state and feed them back into AI prompts.

### 1.4 Tests & CI

* Mock the AI client in Vitest; assert that buttons fire `complete()`.
* Add a **coverage threshold** to `vitest.config.ts` (`lines: 80`). ([vitest.dev][7])
* Pipeline already green—just push and ensure new tests pass.

---

## 2 Sprint 3 – Visuals & UX polish (2 days)

### 2.1 Advanced Chart.js usage

* Make chart type switchable (`bar`, `line`, `pie`) via dropdown; register datasets on demand.
* Add custom tool-tips to display counts or percentages. ([chartjs.org][8], [medium.com][9])

### 2.2 Live validation

* Enable RJSF live validation so the “Download DOCX” button only enables when form is valid.

### 2.3 Responsive & animation

* Use Tailwind breakpoints and *tailwindcss-animate* for subtle fade-ins.

### 2.4 Quality gates

* Raise coverage requirement to 85 %.
* Set Dependabot or Renovate for weekly dependency PRs.

---

## 3 Sprint 4 – Persistence & Auth (2–3 days)

### 3.1 Offline cache with LocalForage

* Drop‐in wrapper (`useLocalStorageState`) to sync report drafts to IndexedDB. ([medium.com][10])

### 3.2 Cloud backend with Supabase

* Add `@supabase/supabase-js`, create table `reports`.
* Implement sign-up/login via Supabase Auth React hooks. ([supabase.com][11])
* Use Row-Level Security to keep each user’s reports private.

### 3.3 CI/CD deploy

* Extend your existing GitHub Actions pipeline with **Netlify-Deploy** marketplace action or a manual `netlify-lambda` step. ([github.com][12], [raulmelo.me][13])
* Store `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `NETLIFY_AUTH_TOKEN` as repo secrets.

---

## 4 Stretch goals (post-launch)

| Goal                | Why                       | How                                                   |
| ------------------- | ------------------------- | ----------------------------------------------------- |
| **Storybook**       | Visual doc for components | `@storybook/react` + Chromatic snapshot CI            |
| **Error tracking**  | Catch runtime issues      | Sentry React SDK                                      |
| **Electron shell**  | Full offline desktop      | `@electron/remote` + Vite plugin                      |
| **LLM fine-tuning** | Custom style              | Export anonymised reports → fine-tune GPT-3.5/4o mini |

---

## 5 Immediate next commands for Zencoder

```text
# 1 Create AI client & tests
create file src/services/aiClient.ts ...
create file src/hooks/useAI.ts ...
create test src/services/__tests__/aiClient.test.ts ...

# 2 Extend report.schema.json with references array
open report.schema.json
insert ...

# 3 Update Form component to display references
update src/components/ReportForm.tsx ...

# 4 Push & verify CI
run tests
commit -m "feat: AI assist & references"
push
```

Run those in your IDE chat; once the pipeline turns **green**, you’ll have crossed Sprint 2 and be ready for the visualization sprint. Ping me any time you want prompt text, schema snippets, or debugging help along the way!

[1]: https://github.com/activescott/typescript-openai-realtime-api?utm_source=chatgpt.com "TypeScript OpenAI Realtime API Client & Examples - GitHub"
[2]: https://medium.com/%40kylehe970128/how-to-use-openai-api-in-react-js-enhancing-your-applications-with-ai-in-2024-02e248fdc889?utm_source=chatgpt.com "How to Use OpenAI API in React JS: Enhancing Your Applications ..."
[3]: https://ai.google.dev/gemini-api/docs/quickstart?utm_source=chatgpt.com "Gemini API quickstart | Google AI for Developers"
[4]: https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal?utm_source=chatgpt.com "Quickstart: Generate text using the Vertex AI Gemini API"
[5]: https://rjsf-team.github.io/react-jsonschema-form/docs/json-schema/arrays/?utm_source=chatgpt.com "Arrays | react-jsonschema-form - GitHub Pages"
[6]: https://stackoverflow.com/questions/52232697/how-to-make-array-type-schema-objects-appear-one-in-a-row-react-jsonschema-form?utm_source=chatgpt.com "How to make array type schema objects appear one in a row? react ..."
[7]: https://vitest.dev/guide/coverage?utm_source=chatgpt.com "Coverage | Guide - Vitest"
[8]: https://www.chartjs.org/docs/latest/samples/tooltip/content.html?utm_source=chatgpt.com "Custom Tooltip Content | Chart.js"
[9]: https://medium.com/%40anil.karki93/customizing-react-chartjs-2-tooltip-scrollable-20a2c1e37af9?utm_source=chatgpt.com "Customizing react-chartjs-2 tooltip (Scrollable) | by Anil Karki - Medium"
[10]: https://medium.com/%40padmagnanapriya/react-apps-with-localforage-effortless-local-storage-management-e1308656ac11?utm_source=chatgpt.com "React Apps with LocalForage: Effortless Local Storage Management"
[11]: https://supabase.com/docs/guides/auth/quickstarts/react?utm_source=chatgpt.com "Use Supabase Auth with React"
[12]: https://github.com/marketplace/actions/netlify-deploy?utm_source=chatgpt.com "Netlify Deploy · Actions · GitHub Marketplace"
[13]: https://www.raulmelo.me/en/blog/deploying-netlify-github-actions-guide?utm_source=chatgpt.com "Deploying on Netlify via GitHub Actions: A Seamless Guide"
