# DJ Booking Website

Site web de réservation de DJ full-stack avec design moderne noir/blanc/gris.

## Caractéristiques

- ✅ Formulaire de réservation complet
- ✅ Mode sombre avec toggle
- ✅ Design responsive (mobile-friendly)
- ✅ Sauvegarde en base de données (fichier JSON)
- ✅ API REST pour gérer les réservations
- ✅ Design minimaliste (pas de border-radius)
- ✅ Backend Node.js/Express
- ✅ Frontend HTML/CSS/JavaScript pur
- ✅ Déployable sur Cloudflare Pages

## Structure du Projet

```
├── public/
│   ├── index.html       # Page d'accueil et formulaire
│   ├── styles.css       # Styles (mode sombre inclus)
│   └── script.js        # JavaScript côté client
├── server.js            # Backend Node.js/Express
├── reservations.json    # Base de données (généré automatiquement)
├── package.json         # Dépendances
└── wrangler.toml        # Configuration Cloudflare
```

## Installation

1. **Cloner le repository**
```bash
git clone <votre-repo>
cd dj-booking
```

2. **Installer les dépendances**
```bash
npm install
```

## Développement Local

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Fonctionnalités

### Formulaire de Réservation
- Informations client (prénom, nom, email, téléphone)
- Type d'événement (mariage, anniversaire, corporate, club, festival)
- Date et heure de l'événement
- Durée et budget
- Services additionnels (karaoké, éclairage, animation)
- Message personnalisé

### Mode Sombre
- Toggle dans la navbar
- Sauvegarde de la préférence dans localStorage
- Transition fluide entre les thèmes

### API REST

**POST /api/bookings**
Créer une nouvelle réservation
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "eventType": "marriage",
  "eventDate": "2026-06-15",
  "eventTime": "20:00",
  "eventDuration": 4,
  "location": "Paris, France",
  "guestCount": 150,
  "musicGenre": "Disco, Electronic",
  "services": ["lights", "animation"],
  "budget": 800,
  "message": "Nous voulons une ambiance festive!"
}
```

**GET /api/reservations**
Récupérer toutes les réservations (admin)

**GET /api/bookings/:id**
Récupérer une réservation spécifique

**PATCH /api/bookings/:id**
Mettre à jour le statut d'une réservation
```json
{
  "status": "confirmed"
}
```

**DELETE /api/bookings/:id**
Supprimer une réservation

## Déploiement sur Cloudflare Pages

### Option 1: Cloudflare Pages + Workers

1. **Préprarer votre repository GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connecter à Cloudflare Pages**
- Aller sur https://pages.cloudflare.com
- Connecter votre compte GitHub
- Sélectionner ce repository
- Framework: Node.js
- Build command: `npm install && npm run build`
- Build output directory: `public`

3. **Ajouter un Worker pour le backend**
- Les fichiers statiques seront servis par Pages
- Le backend Node.js doit être séparé

### Option 2: Cloudflare Workers (Plus simple)

Convertir le backend en Cloudflare Workers:

```bash
npm install wrangler -g
wrangler init
```

Puis modifier `wrangler.toml`:
```toml
name = "dj-booking"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
route = "events.cax-corp.com/*"
zone_id = "YOUR_ZONE_ID"

[env.production]
name = "dj-booking-production"
route = "events.cax-corp.com/*"
```

### Option 3: Utiliser Render + Cloudflare Pages

Pour la meilleure expérience avec un vrai backend:

**Backend sur Render:**
1. Créer un compte sur https://render.com
2. New → Web Service
3. Connecter ce repository
4. Build command: `npm install`
5. Start command: `npm start`
6. Ajouter variable d'environnement: `NODE_ENV=production`

**Frontend sur Cloudflare Pages:**
1. Créer un repository séparé avec uniquement le dossier `public/`
2. Connecter à Cloudflare Pages
3. Build command: (vide ou `echo ok`)
4. Build output: `.`

**Configurer le domaine:**
- DNS CNAME ou utilisé directement sur Cloudflare

## Configuration du Domaine

Pour `events.cax-corp.com`:

1. **Si vous utilisez Cloudflare pour le DNS:**
   - Aller dans Cloudflare Dashboard
   - Domain → DNS
   - Ajouter un CNAME record:
     - Name: `events`
     - Target: `pages.cax-corp.com` ou votre endpoint Render

2. **Lier le domaine:**
   - Dans Cloudflare Pages → Custom Domains
   - Ajouter `events.cax-corp.com`

## Sauvegarder les Réservations

Les réservations sont automatiquement sauvegardées dans `reservations.json`:

```json
{
  "reservations": [
    {
      "id": "1702344000000",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com",
      "status": "pending",
      "submittedAt": "2026-02-17T10:00:00.000Z"
    }
  ]
}
```

### Récupérer les réservations

- Accéder à `/api/reservations` pour voir toutes les réservations (JSON)
- Télécharger le fichier `reservations.json` directement via Git
- Mettre en place automatisation pour email via worker/cron job

## Personnalisation

### Couleurs
Modifier les variables CSS dans `public/styles.css`:
```css
:root {
    --color-primary: #ffffff;
    --color-secondary: #000000;
    --color-accent: #444444;
    /* ... */
}
```

### Email de notification
Ajouter une intégration dans `server.js` pour envoyer des emails:
```javascript
// Exemple avec nodemailer
const nodemailer = require('nodemailer');
// ...
```

## Support & Contact

Pour toute question ou problème avec le booking, vérifiez:
1. La console JavaScript du navigateur (F12)
2. Les logs du serveur backend
3. Le fichier `reservations.json`

## License

ISC
