# 🚀 Migration vers Cloudflare Workers

Guide complet pour passer de Render à Cloudflare Workers.

## Avantages

✅ **Ultra-rapide** - Réseau global Cloudflare  
✅ **Gratuit** - 100k requêtes/mois sans payer  
✅ **Zéro configuration serveur** - Pas de VM, pas de Node  
✅ **Auto-scaling** - Pas besoin de gérer les ressources  
✅ **Meilleure DDoS protection** - Inhérent à Cloudflare  
✅ **Même dashboard** que Cloudflare Pages

## ⚠️ Ce qui change

| Élément | Avant (Render) | Après (Cloudflare) |
|---------|----------------|-------------------|
| Backend | Node.js + Express | Cloudflare Worker |
| Base de données | reservations.json | Cloudflare KV |
| Fichiers statiques | Express static | R2 ou Pages |
| Déploiement | git push | wrangler deploy |
| Coût | $7/mois (gratuit si peu visité) | **$0 (gratuit)** |

## 📋 Étapes de Migration

### 1️⃣ Prérequis
- Compte Cloudflare avec domaine cax-corp.com
- Wrangler CLI installé: `npm install -g wrangler`
- Code actuel préparé (déjà fait ✓)

### 2️⃣ Créer les ressources Cloudflare

#### A) Créer un KV Namespace (pour les réservations)

```bash
wrangler kv:namespace create "RESERVATIONS_KV"
# Retourne: { binding = "RESERVATIONS_KV", id = "xxxx", preview_id = "yyyy" }
```

Copier `id` et `preview_id` dans `wrangler.toml` :
```toml
[[kv_namespaces]]
binding = "RESERVATIONS_KV"
id = "copier-ici"
preview_id = "copier-ici"
```

#### B) Créer un R2 Bucket (pour les fichiers statiques)

```bash
wrangler r2 bucket create dj-booking-assets
```

#### C) Uploader les fichiers statiques

```bash
# HTML, CSS, JS
wrangler r2 object put dj-booking-assets public/index.html
wrangler r2 object put dj-booking-assets public/landing.html
wrangler r2 object put dj-booking-assets public/admin.html
wrangler r2 object put dj-booking-assets public/login.html
wrangler r2 object put dj-booking-assets public/styles.css
wrangler r2 object put dj-booking-assets public/script.js
```

Ou en batch :
```bash
# Windows
Get-ChildItem "public\*" | ForEach-Object { wrangler r2 object put dj-booking-assets $_.Name --file $_.FullName }

# macOS/Linux
for file in public/*; do wrangler r2 object put dj-booking-assets $(basename $file) --file "$file"; done
```

### 3️⃣ Configurer les Secrets

```bash
# Ajouter le Webhook Discord
wrangler secret put DISCORD_WEBHOOK

# (Copier/coller la URL depuis .env)
# https://discord.com/api/webhooks/1473446171358793861/...
```

### 4️⃣ Connecter le domaine custom

1. Aller sur **Cloudflare Dashboard** → **dev.cax-corp.com** (ou votre domaine)
2. **Workers** → **Add route**
3. Entrer: `events.cax-corp.com/*`
4. Sélectionner le worker `dj-booking`
5. Save

### 5️⃣ Déployer le Worker

```bash
# Test local
wrangler dev

# Déployer en production
wrangler deploy --env production
```

L'API sera accessible sur: `https://events.cax-corp.com/api/*`

### 6️⃣ Mettre à jour les URLs dans le frontend

**script.js** et **admin.html** pointent déjà vers Render. Ils continueront à fonctionner car ils sont déployés sur Cloudflare Pages (le même domaine), donc les requêtes seront automatiquement routées vers le Worker.

Si vous avez une API externe, update :
```javascript
// Avant
const API_URL = 'https://cax-events-dj-api.onrender.com';

// Après (pas besoin de changer si même domaine)
const API_URL = 'https://events.cax-corp.com';
```

### 7️⃣ Vérifier que ça fonctionne

```bash
# Test l'endpoint API
curl https://events.cax-corp.com/api/reservations

# Test le landing page
curl https://events.cax-corp.com/
```

## 🔄 Migrer de Render vers Cloudflare

### Exporter les données

1. Télécharger `reservations.json` de Render
2. Migrer les données vers KV :

```bash
# Créer un script pour importer les données
node -e "
const data = require('./reservations.json');
const kv = await RESERVATIONS_KV.put('reservations', JSON.stringify(data));
console.log('Data migrated!');
"
```

### Arrêter l'ancien serveur

1. Aller sur https://render.com
2. Supprimer le service `cax-events-dj-api`
3. Vérifier que toutes les requêtes viennent du Worker Cloudflare

## ⚙️ Configuration Avancée

### Cache les réponses GET

```javascript
// Dans src/index.js, ajouter aux handlers GET:
response.headers.set('Cache-Control', 'max-age=3600');
```

### Ajouter une authentification admin

```javascript
// Protéger /admin.html
if (pathname === '/admin.html') {
    const auth = request.headers.get('Authorization');
    if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
        return new Response('Unauthorized', { status: 401 });
    }
}
```

### Rate limiting

```javascript
// Cloudflare Workers propose rate limiting natif
// Configurer dans dashboard → Security → Rate limiting
```

## 🆘 Troubleshooting

### Erreur: "KV binding not found"
```bash
wrangler kv:namespace list
# Vérifier que les IDs dans wrangler.toml correspondent
```

### R2 bucket pas accessible
```bash
wrangler r2 bucket list
# Vérifier le nom du bucket
```

### Files not found
```bash
wrangler r2 object list dj-booking-assets
# Lister les fichiers dans le bucket
```

### Cost implications

**Avant (Render):**
- Gratuit (free tier) ou $7/mois

**Après (Cloudflare Workers):**
- **100k requêtes/mois: GRATUIT**
- €0.50 par million de requêtes supplémentaires
- KV: $0.50/million de lectures, $5/million d'écritures (suffisant pour toi)
- R2: $0.015/GB stocké + €0.01/million de requêtes

**Estimation pour un site DJ:**
- 1000 réservations = 1000 POST
- Accès admin = 100 GET/jour
- **Coût mensuel: < €1 (en dessous de la limite gratuite)**

## Checklist Finale

- [ ] KV Namespace créé et configuré
- [ ] R2 Bucket créé avec tous les fichiers
- [ ] Discord Webhook en secret
- [ ] wrangler.toml complètement configuré
- [ ] Worker déployé (`wrangler deploy`)
- [ ] Route custom activée (events.cax-corp.com/*)
- [ ] Tester POST à `/api/bookings`
- [ ] Recevoir notification Discord
- [ ] Données sauvegardées dans KV
- [ ] Admin peut voir réservations via admin.html
- [ ] Ancien serveur Render arrêté
- [ ] DNS pointe vers Cloudflare

## Support & Questions

- Docs Cloudflare Workers: https://developers.cloudflare.com/workers/
- Docs KV: https://developers.cloudflare.com/kv/
- Docs R2: https://developers.cloudflare.com/r2/

---

**Status: ✅ Prêt pour Cloudflare Workers**
