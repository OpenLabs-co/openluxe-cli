/**
 * Declarative map of typed resource commands over the OpenLuxe v1 API.
 *
 * Each command: { method, path, summary, params? }
 *   - `path` may contain :placeholders, filled from positional args (in order)
 *     or a matching --flag.
 *   - For GET: leftover --flags become query string.
 *   - For POST/PATCH: --flags + `-d '<json>'` merge into the JSON body.
 *
 * This is intentionally data-driven so the CLI mirrors the API surface
 * without 100+ hand-written command files.
 */
export const RESOURCES = {
    contacts: {
        summary: 'CRM contacts',
        commands: {
            list: { method: 'GET', path: '/contacts', summary: 'List your contacts' },
            get: { method: 'GET', path: '/contacts/:contact', summary: 'Show one contact' },
            create: { method: 'POST', path: '/contacts', summary: 'Create a contact' },
            update: { method: 'PATCH', path: '/contacts/:contact', summary: 'Update a contact' },
            delete: { method: 'DELETE', path: '/contacts/:contact', summary: 'Delete a contact' },
        },
    },
    notes: {
        summary: 'CRM notes',
        commands: {
            list: { method: 'GET', path: '/notes', summary: 'List notes' },
            get: { method: 'GET', path: '/notes/:note' },
            create: { method: 'POST', path: '/notes', summary: 'Create a note' },
            update: { method: 'PATCH', path: '/notes/:note' },
            delete: { method: 'DELETE', path: '/notes/:note' },
        },
    },
    reminders: {
        summary: 'CRM reminders',
        commands: {
            list: { method: 'GET', path: '/reminders' },
            get: { method: 'GET', path: '/reminders/:reminder' },
            create: { method: 'POST', path: '/reminders' },
            update: { method: 'PATCH', path: '/reminders/:reminder' },
            delete: { method: 'DELETE', path: '/reminders/:reminder' },
        },
    },
    tasks: {
        summary: 'CRM tasks',
        commands: {
            list: { method: 'GET', path: '/tasks' },
            get: { method: 'GET', path: '/tasks/:task' },
            create: { method: 'POST', path: '/tasks' },
            update: { method: 'PATCH', path: '/tasks/:task' },
            delete: { method: 'DELETE', path: '/tasks/:task' },
        },
    },
    deals: {
        summary: 'CRM deals (read-only in v1)',
        commands: {
            list: { method: 'GET', path: '/deals' },
            get: { method: 'GET', path: '/deals/:deal' },
        },
    },
    'contact-lists': {
        summary: 'Contact lists',
        commands: {
            list: { method: 'GET', path: '/contact-lists' },
            get: { method: 'GET', path: '/contact-lists/:list' },
            create: { method: 'POST', path: '/contact-lists' },
            update: { method: 'PATCH', path: '/contact-lists/:list' },
            delete: { method: 'DELETE', path: '/contact-lists/:list' },
        },
    },
    listings: {
        summary: 'Property listings (read-only in v1)',
        commands: {
            list: { method: 'GET', path: '/listings' },
            get: { method: 'GET', path: '/listings/:listing' },
        },
    },
    showings: {
        summary: 'Listing showings',
        commands: {
            list: { method: 'GET', path: '/showings' },
            get: { method: 'GET', path: '/showings/:showing' },
            create: { method: 'POST', path: '/showings' },
            update: { method: 'PATCH', path: '/showings/:showing' },
            delete: { method: 'DELETE', path: '/showings/:showing' },
        },
    },
    'open-houses': {
        summary: 'Open houses',
        commands: {
            list: { method: 'GET', path: '/open-houses' },
            get: { method: 'GET', path: '/open-houses/:openHouse' },
            attendees: { method: 'GET', path: '/open-houses/:openHouse/attendees' },
            create: { method: 'POST', path: '/open-houses' },
            update: { method: 'PATCH', path: '/open-houses/:openHouse' },
            delete: { method: 'DELETE', path: '/open-houses/:openHouse' },
        },
    },
    'store-products': {
        summary: 'Store products (read-only in v1)',
        commands: {
            list: { method: 'GET', path: '/store/products' },
            get: { method: 'GET', path: '/store/products/:product' },
        },
    },
    webinars: {
        summary: 'Webinars',
        commands: {
            list: { method: 'GET', path: '/webinars' },
            get: { method: 'GET', path: '/webinars/:webinar' },
            registrations: { method: 'GET', path: '/webinars/:webinar/registrations' },
        },
    },
    travel: {
        summary: 'Travel bookings (read-only)',
        commands: {
            flights: { method: 'GET', path: '/travel/flights' },
            stays: { method: 'GET', path: '/travel/stays' },
            cars: { method: 'GET', path: '/travel/cars' },
        },
    },
    escrow: {
        summary: 'Escrow transactions (read-only)',
        commands: {
            list: { method: 'GET', path: '/escrow' },
            get: { method: 'GET', path: '/escrow/:escrow' },
        },
    },
    courses: {
        summary: 'Courses',
        commands: {
            list: { method: 'GET', path: '/courses' },
            get: { method: 'GET', path: '/courses/:course' },
            enrollments: { method: 'GET', path: '/course-enrollments' },
        },
    },
    credits: {
        summary: 'Credit balance & ledger',
        commands: {
            balance: { method: 'GET', path: '/credits/balance' },
            ledger: { method: 'GET', path: '/credits/ledger' },
        },
    },
    webhooks: {
        summary: 'Outbound webhook subscriptions',
        commands: {
            list: { method: 'GET', path: '/webhooks' },
            events: { method: 'GET', path: '/webhooks/events', summary: 'List subscribable event types' },
            get: { method: 'GET', path: '/webhooks/:webhook' },
            create: { method: 'POST', path: '/webhooks', summary: 'Create a subscription (secret shown once)' },
            update: { method: 'PATCH', path: '/webhooks/:webhook' },
            delete: { method: 'DELETE', path: '/webhooks/:webhook' },
        },
    },
    render: {
        summary: 'Headless PNG/PDF render of a UI surface',
        commands: {
            create: { method: 'POST', path: '/render', summary: 'Queue a render (surface=, format=)' },
            get: { method: 'GET', path: '/render/:render', summary: 'Poll render status / get URL' },
        },
    },
    skills: {
        summary: 'Skills library (read-only)',
        commands: {
            list: { method: 'GET', path: '/skills' },
            get: { method: 'GET', path: '/skills/:slug' },
        },
    },
    search: {
        summary: 'Universal record search',
        commands: {
            query: { method: 'GET', path: '/search', summary: 'Search (q=...)' },
        },
    },
    me: {
        summary: 'Your token / identity',
        commands: {
            show: { method: 'GET', path: '/me', summary: 'Who am I + token scopes' },
        },
    },
};
