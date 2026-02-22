# Poplatkový agent – Městský soud v Praze

## Požadavky
- Node.js (https://nodejs.org) — verze 14 nebo novější
- API klíč Anthropic (https://console.anthropic.com)

## Spuštění

### Windows
```
set ANTHROPIC_API_KEY=sk-ant-api03-...
node server.js
```
Poté otevřete prohlížeč na: http://localhost:3000

### Mac / Linux
```
export ANTHROPIC_API_KEY=sk-ant-api03-...
node server.js
```
Poté otevřete prohlížeč na: http://localhost:3000

## Obsah balíčku
- `index.html` — hlavní aplikace (šablona výzvy a sazebník jsou zabudovány)
- `server.js` — lokální server + proxy pro Anthropic API
- `README.md` — tento návod

## Použití
1. Spusťte server (viz výše)
2. Otevřete http://localhost:3000 v prohlížeči
3. Nahrajte PDF žaloby
4. Odpovídejte na otázky agenta kliknutím na tlačítka
5. Stáhněte vygenerovanou výzvu (.docx)
