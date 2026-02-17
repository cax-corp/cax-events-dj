# DJ Booking - Sécurité & Protection Admin

## ⚠️ Important: Sécuriser votre page Admin

La page admin (`/admin.html`) est actuellement publique. Pour la déploiement en production, vous DEVEZ l'protéger.

## Options de Sécurisation

### Option 1: Authentification basique (Simple)

Modifier `server.js`:

```javascript
// Middleware d'authentification
const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-123';

app.use('/admin.html', (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    
    const token = auth.substring(7);
    if (token !== adminPassword) {
        return res.status(403).json({ error: 'Accès refusé' });
    }
    
    next();
});
```

Puis accéder: `https://events.cax-corp.com/admin.html?token=votre_password`

### Option 2: IP Whitelist (Recommandé)

```javascript
const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',') || ['127.0.0.1'];

app.use('/admin.html', (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    if (!ALLOWED_IPS.includes(ip)) {
        return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
});
```

### Option 3: JWT Token (Plus sécurisé)

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');

app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const token = jwt.sign(
        { admin: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    res.json({ token });
});

app.use('/admin.html', (req, res, next) => {
    const token = req.headers.authorization?.substring(7);
    if (!token) return res.status(401).json({ error: 'Non autorisé' });
    
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ error: 'Token invalide' });
    }
});
```

### Option 4: OAuth/Google (Professionnel)

```bash
npm install passport passport-google-oauth20
```

Intégrer Google Sign-In pour authentification.

---

## ✅ Pour la Production - Checklist Sécurité

- [ ] Protéger `/admin.html` avec authentification
- [ ] Utiliser HTTPS (Cloudflare le fait automatiquement)
- [ ] Ajouter rate limiting aux endpoints API
- [ ] Valider les données côté serveur
- [ ] Utiliser des variables d'environnement pour les secrets
- [ ] Ajouter CORS restrictif (domaines autorisés)
- [ ] Mettre à jour les dépendances npm régulièrement
- [ ] Sauvegarder regularly les réservations (git push)
- [ ] Monitorer les erreurs (Sentry, LogRocket)
- [ ] Faire des backups du fichier `reservations.json`

---

## Protéger l'API de Réservation

Vous pouvez ajouter un honeypot ou un CAPTCHA:

```html
<!-- Honeypot -->
<input type="text" name="website" style="display:none;">
```

```javascript
// Vérifier dans server.js
if (req.body.website) {
    return res.status(400).json({ error: 'Formulaire invalide' });
}
```

Ou intégrer hCaptcha:

```bash
npm install hcaptcha
```

---

## Base de données sécurisée

À long terme, remplacer `reservations.json` par une DB:

```javascript
// Avec MongoDB Atlas
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const reservationSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    // ...
});
```

---
