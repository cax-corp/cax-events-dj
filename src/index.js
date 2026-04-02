// Cloudflare Worker DJ Booking API
// Uses Cloudflare KV for data storage

export default {
    async fetch(request, env, ctx) {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const pathname = url.pathname;

        try {
            // API Routes
            if (pathname === '/api/reservations' && request.method === 'GET') {
                return handleGetReservations(env, corsHeaders);
            }

            if (pathname === '/api/bookings' && request.method === 'POST') {
                return handlePostBooking(request, env, corsHeaders);
            }

            if (pathname.startsWith('/api/bookings/') && request.method === 'GET') {
                const id = pathname.split('/')[3];
                return handleGetBooking(id, env, corsHeaders);
            }

            if (pathname.startsWith('/api/bookings/') && request.method === 'PATCH') {
                const id = pathname.split('/')[3];
                return handlePatchBooking(id, request, env, corsHeaders);
            }

            if (pathname.startsWith('/api/bookings/') && request.method === 'DELETE') {
                const id = pathname.split('/')[3];
                return handleDeleteBooking(id, env, corsHeaders);
            }

            // HTML Pages
            if (pathname === '/' || pathname === '') {
                const html = await env.BUCKET.get('landing.html');
                if (html) {
                    const content = await html.text();
                    return new Response(content, { 
                        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
                    });
                }
            }

            if (pathname === '/booking') {
                const html = await env.BUCKET.get('index.html');
                if (html) {
                    const content = await html.text();
                    return new Response(content, { 
                        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
                    });
                }
            }

            if (pathname === '/admin.html') {
                const html = await env.BUCKET.get('admin.html');
                if (html) {
                    const content = await html.text();
                    return new Response(content, { 
                        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
                    });
                }
            }

            if (pathname === '/login.html') {
                const html = await env.BUCKET.get('login.html');
                if (html) {
                    const content = await html.text();
                    return new Response(content, { 
                        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
                    });
                }
            }

            // Static files
            const filename = pathname.startsWith('/') ? pathname.slice(1) : pathname;
            if (filename) {
                const file = await env.BUCKET.get(filename);
                if (file) {
                    const contentType = getContentType(filename);
                    const content = await file.arrayBuffer();
                    return new Response(content, { 
                        headers: { ...corsHeaders, 'Content-Type': contentType } 
                    });
                }
            }

            return new Response('Not found', { status: 404, headers: corsHeaders });

        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ error: 'Server error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

// ======================
// HANDLER FUNCTIONS
// ======================

async function handleGetReservations(env, corsHeaders) {
    const data = await env.RESERVATIONS_KV.get('reservations');
    const reservations = data ? JSON.parse(data) : { reservations: [] };
    
    return new Response(JSON.stringify(reservations), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handlePostBooking(request, env, corsHeaders) {
    try {
        const booking = await request.json();

        // Validate required fields
        if (!booking.firstName || !booking.lastName || !booking.email || 
            !booking.phone || !booking.eventDate || !booking.budget) {
            return new Response(JSON.stringify({ 
                error: 'Des champs obligatoires sont manquants' 
            }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(booking.email)) {
            return new Response(JSON.stringify({ 
                error: 'Format email invalide' 
            }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        // Add booking ID and timestamp
        booking.id = Date.now().toString();
        booking.status = 'pending';
        booking.submittedAt = new Date().toISOString();

        // Read existing reservations
        const data = await env.RESERVATIONS_KV.get('reservations');
        const reservations = data ? JSON.parse(data) : { reservations: [] };

        // Add new booking
        reservations.reservations.push(booking);

        // Save to KV
        await env.RESERVATIONS_KV.put('reservations', JSON.stringify(reservations, null, 2));

        // Log the booking
        console.log(`📋 Nouvelle Réservation: ${booking.firstName} ${booking.lastName}`);
        console.log(`   Email: ${booking.email}`);
        console.log(`   Date: ${booking.eventDate}`);
        console.log(`   Type: ${booking.eventType}`);
        console.log(`   Budget: €${booking.budget}`);

        // Send Discord notification
        await sendDiscordNotification(booking, env);

        return new Response(JSON.stringify({
            success: true,
            message: 'Réservation créée avec succès',
            bookingId: booking.id
        }), { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Post booking error:', error);
        return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function handleGetBooking(id, env, corsHeaders) {
    try {
        const data = await env.RESERVATIONS_KV.get('reservations');
        const reservations = data ? JSON.parse(data) : { reservations: [] };
        
        const booking = reservations.reservations.find(b => b.id === id);
        
        if (!booking) {
            return new Response(JSON.stringify({ error: 'Réservation non trouvée' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(booking), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Get booking error:', error);
        return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function handlePatchBooking(id, request, env, corsHeaders) {
    try {
        const { status } = await request.json();

        if (!['pending', 'confirmed', 'rejected'].includes(status)) {
            return new Response(JSON.stringify({ error: 'Statut invalide' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const data = await env.RESERVATIONS_KV.get('reservations');
        const reservations = data ? JSON.parse(data) : { reservations: [] };

        const booking = reservations.reservations.find(b => b.id === id);
        
        if (!booking) {
            return new Response(JSON.stringify({ error: 'Réservation non trouvée' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        booking.status = status;
        booking.updatedAt = new Date().toISOString();

        await env.RESERVATIONS_KV.put('reservations', JSON.stringify(reservations, null, 2));

        console.log(`✅ Réservation ${id} mise à jour: ${status}`);

        return new Response(JSON.stringify({
            success: true,
            message: 'Réservation mise à jour',
            booking
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Patch booking error:', error);
        return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function handleDeleteBooking(id, env, corsHeaders) {
    try {
        const data = await env.RESERVATIONS_KV.get('reservations');
        const reservations = data ? JSON.parse(data) : { reservations: [] };

        const initialLength = reservations.reservations.length;
        reservations.reservations = reservations.reservations.filter(b => b.id !== id);

        if (reservations.reservations.length === initialLength) {
            return new Response(JSON.stringify({ error: 'Réservation non trouvée' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        await env.RESERVATIONS_KV.put('reservations', JSON.stringify(reservations, null, 2));

        console.log(`🗑️  Réservation ${id} supprimée`);

        return new Response(JSON.stringify({
            success: true,
            message: 'Réservation supprimée'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete booking error:', error);
        return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function sendDiscordNotification(booking, env) {
    if (!env.DISCORD_WEBHOOK) {
        console.log('⚠️  Webhook Discord non configuré');
        return;
    }

    const discordMessage = {
        embeds: [{
            title: '🎵 Nouvelle Réservation DJ',
            color: 0x1a1a1a,
            fields: [
                { name: 'Client', value: `${booking.firstName} ${booking.lastName}`, inline: false },
                { name: 'Email', value: booking.email, inline: true },
                { name: 'Téléphone', value: booking.phone, inline: true },
                { name: 'Type d\'événement', value: booking.eventType || 'Non spécifié', inline: true },
                { name: 'Date', value: booking.eventDate, inline: true },
                { name: 'Budget', value: `€${booking.budget}`, inline: true },
                { name: 'Message', value: booking.message || 'Aucun message', inline: false },
            ],
            footer: { text: new Date().toLocaleString('fr-FR') }
        }]
    };

    try {
        const response = await fetch(env.DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordMessage)
        });

        if (response.status === 204 || response.ok) {
            console.log('✅ Notification Discord envoyée');
        } else {
            console.error(`⚠️  Erreur Discord: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi au Discord:', error.message);
    }
}

function getContentType(filename) {
    if (filename.endsWith('.css')) return 'text/css';
    if (filename.endsWith('.js')) return 'application/javascript';
    if (filename.endsWith('.html')) return 'text/html';
    if (filename.endsWith('.json')) return 'application/json';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.svg')) return 'image/svg+xml';
    return 'text/plain';
}
