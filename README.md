# Stocky en ligne — guide de mise en ligne

Cette version se compose de deux parties :
- **Un serveur** (`server.js`) qui garde vos données en sécurité dans une vraie base de données.
- **L'application** (`public/index.html`) — la même interface que la version précédente, mais connectée à internet au lieu d'être liée à une conversation Claude.

Une fois en ligne, la même adresse (URL) fonctionnera depuis votre PC et votre téléphone, avec les mêmes données synchronisées.

Vous n'avez pas besoin d'installer quoi que ce soit sur votre ordinateur : tout se fait depuis le navigateur, via deux sites gratuits.

---

## Étape 1 — Créer la base de données (Supabase, gratuit)

1. Allez sur **https://supabase.com** et créez un compte gratuit.
2. Cliquez sur **New project**. Donnez-lui un nom (ex. `stocky`) et choisissez un mot de passe pour la base (notez-le quelque part).
3. Attendez ~2 minutes que le projet soit prêt.
4. Allez dans **Project Settings** (icône ⚙️) → **Database** → section **Connection string** → onglet **URI**.
5. Copiez cette chaîne (elle ressemble à `postgresql://postgres:[VOTRE-MOT-DE-PASSE]@...supabase.co:5432/postgres`). Remplacez `[VOTRE-MOT-DE-PASSE]` par le mot de passe choisi à l'étape 2.
6. Gardez cette chaîne de côté — c'est votre `DATABASE_URL`.

## Étape 2 — Mettre le code en ligne (GitHub)

1. Créez un compte gratuit sur **https://github.com** si vous n'en avez pas.
2. Créez un nouveau dépôt (bouton **New**), nommez-le `stocky-online`, laissez-le "Public" ou "Private".
3. Sur la page du dépôt vide, utilisez le bouton **uploading an existing file** et glissez-y tous les fichiers de ce dossier (`server.js`, `package.json`, `seed-data.json`, le dossier `public/`, etc. — **pas besoin** du fichier `.env`, seulement `.env.example`).
4. Validez ("Commit changes").

## Étape 3 — Héberger le serveur (Render, gratuit)

1. Allez sur **https://render.com** et créez un compte (vous pouvez vous connecter avec GitHub directement).
2. Cliquez sur **New** → **Web Service**.
3. Choisissez votre dépôt `stocky-online`.
4. Réglages :
   - **Name** : `stocky` (ou ce que vous voulez)
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : Free
5. Descendez à **Environment Variables** et ajoutez :
   - `DATABASE_URL` = la chaîne copiée à l'étape 1
   - `APP_PASSWORD` = un mot de passe de votre choix pour protéger l'accès
6. Cliquez sur **Create Web Service**. Le déploiement prend 2 à 3 minutes.
7. Une fois terminé, Render vous donne une adresse du type `https://stocky-xxxx.onrender.com` — c'est votre application, accessible depuis n'importe quel appareil.

## Étape 4 — Utiliser l'application

- Ouvrez l'adresse Render sur votre PC **et** sur votre téléphone (dans le navigateur, ou "Ajouter à l'écran d'accueil" sur Android pour un accès rapide comme une appli).
- Entrez le mot de passe défini à l'étape 3.
- Vos données (produits, ventes, achats déjà importés) sont là, partagées entre tous vos appareils.

### Notes importantes

- **Plan gratuit Render** : le serveur "s'endort" après 15 minutes d'inactivité et met ~30 secondes à se réveiller au prochain accès. C'est normal, pas une panne.
- **Sauvegarde** : les données vivent dans Supabase, pas sur Render — vous pouvez redéployer le serveur sans perdre vos données.
- **Sécurité** : le mot de passe protège l'accès, mais gardez-le pour vous. Pour un usage avec plusieurs employés ayant chacun leur compte, ce serait une étape supplémentaire (au-delà de ce guide).
- Si vous modifiez le code plus tard, il suffit de renvoyer les fichiers modifiés sur GitHub — Render redéploie automatiquement.
