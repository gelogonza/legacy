<<<<<<< HEAD
# navigator

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/navigator-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.

## Related Guides

- REST ([guide](https://quarkus.io/guides/rest)): A Jakarta REST implementation utilizing build time processing and Vert.x. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it.
- REST Jackson ([guide](https://quarkus.io/guides/rest#json-serialisation)): Jackson serialization support for Quarkus REST. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it
- LangChain4j Anthropic ([guide](https://docs.quarkiverse.io/quarkus-langchain4j/dev/index.html)): Provides integration of Quarkus LangChain4j with Anthropic
=======
# Legacy — Your path to college starts here

**Track 3: Economic Empowerment & Education**  
Built for first-generation Black college students.

---

## Quick Start

```bash
npm install
npm run dev   # → http://localhost:3000
```

Requires an Anthropic API key. The app calls `https://api.anthropic.com/v1/messages` directly.

---

## Project Structure

```
src/
├── App.jsx                    ← Router — all 5 routes live here
├── tokens.css                 ← Design tokens (colors, fonts, spacing)
├── hooks/
│   └── useClaude.js           ← Claude API + system prompts + rec extractor
└── pages/
    ├── Landing.jsx            ← Home screen (matches Figma design)
    ├── Landing.module.css
    ├── ChatPage.jsx           ← Reusable chat UI (all 4 features use this)
    └── ChatPage.module.css
```

---

## Features

| Route | Feature | System Prompt Focus |
|---|---|---|
| `/scholarships` | Scholarship matcher | Personalized scholarship discovery |
| `/fafsa` | FAFSA guide | Plain-language financial aid navigation |
| `/essay` | Essay coach | Authentic college essay feedback |
| `/roadmap` | College roadmap | Personalized college planning timeline |

---

## Adding a New Feature

1. Add a system prompt to `useClaude.js` → `SYSTEM_PROMPTS`
2. Add starter prompts to `ChatPage.jsx` → `STARTERS`
3. Add metadata to `ChatPage.jsx` → `FEATURE_META`
4. Add a card to `Landing.jsx` → `FEATURES`
5. Add a route to `App.jsx`

---

## Design Tokens

All colors are in `tokens.css` as CSS variables:

```css
--orange:       #e8701a   /* Primary CTA, scholarship feature */
--green:        #2d8a45   /* FAFSA feature */
--amber:        #e8a832   /* Stats, essay feature */
--green-light:  #5ec47a   /* Pills, roadmap feature */
--bg:           #0a0a0a   /* Page background */
```

---

## Judging Criteria Alignment

| Criterion | How Legacy addresses it |
|---|---|
| **Impact Potential (25pts)** | Specific population (first-gen Black students), real problem ($7B unclaimed scholarships) |
| **Technical Execution (30pts)** | 4 working AI features, image upload, conversation history, structured rec extraction |
| **Ethical Alignment (25pts)** | Empowers users with information, never makes decisions for them, culturally aware prompts |
| **Presentation (20pts)** | Stats-led pitch opening, clear demo path through all 4 features |
>>>>>>> 96590775790dc33a7edee8f8deccd13f464bb648
