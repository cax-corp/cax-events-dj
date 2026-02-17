require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const RESERVATIONS_FILE = path.join(__dirname, 'reservations.json');
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

// Middleware
app.use(cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Initialize reservations file if it doesn't exist
function initReservationsFile() {
    if (!fs.existsSync(RESERVATIONS_FILE)) {
        fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ reservations: [] }, null, 2));
    }
}

// Read reservations from file
function getReservations() {
    try {
        const data = fs.readFileSync(RESERVATIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur de lecture du fichier:', error);
        return { reservations: [] };
    }
}

// Save reservations to file
function saveReservations(data) {
    try {
        fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erreur d\'écriture du fichier:', error);
        return false;
    }
}

// Send notification to Discord webhook
function sendDiscordNotification(booking) {
    if (!DISCORD_WEBHOOK) {
        console.log('⚠️  Webhook Discord non configuré');
        return;
    }

    const discordMessage = {
        embeds: [{
            title: '🎵 Nouvelle Réservation de DJ',
            color: 3447003, // Blue color
            fields: [
                { name: 'Nom', value: `${booking.firstName} ${booking.lastName}`, inline: true },
                { name: 'Email', value: booking.email, inline: true },
                { name: 'Téléphone', value: booking.phone, inline: true },
                { name: 'Type d\'événement', value: booking.eventType || 'Non spécifié', inline: true },
                { name: 'Date de l\'événement', value: booking.eventDate, inline: true },
                { name: 'Heure', value: booking.eventTime || 'Non spécifiée', inline: true },
                { name: 'Durée', value: `${booking.eventDuration}h` || 'Non spécifiée', inline: true },
                { name: 'Nombre de personnes', value: booking.guestCount?.toString() || 'Non spécifié', inline: true },
                { name: 'Lieu', value: booking.location || 'Non spécifié', inline: false },
                { name: 'Genres musicaux', value: booking.musicGenre || 'Non spécifiés', inline: false },
                { name: 'Services', value: booking.services?.join(', ') || 'Aucun', inline: false },
                { name: 'Budget', value: `€${booking.budget}` || 'Illimité', inline: true },
                { name: 'Message', value: booking.message?.substring(0, 1000) || 'Aucun message', inline: false },
                { name: 'ID Réservation', value: booking.id, inline: true },
                { name: 'Statut', value: booking.status, inline: true }
            ],
            footer: { text: new Date().toLocaleString('fr-FR') }
        }]
    };

    const url = new URL(DISCORD_WEBHOOK);
    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(discordMessage))
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode === 204) {
            console.log('✅ Notification Discord envoyée');
        } else {
            console.error(`⚠️  Erreur Discord: ${res.statusCode}`);
        }
    });

    req.on('error', (error) => {
        console.error('❌ Erreur lors de l\'envoi au Discord:', error.message);
    });

    req.write(JSON.stringify(discordMessage));
    req.end();
}

// Routes

// GET all reservations (admin endpoint)
app.get('/api/reservations', (req, res) => {
    const data = getReservations();
    res.json(data);
});

// POST new reservation
app.post('/api/bookings', (req, res) => {
    try {
        const booking = req.body;
        
        // Validate required fields
        if (!booking.firstName || !booking.lastName || !booking.email || 
            !booking.phone || !booking.eventDate || !booking.budget) {
            return res.status(400).json({ 
                error: 'Des champs obligatoires sont manquants' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(booking.email)) {
            return res.status(400).json({ 
                error: 'Format email invalide' 
            });
        }

        // Add booking ID and timestamp
        booking.id = Date.now().toString();
        booking.status = 'pending';
        booking.submittedAt = new Date().toISOString();

        // Read existing reservations
        const data = getReservations();

        // Add new booking
        data.reservations.push(booking);

        // Save to file
        if (saveReservations(data)) {
            // Send confirmation response
            res.status(201).json({
                success: true,
                message: 'Réservation créée avec succès',
                bookingId: booking.id
            });

            // Log the booking
            console.log(`\n📋 Nouvelle Réservation: ${booking.firstName} ${booking.lastName}`);
            console.log(`   Email: ${booking.email}`);
            console.log(`   Date: ${booking.eventDate}`);
            console.log(`   Type: ${booking.eventType}`);
            console.log(`   Budget: €${booking.budget}\n`);

            // Send Discord notification
            sendDiscordNotification(booking);

        } else {
            res.status(500).json({ 
                error: 'Erreur lors de la sauvegarde' 
            });
        }

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur' 
        });
    }
});

// GET single reservation by ID
app.get('/api/bookings/:id', (req, res) => {
    const data = getReservations();
    const booking = data.reservations.find(b => b.id === req.params.id);
    
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).json({ 
            error: 'Réservation non trouvée' 
        });
    }
});

// UPDATE reservation status (admin endpoint)
app.patch('/api/bookings/:id', (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                error: 'Statut invalide' 
            });
        }

        const data = getReservations();
        const bookingIndex = data.reservations.findIndex(b => b.id === req.params.id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({ 
                error: 'Réservation non trouvée' 
            });
        }

        data.reservations[bookingIndex].status = status;
        data.reservations[bookingIndex].updatedAt = new Date().toISOString();

        if (saveReservations(data)) {
            res.json({
                success: true,
                message: 'Réservation mise à jour',
                booking: data.reservations[bookingIndex]
            });
        } else {
            res.status(500).json({ 
                error: 'Erreur lors de la mise à jour' 
            });
        }

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur' 
        });
    }
});

// DELETE reservation
app.delete('/api/bookings/:id', (req, res) => {
    try {
        const data = getReservations();
        const bookingIndex = data.reservations.findIndex(b => b.id === req.params.id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({ 
                error: 'Réservation non trouvée' 
            });
        }

        const removed = data.reservations.splice(bookingIndex, 1);

        if (saveReservations(data)) {
            res.json({
                success: true,
                message: 'Réservation supprimée',
                booking: removed[0]
            });
        } else {
            res.status(500).json({ 
                error: 'Erreur lors de la suppression' 
            });
        }

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur' 
        });
    }
});

// Serve index.html for all other routes (SPA support)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database
initReservationsFile();

// Start server
app.listen(PORT, () => {
    console.log(`\n🎵 DJ Booking Server`);
    console.log(`✅ Serveur en écoute sur le port ${PORT}`);
    console.log(`📝 Réservations sauvegardées dans: ${RESERVATIONS_FILE}`);
    console.log(`🔗 Discord Webhook: ${DISCORD_WEBHOOK ? '✅ Configuré' : '❌ Non configuré'}\n`);
});
