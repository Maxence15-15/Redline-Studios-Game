# Mon Studio Launcher

Launcher desktop (Tauri + React) pour distribuer tes jeux — gratuit, hébergé sur GitHub.

## Setup local (une seule fois)

1. **Node.js** : https://nodejs.org (LTS)
2. **Rust** : https://rustup.rs
3. **Dépendances système Tauri** : https://v2.tauri.app/start/prerequisites/
   (Windows: WebView2 déjà présent · macOS: Xcode CLI tools · Linux: webkit2gtk)

```bash
npm install
npm run tauri dev    # lance le launcher en mode dev
```

## Build final (.exe / .dmg / .AppImage)

```bash
npm run tauri build
```
Le fichier installable sort dans `src-tauri/target/release/bundle/`.

## Ajouter un jeu (quand t'en as un fini)

1. Crée un repo GitHub public `launcher-data` (ou réutilise celui-ci)
2. Va dans **Releases** → **Draft a new release** → attache le `.zip` de ton jeu
3. Récupère l'URL du fichier (clic droit sur le lien de téléchargement)
4. Calcule le checksum : `sha256sum monjeu.zip` (Linux/Mac) ou `certutil -hashfile monjeu.zip SHA256` (Windows)
5. Ajoute une entrée dans `manifest.json` :

```json
{
  "games": [
    {
      "id": "mon-jeu",
      "name": "Mon Jeu",
      "version": "1.0.0",
      "description": "Une description courte.",
      "coverUrl": "https://.../cover.png",
      "downloadUrl": "https://github.com/.../releases/download/v1.0.0/monjeu.zip",
      "sha256": "abc123...",
      "sizeMb": 450
    }
  ]
}
```

6. Push ce fichier dans le repo `launcher-data`
7. Dans `src/App.tsx`, remplace `MANIFEST_URL` par l'URL raw de ton fichier :
   `https://raw.githubusercontent.com/TON-USER/launcher-data/main/manifest.json`

Aucun rebuild du launcher nécessaire — il relit le manifest à chaque lancement.

## Structure

```
src-tauri/    → backend Rust (téléchargement, checksum, install dir)
src/          → frontend React (UI, liste jeux, progress bar)
manifest.json → catalogue des jeux (à héberger sur GitHub, PAS à embarquer dans le build)
```
