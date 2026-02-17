# DJ Booking - Guide de Déploiement

## 1. GitHub Setup

```bash
# Initialiser un repository Git
cd votre-projet-dj-booking
git init
git add .
git commit -m "Initial commit - DJ Booking Website"
git branch -M main
git remote add origin https://github.com/votre-username/dj-booking.git
git push -u origin main
```

## 2. Déploiement sur Render (Backend)

### Étape 1: Créer un compte Render
- Aller sur https://render.com
- S'inscrire avec GitHub

### Étape 2: Créer un Web Service
1. Dashboard → New → Web Service
2. Connecter votre repository GitHub
3. Configuration:
   - **Name**: dj-booking-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou Paid selon tes besoins)

### Étape 3: Configuration des Variables Environnement
1. Dashboard → Settings
2. Environment Variables:
   - `NODE_ENV`: production
   - `PORT`: 3000

### Étape 4: Domaine Custom
1. Settings → Custom Domain
2. Ajouter: `api.events.cax-corp.com` (ou `events.cax-corp.com` si une seule URL)

Ensuite dans ton DNS/Cloudflare:
- Type: CNAME
- Name: `api` (ou `events`)
- Target: `dj-booking-api.onrender.com` (donné par Render)

---

## 3. Déploiement sur Cloudflare Pages (Frontend)

### Option A: Frontend + Backend ensemble (Simple)

Si tu veux tout sur Cloudflare:

1. **Configuration Cloudflare Worker pour le backend**

File: `functions/api/[[catch-all]].js`
```javascript
export async function onRequest(context) {
  const { request } = context;
  
  // Point vers ton backend Render
  const RENDER_API = 'https://dj-booking-api.onrender.com';
  
  if (request.url.includes('/api/')) {
    const url = new URL(request.url);
    const apiUrl = new URL(url.pathname + url.search, RENDER_API);
    
    return fetch(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }
  
  return context.next();
}
```

2. **Connecter à Cloudflare Pages**
   - Pages → Create a project → Connect to Git
   - Sélectionner `dj-booking` repository
   - Framework: None
   - Build output directory: `public`

### Option B: Frontend sur Cloudflare, Backend sur Render

1. Créer deux repositories:
   - `dj-booking-backend` (actuellement sur Render)
   - `dj-booking-frontend` (contenant juste `public/`)

2. Dans `public/script.js`, changer l'URL de l'API:
```javascript
const API_URL = 'https://api.events.cax-corp.com'; // ou la URL Render

fetch(`${API_URL}/api/bookings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

3. Déployer le frontend sur Cloudflare Pages

---

## 4. Configuration DNS Cloudflare

Si tu gères le DNS via Cloudflare:

### Records à ajouter:

```
Type  | Name    | Content                      | TTL   | Proxy
------|---------|------------------------------|-------|-------
A     | cax-corp| (IP Cloudflare)             | Auto  | ✓
CNAME | events  | dj-booking-api.onrender.com | Auto  | ✓ (ou DNS only)
```

Ou si tu utilises Cloudflare Pages:
```
CNAME | events  | dj-booking.pages.dev        | Auto  | ✓
```

---

## 5. Auto-Déploiement avec GitHub

### Chaque `git push` redéploiera automatiquement:

✅ Render surveille la branche `main`
✅ Cloudflare Pages surveille la branche `main`

Juste faire:
```bash
git add .
git commit -m "Mise à jour du design / formulaire"
git push origin main
```

---

## 6. Vérifier le Déploiement

- **Frontend**: https://events.cax-corp.com
- **API**: https://api.events.cax-corp.com/api/reservations
- **Réservations JSON**: Consulter via Render Dashboard

---

## 7. Webhooks pour Email de Notification

Pour envoyer des emails quand une réservation arrive:

### Option 1: Zapier (Gratuit)
- Webhook trigger when POST /api/bookings
- Send email via Gmail/Outlook

### Option 2: SendGrid + Node.js
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/bookings', async (req, res) => {
  // ... save booking ...
  
  const msg = {
    to: 'votre-email@cax-corp.com',
    from: 'bookings@events.cax-corp.com',
    subject: `Nouvelle réservation: ${req.body.firstName} ${req.body.lastName}`,
    html: `<h2>Détails de la réservation...</h2>...`
  };
  
  await sgMail.send(msg);
});
```

### Option 3: Airtable Integration
Envoyer les réservations directement à une base Airtable

---

## 8. Gestion des Réservations

### Via l'API:
```bash
# Voir toutes les réservations
curl https://api.events.cax-corp.com/api/reservations

# Confirmer une réservation
curl -X PATCH https://api.events.cax-corp.com/api/bookings/1702344000000 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# Supprimer une réservation
curl -X DELETE https://api.events.cax-corp.com/api/bookings/1702344000000
```

### Via le fichier Git:
Le fichier `reservations.json` est dans le repository.
- Pullez les changements: `git pull`
- Vérifiez les réservations dans `reservations.json`

---

## ⚠️ Important pour Cloudflare Pages

Cloudflare Pages est pour du static hosting. Pour un vrai backend, tu dois:

1. ✅ Garder le backend sur **Render** (gratuit, inclus)
2. ✅ Frontend sur **Cloudflare Pages** (gratuit, illimité)
3. ✅ Configurer **CORS** dans server.js (déjà fait!)
4. ✅ Pointer vers l'API Render depuis le frontend

---

## Troubleshooting

### Erreur CORS:
→ Vérifier que `cors()` est activé dans `server.js`

### Réservations non sauvegardées:
→ Vérifier les permissions de fichier sur Render
→ Utiliser une base de données (MongoDB, PostgreSQL) en production

### Domaine ne pointe pas:
→ Attendre 15-30min que les DNS se propagent
→ Vérifier les records dans Cloudflare DNS

---

## Prochaines Étapes

1. [ ] Créer repository GitHub
2. [ ] Déployer backend sur Render
3. [ ] Déployer frontend sur Cloudflare Pages
4. [ ] Configurer le domaine `events.cax-corp.com`
5. [ ] Ajouter email notifications
6. [ ] Customiser le design selon ta marque
7. [ ] Ajouter page admin pour gérer les réservations

---
