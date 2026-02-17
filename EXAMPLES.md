# Exemple de Données - DJ Booking

## Exemple de Réservation Soumise

Après avoir rempli et soumis le formulaire, voici à quoi ressemble la réservation dans `reservations.json`:

### JSON Format

```json
{
  "id": "1708169200000",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@exemple.com",
  "phone": "+33612345678",
  "eventType": "marriage",
  "eventDate": "2026-06-20",
  "eventTime": "20:00",
  "eventDuration": "4",
  "location": "Paris 12e, France",
  "guestCount": "150",
  "musicGenre": "Disco, Soul, 80s",
  "services": [
    "lights",
    "animation"
  ],
  "budget": "1500",
  "message": "Nous voulons créer une ambiance festive et dansante. Le couple adore les années 80 et 90!",
  "status": "pending",
  "submittedAt": "2026-02-17T14:30:00.000Z"
}
```

---

## Champs Expliqués

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `id` | string | Identifiant unique (timestamp) | "1708169200000" |
| `firstName` | string | Prénom du client | "Jean" |
| `lastName` | string | Nom du client | "Dupont" |
| `email` | string | Email pour contact | "jean@exemple.com" |
| `phone` | string | Téléphone | "+33612345678" |
| `eventType` | string | Type d'événement | "marriage" |
| `eventDate` | string | Date au format YYYY-MM-DD | "2026-06-20" |
| `eventTime` | string | Heure au format HH:MM | "20:00" |
| `eventDuration` | string | Durée en heures | "4" |
| `location` | string | Adresse complète | "Paris, France" |
| `guestCount` | string | Nombre de personnes | "150" |
| `musicGenre` | string | Genres musicaux souhaités | "Disco, Soul" |
| `services` | array | Services additionnels | ["lights", "animation"] |
| `budget` | string | Budget en euros | "1500" |
| `message` | string | Message personnalisé | "Description..." |
| `status` | string | État de la réservation | "pending", "confirmed", "rejected" |
| `submittedAt` | string | Date/heure ISO soumission | "2026-02-17T14:30:00.000Z" |

---

## Types d'Événements Disponibles

```
- marriage (Mariage)
- birthday (Anniversaire)
- corporate (Événement Corporatif)
- club (Club/Bar)
- festival (Festival)
- other (Autre)
```

---

## Services Additionnels

```
- karaoke (Karaoké)
- lights (Éclairage)
- animation (Animation)
- equipment (Équipement Audio)
```

Plusieurs services peuvent être sélectionnés (array).

---

## Statuts de Réservation

```
- pending (En attente - défaut)
- confirmed (Confirmée)
- rejected (Rejetée)
```

---

## Fichier reservations.json Complet

```json
{
  "reservations": [
    {
      "id": "1708169200000",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@exemple.com",
      "phone": "+33612345678",
      "eventType": "marriage",
      "eventDate": "2026-06-20",
      "eventTime": "20:00",
      "eventDuration": "4",
      "location": "Paris, France",
      "guestCount": "150",
      "musicGenre": "Disco, Soul",
      "services": ["lights", "animation"],
      "budget": "1500",
      "message": "Ambiance festive pour mariage",
      "status": "pending",
      "submittedAt": "2026-02-17T14:30:00.000Z"
    },
    {
      "id": "1708255600000",
      "firstName": "Marie",
      "lastName": "Martin",
      "email": "marie.martin@exemple.com",
      "phone": "+33698765432",
      "eventType": "birthday",
      "eventDate": "2026-03-15",
      "eventTime": "22:00",
      "eventDuration": "5",
      "location": "Lyon 2e, France",
      "guestCount": "100",
      "musicGenre": "Electronic, House",
      "services": ["karaoke"],
      "budget": "800",
      "message": "30e anniversaire surprise!",
      "status": "confirmed",
      "submittedAt": "2026-02-18T10:00:00.000Z",
      "updatedAt": "2026-02-18T11:30:00.000Z"
    }
  ]
}
```

---

## Récupérer une Réservation via API

### Voir toutes les réservations

```bash
curl http://localhost:3000/api/reservations
```

### Voir une réservation spécifique

```bash
curl http://localhost:3000/api/bookings/1708169200000
```

Response:
```json
{
  "id": "1708169200000",
  "firstName": "Jean",
  "lastName": "Dupont",
  ...
}
```

---

## Mettre à Jour une Réservation

```bash
curl -X PATCH http://localhost:3000/api/bookings/1708169200000 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

Response:
```json
{
  "success": true,
  "message": "Réservation mise à jour",
  "booking": {
    "id": "1708169200000",
    "status": "confirmed",
    "updatedAt": "2026-02-18T15:45:00.000Z",
    ...
  }
}
```

---

## Exporter les Données

### Via CSV (page admin)

1. Aller sur `http://localhost:3000/admin.html`
2. Cliquer "📥 Exporter en CSV"
3. Fichier téléchargé: `reservations.csv`

### Via Command Line

```bash
cat reservations.json | jq '.' > reservations-formatted.json
```

### Via Git

```bash
git pull
cat reservations.json | jq '.reservations[] | [.firstName, .lastName, .email, .budget]'
```

---

## Stats Dashboard (Admin.html)

La page admin affiche automatiquement:

- **Total Réservations**: Nombre total
- **En Attente**: Statut "pending"
- **Confirmées**: Statut "confirmed"
- **Rejetées**: Statut "rejected"

Les stats se mettent à jour automatiquement toutes les 10 secondes.

---

## Validation des Données

### Champs Obligatoires

```
- firstName (texte)
- lastName (texte)
- email (format valide)
- phone (texte/numéros)
- eventType (d'une liste)
- eventDate (format YYYY-MM-DD, futur)
- eventTime (format HH:MM)
- eventDuration (1-24)
- location (texte)
- guestCount (nombre > 0)
- musicGenre (texte)
- budget (nombre >= 0)
```

### Champs Optionnels

```
- services (array, vide autorisé)
- message (texte, peut être vide)
```

---

## Exemple de Formulaire Rempli

### Événement 1: Mariage

```
Prénom: Jean
Nom: Dupont
Email: jean@exemple.com
Téléphone: +33612345678
Type: Mariage
Date: 2026-06-20
Heure: 20:00
Durée: 4 heures
Lieu: Paris 12e arrondissement
Personnes: 150
Genre(s): Disco, Soul, 80s
Services: ✓ Éclairage ✓ Animation
Budget: €1500
Message: "Nous voulons une ambiance festive!"
```

### Événement 2: Anniversaire

```
Prénom: Marie
Nom: Martin
Email: marie@exemple.com
Téléphone: +33612345123
Type: Anniversaire
Date: 2026-03-15
Heure: 22:00
Durée: 5 heures
Lieu: Lyon 2e
Personnes: 100
Genre(s): Electronic, House, Techno
Services: ✓ Karaoké
Budget: €800
Message: "30e anniversaire surprise!"
```

---

## Voir les Données Brutes

### Ouvrir le fichier JSON

```bash
# Windows PowerShell
cat reservations.json

# Mac/Linux
cat reservations.json

# Formater en JSON lisible
jq '.' reservations.json
```

### Voir un champ spécifique

```bash
# Voir tous les emails
jq '.reservations[].email' reservations.json

# Voir les réservations > 1000€
jq '.reservations[] | select(.budget | tonumber > 1000)' reservations.json
```

---

## Tests API avec Postman/Insomnia

### Import Collection

Créer une collection `DJ Booking` avec:

1. **POST /api/bookings** - Créer
   ```
   POST http://localhost:3000/api/bookings
   Headers: Content-Type: application/json
   Body: {...réservation json...}
   ```

2. **GET /api/reservations** - Voir tout
   ```
   GET http://localhost:3000/api/reservations
   ```

3. **GET /api/bookings/:id** - Voir un
   ```
   GET http://localhost:3000/api/bookings/1708169200000
   ```

4. **PATCH /api/bookings/:id** - Mettre à jour
   ```
   PATCH http://localhost:3000/api/bookings/1708169200000
   Body: {"status": "confirmed"}
   ```

5. **DELETE /api/bookings/:id** - Supprimer
   ```
   DELETE http://localhost:3000/api/bookings/1708169200000
   ```

---

*Exemples complets pour tester et développer le système de réservation.*
