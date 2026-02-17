# 🚀 DJ Booking - Démarrage Rapide

## 5 Minutes pour Commencer

### 1. Installation & Exécution Locale

```bash
# Cloner ou télécharger le projet
cd dj-booking

# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Ouvrir: **http://localhost:3000**

---

### 2. Tester le Formulaire

1. Remplir le formulaire de réservation
2. Cliquer "Envoyer ma Réservation"
3. Les données sont sauvegardées dans `reservations.json`

---

### 3. Voir les Réservations

**Option A: Via le fichier JSON**
```bash
cat reservations.json
```

**Option B: Via l'API**
```bash
curl http://localhost:3000/api/reservations
```

**Option C: Via la page admin**
```
http://localhost:3000/admin.html
```

---

### 4. Déployer sur GitHub

```bash
# Initialiser git
git init
git add .
git commit -m "Initial DJ Booking setup"

# Ajouter votre repository
git remote add origin https://github.com/votre-username/dj-booking.git
git branch -M main
git push -u origin main
```

---

### 5. Déployer en Production

#### Backend (Render)

1. Aller sur https://render.com
2. New Service → Web Service
3. Connecter votre GitHub repository
4. Configuration:
   - Build: `npm install`
   - Start: `npm start`
5. Copier l'URL: `https://dj-booking-xyz.onrender.com`

#### Frontend (Cloudflare Pages)

1. Aller sur https://pages.cloudflare.com
2. New Project → Connect to Git
3. Sélectionner votre repository
4. Build output directory: `public`
5. Obtenir l'URL: `https://dj-booking-123.pages.dev`

#### Domaine Custom

1. Dans Cloudflare Pages: Custom Domain → `events.cax-corp.com`
2. Ajouter CNAME dans votre DNS si nécessaire

---

## 🎨 Personnalisation

### Changer les Couleurs

Éditer `public/styles.css`:

```css
:root {
    --color-primary: #ffffff;      /* Fond clair */
    --color-secondary: #000000;    /* Texte sombre */
    --color-accent: #444444;       /* Accents gris */
}
```

### Ajouter des Champs au Formulaire

Éditer `public/index.html`:

```html
<div class="form-field">
    <label for="newField">Mon Champ</label>
    <input type="text" id="newField" name="newField">
</div>
```

Puis dans `server.js`, valider le nouveau champ:

```javascript
if (!booking.newField) {
    return res.status(400).json({ error: 'newField requis' });
}
```

---

## 📞 Communication Client-Admin

### Recevoir un Email à chaque réservation

Installer SendGrid:

```bash
npm install @sendgrid/mail
```

Ajouter dans `server.js`:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/bookings', async (req, res) => {
    // ... save booking ...
    
    await sgMail.send({
        to: process.env.ADMIN_EMAIL,
        from: 'bookings@events.cax-corp.com',
        subject: `Nouvelle réservation: ${req.body.firstName}`,
        html: `<h2>Détails de la réservation</h2>...`
    });
});
```

Puis ajouter variables d'environnement sur Render:
- `SENDGRID_API_KEY`: votre clé SendGrid
- `ADMIN_EMAIL`: votre email

---

## 🛠️ Structure Fichiers

```
dj-booking/
├── public/                 # Frontend (statique)
│   ├── index.html         # Formulaire réservation
│   ├── admin.html         # Gestion réservations
│   ├── styles.css         # Design + mode sombre
│   └── script.js          # Logique client
├── server.js              # Backend Node.js
├── reservations.json      # Base de données
├── package.json           # Dépendances
└── .env.example           # Variables d'environnement
```

---

## 🔒 Sécurité - Profiter l'Admin

⚠️ **IMPORTANT**: Protéger la page admin avant la production!

Voir `SECURITY.md` pour les options (JWT, IP whitelist, OAuth).

---

## 📊 Gestion des Réservations

### Voir toutes les réservations

```bash
curl https://api.events.cax-corp.com/api/reservations
```

### Mettre à jour le statut

```bash
curl -X PATCH https://api.events.cax-corp.com/api/bookings/ID \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

### Exporter en CSV

1. Aller sur `/admin.html`
2. Cliquer "📥 Exporter en CSV"

---

## 🆘 Troubleshooting

| Problème | Solution |
|----------|----------|
| Port 3000 déjà utilisé | Changer `PORT` dans `.env` |
| Formulaire non envoyé | Vérifier la console (F12) et les logs serveur |
| Mode sombre ne persiste pas | Vérifier localStorage (F12 → Application) |
| API 404 | Vérifier les routes dans `server.js` |
| Réservations perdues | Sauvegarder `reservations.json` via Git |

---

## 📚 Documentation Complète

- **Installation & Déploiement**: Voir `README.md`
- **Procédures Render/Cloudflare**: Voir `DEPLOYMENT.md`
- **Sécurité & Protection Admin**: Voir `SECURITY.md`

---

## 💡 Prochaines Idées

- [ ] Intégration calendrier (vue des disponibilités)
- [ ] Paiement en ligne (Stripe)
- [ ] Notifications email/SMS
- [ ] Analytics (nombre de réservations par mois)
- [ ] Panel admin avec graphiques
- [ ] Confirmation de réservation par email
- [ ] QR code pour check-in événement

---

**Besoin d'aide?** Consulter les fichiers de documentation ou les logs du serveur (F12 → Console & Network).
