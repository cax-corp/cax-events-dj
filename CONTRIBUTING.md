# Contribuer au Projet DJ Booking

## Workflow Git

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/dj-booking.git
cd dj-booking
```

### 2. Créer une branche for vos changements

```bash
git checkout -b feature/ma-feature
```

### 3. Faire des changements

Modifier vos fichiers (HTML, CSS, JS, etc.)

### 4. Tester localement

```bash
npm start
# Ouvrir http://localhost:3000
```

### 5. Commit & Push

```bash
git add .
git commit -m "Description claire du changement"
git push origin feature/ma-feature
```

### 6. Créer un Pull Request

Sur GitHub, créer un PR pour que les changements soient reviewés.

---

## Workflow de Déploiement Automatique

Chaque push sur `main` déclenche automatiquement:

1. ✅ Tests sur GitHub Actions (si configuré)
2. ✅ Build sur Render (backend)
3. ✅ Build sur Cloudflare Pages (frontend)
4. ✅ Déploiement en live sur `events.cax-corp.com`

**Attendre 2-5 minutes après le push pour que les changements soient visibles.**

---

## Commit Messages

Utiliser des messages clairs:

```bash
# ✅ Bon
git commit -m "Ajouter validation email au formulaire"

# ❌ Mauvais
git commit -m "Fix stuff"
```

### Format recommandé

```
[TYPE] Description courte

Description plus détaillée si nécessaire.

Exemples:
- [FEATURE] Ajouter mode sombre
- [FIX] Corriger bug de validation
- [DOCS] Mettre à jour README
- [STYLE] Reformatter le CSS
- [REFACTOR] Simplifier le code backend
```

---

## Bonnes Pratiques

1. **Code Propre**: Indentation cohérente, noms explicites
2. **Responsive**: Tester sur mobile (F12 → Toggle device toolbar)
3. **Performance**: Minimiser les requêtes API inutiles
4. **Sécurité**: Valider tous les inputs côté serveur
5. **Commentaires**: Documenter le code complexe
6. **Tests**: Vérifier localement avant de pusher

---

## Structure de Code

### Frontend (HTML/CSS/JS)

- **index.html**: Formulaire & page d'accueil
- **admin.html**: Gestion des réservations
- **styles.css**: Design & thèmes
- **script.js**: Logique client & API calls

### Backend (Node.js)

- **server.js**: Routes Express & API endpoints
- **reservations.json**: Base de données

---

## Issues & Bugs

Si vous trouvez un bug:

1. Créer une GitHub Issue
2. Décrire le problème précisément
3. Fournir des étapes pour reproduire
4. Utiliser un screenshot si applicable

---

## Questions?

Consulter les fichiers de documentation:
- `README.md`: Vue d'ensemble
- `QUICKSTART.md`: Démarrage rapide
- `DEPLOYMENT.md`: Procédures de déploiement
- `SECURITY.md`: Sécurité & protection

---
