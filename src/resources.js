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
 * without 100+ hand-written command files. Curated resources are kept
 * verbatim; the rest are generated for full parity with the v1 route table
 * (regenerate via the main repo's scripts + `openluxe manifest`).
 */
export const RESOURCES = {
    delegations: {
        summary: 'BYOA agent delegations — fulfill generation requests from the OpenLuxe generator apps with YOUR OWN AI (zero platform credits). See also: openluxe agent listen',
        commands: {
            list: { method: 'GET', path: '/agent/delegations', summary: 'List your delegations (--status pending|claimed|open|completed|failed, --feature key, --wait 25 long-polls)  [scope: agent:delegations:read]' },
            get: { method: 'GET', path: '/agent/delegations/:uuid', summary: 'One delegation incl. spec + result contract  [scope: agent:delegations:read]' },
            create: { method: 'POST', path: '/agent/delegations', summary: "Direct-create from the terminal (-d '{\"feature\":\"email_template\",\"prompt\":\"…\"}') — auto-claims for this token  [scope: agent:delegations:write]" },
            claim: { method: 'POST', path: '/agent/delegations/:uuid/claim', summary: 'Claim (token-keyed 15-min lease; re-claim refreshes)  [scope: agent:delegations:write]' },
            submit: { method: 'POST', path: '/agent/delegations/:uuid/result', summary: "Submit the finished content (-d '<json>' per spec.result_contract; idempotent)  [scope: agent:delegations:write]" },
            fail: { method: 'POST', path: '/agent/delegations/:uuid/fail', summary: 'Report you cannot fulfill it (--reason "…")  [scope: agent:delegations:write]' },
        },
    },
    contacts: {
        summary: 'CRM contacts',
        commands: {
            list: { method: 'GET', path: '/contacts', summary: 'List your contacts' },
            get: { method: 'GET', path: '/contacts/:contact', summary: 'Show one contact' },
            create: { method: 'POST', path: '/contacts', summary: 'Create a contact' },
            update: { method: 'PATCH', path: '/contacts/:contact', summary: 'Update a contact' },
            delete: { method: 'DELETE', path: '/contacts/:contact', summary: 'Delete a contact' },
            problems: { method: 'GET', path: '/contacts/:contact/problems', summary: 'GET /contacts/{contact}/problems  [scope: crm:contacts:read]' },
            'cultural-briefing': { method: 'GET', path: '/contacts/:contact/cultural-briefing', summary: 'GET /contacts/{contact}/cultural-briefing  [scope: crm:cultural:read]' },
            personality: { method: 'GET', path: '/contacts/:contact/personality', summary: 'GET /contacts/{contact}/personality  [scope: crm:contacts:read]' },
            favors: { method: 'GET', path: '/contacts/:contact/favors', summary: 'GET /contacts/{contact}/favors  [scope: crm:contacts:read]' },
            'compliance-limits': { method: 'GET', path: '/contacts/:contact/compliance-limits', summary: 'GET /contacts/{contact}/compliance-limits  [scope: crm:contacts:read]' },
            status: { method: 'GET', path: '/contacts/:contact/compliance-limits/status', summary: 'GET /contacts/{contact}/compliance-limits/status  [scope: crm:contacts:read]' },
            value: { method: 'GET', path: '/contacts/:contact/value', summary: 'GET /contacts/{contact}/value  [scope: crm:contacts:read]' },
            economics: { method: 'GET', path: '/contacts/:contact/economics', summary: 'GET /contacts/{contact}/economics  [scope: crm:contacts:read]' },
            'buyer-profile': { method: 'GET', path: '/contacts/:contact/buyer-profile', summary: 'GET /contacts/{contact}/buyer-profile  [scope: crm:contacts:read]' },
            'user-links': { method: 'GET', path: '/contacts/:contact/user-links', summary: 'GET /contacts/{contact}/user-links  [scope: crm:contacts:read]' },
            'update-personality': { method: 'PUT', path: '/contacts/:contact/personality', summary: 'PUT /contacts/{contact}/personality  [scope: crm:contacts:write]' },
            'create-favors': { method: 'POST', path: '/contacts/:contact/favors', summary: 'POST /contacts/{contact}/favors  [scope: crm:contacts:write]' },
            'update-favors': { method: 'PUT', path: '/contacts/:contact/favors/:favor', summary: 'PUT /contacts/{contact}/favors/{favor}  [scope: crm:contacts:write]' },
            'delete-favors': { method: 'DELETE', path: '/contacts/:contact/favors/:favor', summary: 'DELETE /contacts/{contact}/favors/{favor}  [scope: crm:contacts:write]' },
            reciprocate: { method: 'POST', path: '/contacts/:contact/favors/:favor/reciprocate', summary: 'POST /contacts/{contact}/favors/{favor}/reciprocate  [scope: crm:contacts:write]' },
            'create-compliance-limits': { method: 'POST', path: '/contacts/:contact/compliance-limits', summary: 'POST /contacts/{contact}/compliance-limits  [scope: crm:contacts:write]' },
            'update-compliance-limits': { method: 'PUT', path: '/contacts/:contact/compliance-limits/:limit', summary: 'PUT /contacts/{contact}/compliance-limits/{limit}  [scope: crm:contacts:write]' },
            'delete-compliance-limits': { method: 'DELETE', path: '/contacts/:contact/compliance-limits/:limit', summary: 'DELETE /contacts/{contact}/compliance-limits/{limit}  [scope: crm:contacts:write]' },
            issue: { method: 'POST', path: '/contacts/:contact/compliance-override/issue', summary: 'POST /contacts/{contact}/compliance-override/issue  [scope: crm:contacts:write]' },
            'create-value-manual-entry': { method: 'POST', path: '/contacts/:contact/value/manual-entry', summary: 'POST /contacts/{contact}/value/manual-entry  [scope: crm:contacts:write]' },
            'update-value-expected-ltv': { method: 'PUT', path: '/contacts/:contact/value/expected-ltv', summary: 'PUT /contacts/{contact}/value/expected-ltv  [scope: crm:contacts:write]' },
            'create-user-links': { method: 'POST', path: '/contacts/:contact/user-links', summary: 'POST /contacts/{contact}/user-links  [scope: crm:contacts:write]' },
            discover: { method: 'POST', path: '/contacts/:contact/user-links/discover', summary: 'POST /contacts/{contact}/user-links/discover  [scope: crm:contacts:write]' },
            confirm: { method: 'POST', path: '/contacts/:contact/user-links/:link/confirm', summary: 'POST /contacts/{contact}/user-links/{link}/confirm  [scope: crm:contacts:write]' },
            reject: { method: 'POST', path: '/contacts/:contact/user-links/:link/reject', summary: 'POST /contacts/{contact}/user-links/{link}/reject  [scope: crm:contacts:write]' },
            overview: { method: 'GET', path: '/contacts/:contact/owned-assets/:asset/overview', summary: 'GET /contacts/{contact}/owned-assets/{asset}/overview  [scope: crm:assets:read]' },
            'owned-assets-service-events': { method: 'GET', path: '/contacts/:contact/owned-assets/:asset/service-events', summary: 'GET /contacts/{contact}/owned-assets/{asset}/service-events  [scope: crm:assets:read]' },
            'owned-assets-locations': { method: 'GET', path: '/contacts/:contact/owned-assets/:asset/locations', summary: 'GET /contacts/{contact}/owned-assets/{asset}/locations  [scope: crm:assets:read]' },
            'owned-assets-upgrades': { method: 'GET', path: '/contacts/:contact/owned-assets/:asset/upgrades', summary: 'GET /contacts/{contact}/owned-assets/{asset}/upgrades  [scope: crm:assets:read]' },
            'create-owned-assets-service-events': { method: 'POST', path: '/contacts/:contact/owned-assets/:asset/service-events', summary: 'POST /contacts/{contact}/owned-assets/{asset}/service-events  [scope: crm:assets:write]' },
            'update-owned-assets-service-events': { method: 'PUT', path: '/contacts/:contact/owned-assets/:asset/service-events/:event', summary: 'PUT /contacts/{contact}/owned-assets/{asset}/service-events/{event}  [scope: crm:assets:write]' },
            'delete-owned-assets-service-events': { method: 'DELETE', path: '/contacts/:contact/owned-assets/:asset/service-events/:event', summary: 'DELETE /contacts/{contact}/owned-assets/{asset}/service-events/{event}  [scope: crm:assets:write]' },
            'create-owned-assets-locations': { method: 'POST', path: '/contacts/:contact/owned-assets/:asset/locations', summary: 'POST /contacts/{contact}/owned-assets/{asset}/locations  [scope: crm:assets:write]' },
            'create-owned-assets-upgrades': { method: 'POST', path: '/contacts/:contact/owned-assets/:asset/upgrades', summary: 'POST /contacts/{contact}/owned-assets/{asset}/upgrades  [scope: crm:assets:write]' },
            'commission-partnerships': { method: 'GET', path: '/contacts/:contact/commission-partnerships', summary: 'GET /contacts/{contact}/commission-partnerships  [scope: crm:commission:read]' },
            earnings: { method: 'GET', path: '/contacts/:contact/commission-partnerships/:partnership/earnings', summary: 'GET /contacts/{contact}/commission-partnerships/{partnership}/earnings  [scope: crm:commission:read]' },
            'create-commission-partnerships': { method: 'POST', path: '/contacts/:contact/commission-partnerships', summary: 'POST /contacts/{contact}/commission-partnerships  [scope: crm:commission:write]' },
            'create-earnings': { method: 'POST', path: '/contacts/:contact/commission-partnerships/:partnership/earnings', summary: 'POST /contacts/{contact}/commission-partnerships/{partnership}/earnings  [scope: crm:commission:write]' },
            'update-commission-partnerships': { method: 'PUT', path: '/contacts/:contact/commission-partnerships/:partnership', summary: 'PUT /contacts/{contact}/commission-partnerships/{partnership}  [scope: crm:commission:write]' },
            'delete-commission-partnerships': { method: 'DELETE', path: '/contacts/:contact/commission-partnerships/:partnership', summary: 'DELETE /contacts/{contact}/commission-partnerships/{partnership}  [scope: crm:commission:write]' },
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
            'create-contacts': { method: 'POST', path: '/contact-lists/:list/contacts', summary: 'POST /contact-lists/{list}/contacts  [scope: crm:lists:write]' },
            'delete-contacts': { method: 'DELETE', path: '/contact-lists/:list/contacts', summary: 'DELETE /contact-lists/{list}/contacts  [scope: crm:lists:write]' },
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
    smartboards: {
        summary: 'Smartboards / collaborative diagrams (read-only in v1)',
        commands: {
            list: { method: 'GET', path: '/smartboards' },
            get: { method: 'GET', path: '/smartboards/:uuid', summary: 'One board with its elements' },
        },
    },
    credits: {
        summary: 'Credit balance & ledger',
        commands: {
            balance: { method: 'GET', path: '/credits/balance' },
            ledger: { method: 'GET', path: '/credits/ledger' },
            pricing: { method: 'GET', path: '/credits/pricing', summary: 'GET /credits/pricing  [scope: credits:balance:read]' },
            usage: { method: 'GET', path: '/credits/usage', summary: 'GET /credits/usage  [scope: credits:balance:read]' },
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
    generate: {
        summary: 'AI generation (async): start a job, then poll with `generations get <id>`',
        commands: {
            start: { method: 'POST', path: '/generate/:feature', summary: 'Start a generation. feature ∈ image, video, sound_effect, email_template, sales_presentation, blog_article, podcast, sticker, brand_colors, dossier, agent_odysseus, agent_apollo, agent_atticus, agent_eva, agent_alfred. Inputs via -d \'<json>\'. Returns a 202 handle.' },
        },
    },
    generations: {
        summary: 'Poll an async AI generation handle',
        commands: {
            get: { method: 'GET', path: '/generations/:id', summary: 'Poll a generation by id — status (queued|processing|succeeded|failed) + result' },
        },
    },
    cli: {
        summary: 'cli (v1)',
        commands: {
            'create-auth-start': { method: 'POST', path: '/cli/auth/start', summary: 'POST /cli/auth/start' },
            'create-auth-poll': { method: 'POST', path: '/cli/auth/poll', summary: 'POST /cli/auth/poll' },
        },
    },
    industries: {
        summary: 'industries (v1)',
        commands: {
            list: { method: 'GET', path: '/industries', summary: 'GET /industries' },
            schema: { method: 'GET', path: '/industries/:industry/schema', summary: 'GET /industries/{industry}/schema' },
        },
    },
    'live-shop': {
        summary: 'live shop (v1)',
        commands: {
            list: { method: 'GET', path: '/live-shop', summary: 'GET /live-shop  [scope: livestreams:read]' },
        },
    },
    reachverce: {
        summary: 'Reachverce marketing campaigns (v1, read-only)',
        commands: {
            list: { method: 'GET', path: '/reachverce/campaigns', summary: 'GET /reachverce/campaigns  [scope: reachverce:campaigns:read]' },
            get: { method: 'GET', path: '/reachverce/campaigns/:uuid', summary: 'GET /reachverce/campaigns/{uuid}  [scope: reachverce:campaigns:read]' },
            recipients: { method: 'GET', path: '/reachverce/campaigns/:uuid/recipients', summary: 'GET /reachverce/campaigns/{uuid}/recipients  [scope: reachverce:campaigns:read]' },
            events: { method: 'GET', path: '/reachverce/campaigns/:uuid/events', summary: 'GET /reachverce/campaigns/{uuid}/events  [scope: reachverce:campaigns:read]' },
        },
    },
    kanbans: {
        summary: 'kanbans (v1)',
        commands: {
            get: { method: 'GET', path: '/kanbans/:kanban', summary: 'GET /kanbans/{kanban}  [scope: crm:kanban:read]' },
            list: { method: 'GET', path: '/kanbans', summary: 'GET /kanbans  [scope: crm:kanban:read]' },
            lists: { method: 'GET', path: '/kanbans/:kanban/lists', summary: 'GET /kanbans/{kanban}/lists  [scope: crm:kanban:read]' },
        },
    },
    'business-org-chart': {
        summary: 'business org chart (v1)',
        commands: {
            list: { method: 'GET', path: '/business/org-chart', summary: 'GET /business/org-chart  [scope: business:org:read]' },
        },
    },
    'business-departments': {
        summary: 'business departments (v1)',
        commands: {
            list: { method: 'GET', path: '/business/departments', summary: 'GET /business/departments  [scope: business:org:read]' },
        },
    },
    'crm-cultural-library': {
        summary: 'crm cultural library (v1)',
        commands: {
            list: { method: 'GET', path: '/crm/cultural-library', summary: 'GET /crm/cultural-library  [scope: crm:cultural:read]' },
            get: { method: 'GET', path: '/crm/cultural-library/:profile', summary: 'GET /crm/cultural-library/{profile}  [scope: crm:cultural:read]' },
        },
    },
    'crm-portfolio': {
        summary: 'crm portfolio (v1)',
        commands: {
            get: { method: 'GET', path: '/crm/portfolio/:section', summary: 'GET /crm/portfolio/{section}  [scope: crm:portfolio:read]' },
        },
    },
    'client-deals': {
        summary: 'client deals (v1)',
        commands: {
            list: { method: 'GET', path: '/client-deals', summary: 'GET /client-deals  [scope: crm:client_deals:read]' },
            get: { method: 'GET', path: '/client-deals/:uuid', summary: 'GET /client-deals/{uuid}  [scope: crm:client_deals:read]' },
        },
    },
    invoices: {
        summary: 'invoices (v1)',
        commands: {
            list: { method: 'GET', path: '/invoices', summary: 'GET /invoices  [scope: crm:invoices:read]' },
            get: { method: 'GET', path: '/invoices/:invoice', summary: 'GET /invoices/{invoice}  [scope: crm:invoices:read]' },
        },
    },
    reviews: {
        summary: 'reviews (v1)',
        commands: {
            list: { method: 'GET', path: '/reviews', summary: 'GET /reviews  [scope: crm:reviews:read]' },
            get: { method: 'GET', path: '/reviews/:review', summary: 'GET /reviews/{review}  [scope: crm:reviews:read]' },
        },
    },
    'message-campaigns': {
        summary: 'message campaigns (v1)',
        commands: {
            list: { method: 'GET', path: '/message-campaigns', summary: 'GET /message-campaigns  [scope: crm:campaigns:read]' },
            get: { method: 'GET', path: '/message-campaigns/:uuid', summary: 'GET /message-campaigns/{uuid}  [scope: crm:campaigns:read]' },
            create: { method: 'POST', path: '/message-campaigns', summary: 'POST /message-campaigns  [scope: crm:campaigns:write]' },
            enroll: { method: 'POST', path: '/message-campaigns/:uuid/enroll', summary: 'POST /message-campaigns/{uuid}/enroll  [scope: crm:campaigns:write]' },
        },
    },
    'phone-numbers': {
        summary: 'phone numbers (v1)',
        commands: {
            list: { method: 'GET', path: '/phone-numbers', summary: 'GET /phone-numbers  [scope: comms:numbers:read]' },
            get: { method: 'GET', path: '/phone-numbers/:uuid', summary: 'GET /phone-numbers/{uuid}  [scope: comms:numbers:read]' },
            'list-2': { method: 'GET', path: '/phone-numbers/:uuid', summary: 'GET /phone-numbers/{uuid}  [scope: comms:numbers:read]', hidden: true },
            create: { method: 'POST', path: '/phone-numbers', summary: 'POST /phone-numbers  [scope: comms:numbers:write]' },
        },
    },
    'command-centers': {
        summary: 'command centers (v1)',
        commands: {
            overview: { method: 'GET', path: '/command-centers/:slug/overview', summary: 'GET /command-centers/{slug}/overview  [scope: business:command-center:read]' },
            missions: { method: 'GET', path: '/command-centers/:slug/missions', summary: 'GET /command-centers/{slug}/missions  [scope: business:command-center:read]' },
            mission: { method: 'GET', path: '/command-centers/:slug/missions/:mission', summary: 'GET /command-centers/{slug}/missions/{mission}  [scope: business:command-center:read]' },
            'missions-2': { method: 'GET', path: '/command-centers/:slug/missions/:mission', summary: 'GET /command-centers/{slug}/missions/{mission}  [scope: business:command-center:read]', hidden: true },
            'work-feed': { method: 'GET', path: '/command-centers/:slug/work-feed', summary: 'GET /command-centers/{slug}/work-feed  [scope: business:command-center:read]' },
            'performance-competencies': { method: 'GET', path: '/command-centers/:slug/performance/competencies', summary: 'GET /command-centers/{slug}/performance/competencies  [scope: business:performance:read]' },
            'performance-templates': { method: 'GET', path: '/command-centers/:slug/performance/templates', summary: 'GET /command-centers/{slug}/performance/templates  [scope: business:performance:read]' },
            reviews: { method: 'GET', path: '/command-centers/:slug/performance/reviews', summary: 'GET /command-centers/{slug}/performance/reviews  [scope: business:performance:read]' },
            review: { method: 'GET', path: '/command-centers/:slug/performance/reviews/:review', summary: 'GET /command-centers/{slug}/performance/reviews/{review}  [scope: business:performance:read]' },
            'reviews-2': { method: 'GET', path: '/command-centers/:slug/performance/reviews/:review', summary: 'GET /command-centers/{slug}/performance/reviews/{review}  [scope: business:performance:read]', hidden: true },
            'performance-subjects-rollup': { method: 'GET', path: '/command-centers/:slug/performance/subjects/:subject/rollup', summary: 'GET /command-centers/{slug}/performance/subjects/{subject}/rollup  [scope: business:performance:read]' },
            'performance-plans': { method: 'GET', path: '/command-centers/:slug/performance/plans', summary: 'GET /command-centers/{slug}/performance/plans  [scope: business:performance:read]' },
        },
    },
    'email-messages': {
        summary: 'email messages (v1)',
        commands: {
            list: { method: 'GET', path: '/email-messages', summary: 'GET /email-messages  [scope: comms:email:read]' },
            get: { method: 'GET', path: '/email-messages/:emailMessage', summary: 'GET /email-messages/{emailMessage}  [scope: comms:email:read]' },
            send: { method: 'POST', path: '/email-messages/send', summary: 'POST /email-messages/send  [scope: comms:email:send]' },
        },
    },
    'email-deliverability-contact-lists': {
        summary: 'email deliverability contact lists (v1)',
        commands: {
            status: { method: 'GET', path: '/email-deliverability/contact-lists/:contactList/status', summary: 'GET /email-deliverability/contact-lists/{contactList}/status  [scope: comms:email:deliverability:read]' },
            validate: { method: 'POST', path: '/email-deliverability/contact-lists/:contactList/validate', summary: 'POST /email-deliverability/contact-lists/{contactList}/validate  [scope: comms:email:deliverability:write]' },
        },
    },
    'email-suppression': {
        summary: 'email suppression (v1)',
        commands: {
            list: { method: 'GET', path: '/email-suppression', summary: 'GET /email-suppression  [scope: comms:email:suppression:read]' },
        },
    },
    'sms-messages': {
        summary: 'sms messages (v1)',
        commands: {
            list: { method: 'GET', path: '/sms-messages', summary: 'GET /sms-messages  [scope: comms:sms:read]' },
            get: { method: 'GET', path: '/sms-messages/:smsMessage', summary: 'GET /sms-messages/{smsMessage}  [scope: comms:sms:read]' },
            send: { method: 'POST', path: '/sms-messages/send', summary: 'POST /sms-messages/send  [scope: comms:sms:write]' },
        },
    },
    calls: {
        summary: 'calls (v1)',
        commands: {
            list: { method: 'GET', path: '/calls', summary: 'GET /calls  [scope: comms:phone:read]' },
            get: { method: 'GET', path: '/calls/:call', summary: 'GET /calls/{call}  [scope: comms:phone:read]' },
        },
    },
    'kanban-cards': {
        summary: 'kanban cards (v1)',
        commands: {
            list: { method: 'GET', path: '/kanban-cards', summary: 'GET /kanban-cards  [scope: crm:kanban:read]' },
        },
    },
    'email-templates': {
        summary: 'email templates (v1)',
        commands: {
            list: { method: 'GET', path: '/email-templates', summary: 'GET /email-templates  [scope: comms:email-templates:read]' },
            get: { method: 'GET', path: '/email-templates/:slug', summary: 'GET /email-templates/{slug}  [scope: comms:email-templates:read]' },
        },
    },
    'mini-games': {
        summary: 'mini games (v1)',
        commands: {
            list: { method: 'GET', path: '/mini-games', summary: 'GET /mini-games — catalog of playable games  [scope: games:mini-games:read]' },
            plays: { method: 'GET', path: '/mini-games/plays', summary: 'GET /mini-games/plays  [scope: games:mini-games:read]' },
        },
    },
    arena: {
        summary: 'arena (v1)',
        commands: {
            matches: { method: 'GET', path: '/arena/matches', summary: 'GET /arena/matches  [scope: games:arena:read]' },
        },
    },
    nft: {
        summary: 'nft (v1)',
        commands: {
            collections: { method: 'GET', path: '/nft/collections', summary: 'GET /nft/collections  [scope: nft:collections:read]' },
            assets: { method: 'GET', path: '/nft/assets', summary: 'GET /nft/assets  [scope: nft:assets:read]' },
            collection: { method: 'GET', path: '/nft/collections/:collection', summary: 'GET /nft/collections/{collection}  [scope: nft:collections:read]' },
            'collections-2': { method: 'GET', path: '/nft/collections/:collection', summary: 'GET /nft/collections/{collection}  [scope: nft:collections:read]', hidden: true },
            asset: { method: 'GET', path: '/nft/assets/:asset', summary: 'GET /nft/assets/{asset}  [scope: nft:assets:read]' },
            'assets-2': { method: 'GET', path: '/nft/assets/:asset', summary: 'GET /nft/assets/{asset}  [scope: nft:assets:read]', hidden: true },
        },
    },
    openflix: {
        summary: 'openflix (v1)',
        commands: {
            movies: { method: 'GET', path: '/openflix/movies', summary: 'GET /openflix/movies  [scope: media:openflix:read]' },
            series: { method: 'GET', path: '/openflix/series', summary: 'GET /openflix/series  [scope: media:openflix:read]' },
            movie: { method: 'GET', path: '/openflix/movies/:movie', summary: 'GET /openflix/movies/{movie}  [scope: media:openflix:read]' },
            'movies-2': { method: 'GET', path: '/openflix/movies/:movie', summary: 'GET /openflix/movies/{movie}  [scope: media:openflix:read]', hidden: true },
            'series-show': { method: 'GET', path: '/openflix/series/:series', summary: 'GET /openflix/series/{series}  [scope: media:openflix:read]' },
            'series-2': { method: 'GET', path: '/openflix/series/:series', summary: 'GET /openflix/series/{series}  [scope: media:openflix:read]', hidden: true },
        },
    },
    livestreams: {
        summary: 'livestreams (v1)',
        commands: {
            list: { method: 'GET', path: '/livestreams', summary: 'GET /livestreams  [scope: media:livestreams:read]' },
            get: { method: 'GET', path: '/livestreams/:room', summary: 'GET /livestreams/{room}  [scope: media:livestreams:read]' },
        },
    },
    profile: {
        summary: 'profile (v1)',
        commands: {
            list: { method: 'GET', path: '/profile', summary: 'GET /profile  [scope: profile:read]' },
        },
    },
    affiliate: {
        summary: 'affiliate (v1)',
        commands: {
            program: { method: 'GET', path: '/affiliate/program', summary: 'GET /affiliate/program  [scope: affiliate:program:read]' },
            commissions: { method: 'GET', path: '/affiliate/commissions', summary: 'GET /affiliate/commissions  [scope: affiliate:program:read]' },
            payouts: { method: 'GET', path: '/affiliate/payouts', summary: 'GET /affiliate/payouts  [scope: affiliate:payouts:read]' },
        },
    },
    print: {
        summary: 'print (v1)',
        commands: {
            'minimum-quantities': { method: 'GET', path: '/print/minimum-quantities', summary: 'GET /print/minimum-quantities  [scope: print:fulfillment:read]' },
            get: { method: 'GET', path: '/print/minimum-quantities/:productTypeId', summary: 'GET /print/minimum-quantities/{productTypeId}  [scope: print:fulfillment:read]' },
            'minimum-quantities-2': { method: 'GET', path: '/print/minimum-quantities/:productTypeId', summary: 'GET /print/minimum-quantities/{productTypeId}  [scope: print:fulfillment:read]', hidden: true },
        },
    },
    fulfillment: {
        summary: 'fulfillment (v1)',
        commands: {
            queue: { method: 'GET', path: '/fulfillment/queue', summary: 'GET /fulfillment/queue  [scope: fulfillment:read]' },
            analytics: { method: 'GET', path: '/fulfillment/analytics', summary: 'GET /fulfillment/analytics  [scope: fulfillment:read]' },
        },
    },
    'branding-projects': {
        summary: 'branding projects (v1)',
        commands: {
            list: { method: 'GET', path: '/branding-projects', summary: 'GET /branding-projects  [scope: brand:projects:read]' },
            get: { method: 'GET', path: '/branding-projects/:project', summary: 'GET /branding-projects/{project}  [scope: brand:projects:read]' },
        },
    },
    brands: {
        summary: 'brands (v1)',
        commands: {
            list: { method: 'GET', path: '/brands', summary: 'GET /brands  [scope: brand:assets:read]' },
            get: { method: 'GET', path: '/brands/:brand', summary: 'GET /brands/{brand}  [scope: brand:assets:read]' },
        },
    },
    associations: {
        summary: 'associations (v1)',
        commands: {
            list: { method: 'GET', path: '/associations', summary: 'GET /associations  [scope: community:associations:read]' },
            get: { method: 'GET', path: '/associations/:association', summary: 'GET /associations/{association}  [scope: community:associations:read]' },
            posts: { method: 'GET', path: '/associations/:association/posts', summary: 'GET /associations/{association}/posts  [scope: community:associations:read]' },
        },
    },
    policies: {
        summary: 'policies (v1)',
        commands: {
            list: { method: 'GET', path: '/policies', summary: 'GET /policies  [scope: business:policies:read]' },
            get: { method: 'GET', path: '/policies/:id', summary: 'GET /policies/{id}  [scope: business:policies:read]' },
        },
    },
    meetups: {
        summary: 'meetups (v1)',
        commands: {
            list: { method: 'GET', path: '/meetups', summary: 'GET /meetups  [scope: community:meetups:read]' },
            get: { method: 'GET', path: '/meetups/:meetup', summary: 'GET /meetups/{meetup}  [scope: community:meetups:read]' },
        },
    },
    clones: {
        summary: 'clones (v1)',
        commands: {
            list: { method: 'GET', path: '/clones', summary: 'GET /clones  [scope: profile:clones:read]' },
            get: { method: 'GET', path: '/clones/:clone', summary: 'GET /clones/{clone}  [scope: profile:clones:read]' },
            create: { method: 'POST', path: '/clones', summary: 'POST /clones  [scope: profile:clones:write]' },
            samples: { method: 'POST', path: '/clones/:clone/samples', summary: 'POST /clones/{clone}/samples  [scope: profile:clones:write]' },
            iterate: { method: 'POST', path: '/clones/:clone/iterate', summary: 'POST /clones/{clone}/iterate  [scope: profile:clones:write]' },
            tts: { method: 'POST', path: '/clones/:clone/tts', summary: 'POST /clones/{clone}/tts  [scope: profile:clones:tts]' },
        },
    },
    'vms-communities': {
        summary: 'vms communities (v1)',
        commands: {
            passes: { method: 'GET', path: '/vms/communities/:communitySlug/passes', summary: 'GET /vms/communities/{communitySlug}/passes  [scope: vms:passes:read]' },
            pass: { method: 'GET', path: '/vms/communities/:communitySlug/passes/:pass', summary: 'GET /vms/communities/{communitySlug}/passes/{pass}  [scope: vms:passes:read]' },
            'passes-2': { method: 'GET', path: '/vms/communities/:communitySlug/passes/:pass', summary: 'GET /vms/communities/{communitySlug}/passes/{pass}  [scope: vms:passes:read]', hidden: true },
            'create-passes': { method: 'POST', path: '/vms/communities/:communitySlug/passes', summary: 'POST /vms/communities/{communitySlug}/passes  [scope: vms:passes:write]' },
            'delete-passes': { method: 'DELETE', path: '/vms/communities/:communitySlug/passes/:pass', summary: 'DELETE /vms/communities/{communitySlug}/passes/{pass}  [scope: vms:passes:write]' },
            'gate-events': { method: 'GET', path: '/vms/communities/:communitySlug/gate-events', summary: 'GET /vms/communities/{communitySlug}/gate-events  [scope: vms:events:read]' },
            'create-gate-events': { method: 'POST', path: '/vms/communities/:communitySlug/gate-events', summary: 'POST /vms/communities/{communitySlug}/gate-events  [scope: vms:events:write]' },
            residents: { method: 'GET', path: '/vms/communities/:communitySlug/residents', summary: 'GET /vms/communities/{communitySlug}/residents  [scope: vms:residents:read]' },
            'create-broadcasts': { method: 'POST', path: '/vms/communities/:communitySlug/broadcasts', summary: 'POST /vms/communities/{communitySlug}/broadcasts  [scope: vms:broadcasts:write]' },
            gates: { method: 'GET', path: '/vms/communities/:communitySlug/gates', summary: 'GET /vms/communities/{communitySlug}/gates  [scope: vms:gates:read]' },
            gate: { method: 'GET', path: '/vms/communities/:communitySlug/gates/:gate', summary: 'GET /vms/communities/{communitySlug}/gates/{gate}  [scope: vms:gates:read]' },
            'gates-2': { method: 'GET', path: '/vms/communities/:communitySlug/gates/:gate', summary: 'GET /vms/communities/{communitySlug}/gates/{gate}  [scope: vms:gates:read]', hidden: true },
            relays: { method: 'GET', path: '/vms/communities/:communitySlug/relays', summary: 'GET /vms/communities/{communitySlug}/relays  [scope: vms:relays:read]' },
            relay: { method: 'GET', path: '/vms/communities/:communitySlug/relays/:relay', summary: 'GET /vms/communities/{communitySlug}/relays/{relay}  [scope: vms:relays:read]' },
            'relays-2': { method: 'GET', path: '/vms/communities/:communitySlug/relays/:relay', summary: 'GET /vms/communities/{communitySlug}/relays/{relay}  [scope: vms:relays:read]', hidden: true },
            fire: { method: 'POST', path: '/vms/communities/:communitySlug/relays/:relay/fire', summary: 'POST /vms/communities/{communitySlug}/relays/{relay}/fire  [scope: vms:relays:fire]' },
            'parking-permits': { method: 'GET', path: '/vms/communities/:communitySlug/parking/permits', summary: 'GET /vms/communities/{communitySlug}/parking/permits  [scope: vms:permits:read]' },
            'parking-allocations': { method: 'GET', path: '/vms/communities/:communitySlug/parking/allocations', summary: 'GET /vms/communities/{communitySlug}/parking/allocations  [scope: vms:permits:read]' },
            'create-trafficlogix-event': { method: 'POST', path: '/vms/communities/:communitySlug/trafficlogix/event', summary: 'POST /vms/communities/{communitySlug}/trafficlogix/event  [scope: vms:events:write]' },
            'create-telephone-entry-lookup': { method: 'POST', path: '/vms/communities/:communitySlug/telephone-entry/lookup', summary: 'POST /vms/communities/{communitySlug}/telephone-entry/lookup  [scope: vms:events:write]' },
            'create-telephone-entry-pin': { method: 'POST', path: '/vms/communities/:communitySlug/telephone-entry/pin', summary: 'POST /vms/communities/{communitySlug}/telephone-entry/pin  [scope: vms:events:write]' },
            'create-camera-ai-event': { method: 'POST', path: '/vms/communities/:communitySlug/camera-ai/:vendor/event', summary: 'POST /vms/communities/{communitySlug}/camera-ai/{vendor}/event  [scope: vms:events:write]' },
            'predictive-pulse': { method: 'POST', path: '/vms/communities/:communitySlug/gates/:gate/predictive-pulse', summary: 'POST /vms/communities/{communitySlug}/gates/{gate}/predictive-pulse  [scope: vms:gates:predictive_pulse]' },
            'create-backup-heartbeat': { method: 'POST', path: '/vms/communities/:communitySlug/backup/heartbeat', summary: 'POST /vms/communities/{communitySlug}/backup/heartbeat  [scope: vms:failsafe:sync]' },
            'create-backup-mode': { method: 'POST', path: '/vms/communities/:communitySlug/backup/mode', summary: 'POST /vms/communities/{communitySlug}/backup/mode  [scope: vms:failsafe:sync]' },
            'backup-snapshot': { method: 'GET', path: '/vms/communities/:communitySlug/backup/snapshot', summary: 'GET /vms/communities/{communitySlug}/backup/snapshot  [scope: vms:failsafe:sync]' },
            'create-backup-relay-fire': { method: 'POST', path: '/vms/communities/:communitySlug/backup/relay-fire', summary: 'POST /vms/communities/{communitySlug}/backup/relay-fire  [scope: vms:failsafe:sync]' },
            'create-backup-visitor-verification': { method: 'POST', path: '/vms/communities/:communitySlug/backup/visitor-verification', summary: 'POST /vms/communities/{communitySlug}/backup/visitor-verification  [scope: vms:failsafe:sync]' },
            resident: { method: 'GET', path: '/vms/communities/:communitySlug/residents/:resident', summary: 'GET /vms/communities/{communitySlug}/residents/{resident}  [scope: vms:residents:read]' },
            'residents-2': { method: 'GET', path: '/vms/communities/:communitySlug/residents/:resident', summary: 'GET /vms/communities/{communitySlug}/residents/{resident}  [scope: vms:residents:read]', hidden: true },
        },
    },
    goals: {
        summary: 'goals (v1)',
        commands: {
            list: { method: 'GET', path: '/goals', summary: 'GET /goals  [scope: goals:read]' },
            get: { method: 'GET', path: '/goals/:goal', summary: 'GET /goals/{goal}  [scope: goals:read]' },
        },
    },
    epics: {
        summary: 'epics (v1)',
        commands: {
            list: { method: 'GET', path: '/epics', summary: 'GET /epics  [scope: goals:read]' },
            get: { method: 'GET', path: '/epics/:epic', summary: 'GET /epics/{epic}  [scope: goals:read]' },
        },
    },
    'professional-profile': {
        summary: 'professional profile (v1)',
        commands: {
            list: { method: 'GET', path: '/professional-profile', summary: 'GET /professional-profile  [scope: professional_profile:read]' },
            portfolio: { method: 'GET', path: '/professional-profile/portfolio', summary: 'GET /professional-profile/portfolio  [scope: professional_profile:read]' },
        },
    },
    'professional-profiles': {
        summary: 'professional profiles (v1)',
        commands: {
            get: { method: 'GET', path: '/professional-profiles/:handle', summary: 'GET /professional-profiles/{handle}  [scope: professional_profile:read]' },
        },
    },
    accounting: {
        summary: 'accounting (v1)',
        commands: {
            'chart-of-accounts': { method: 'GET', path: '/accounting/chart-of-accounts', summary: 'GET /accounting/chart-of-accounts  [scope: accounting:read]' },
            'journal-entries': { method: 'GET', path: '/accounting/journal-entries', summary: 'GET /accounting/journal-entries  [scope: accounting:read]' },
            'trial-balance': { method: 'GET', path: '/accounting/trial-balance', summary: 'GET /accounting/trial-balance  [scope: accounting:read]' },
            'statements-income': { method: 'GET', path: '/accounting/statements/income', summary: 'GET /accounting/statements/income  [scope: accounting:read]' },
            'statements-balance-sheet': { method: 'GET', path: '/accounting/statements/balance-sheet', summary: 'GET /accounting/statements/balance-sheet  [scope: accounting:read]' },
            'consolidated-trial-balance': { method: 'GET', path: '/accounting/consolidated/trial-balance', summary: 'GET /accounting/consolidated/trial-balance  [scope: accounting:read]' },
            'consolidated-income': { method: 'GET', path: '/accounting/consolidated/income', summary: 'GET /accounting/consolidated/income  [scope: accounting:read]' },
            'consolidated-balance-sheet': { method: 'GET', path: '/accounting/consolidated/balance-sheet', summary: 'GET /accounting/consolidated/balance-sheet  [scope: accounting:read]' },
            'tax-liability': { method: 'GET', path: '/accounting/tax-liability', summary: 'GET /accounting/tax-liability  [scope: accounting:read]' },
            'segregation-of-duties': { method: 'GET', path: '/accounting/segregation-of-duties', summary: 'GET /accounting/segregation-of-duties  [scope: accounting:read]' },
            'audit-trail': { method: 'GET', path: '/accounting/audit-trail', summary: 'GET /accounting/audit-trail  [scope: accounting:read]' },
            'e-invoices': { method: 'GET', path: '/accounting/e-invoices', summary: 'GET /accounting/e-invoices  [scope: accounting:read]' },
            'bank-reconciliations': { method: 'GET', path: '/accounting/bank-reconciliations', summary: 'GET /accounting/bank-reconciliations  [scope: accounting:read]' },
        },
    },
    receivables: {
        summary: 'receivables (v1)',
        commands: {
            dunning: { method: 'GET', path: '/receivables/dunning', summary: 'GET /receivables/dunning  [scope: receivables:read]' },
            subscriptions: { method: 'GET', path: '/receivables/subscriptions', summary: 'GET /receivables/subscriptions  [scope: receivables:read]' },
        },
    },
    payables: {
        summary: 'payables (v1)',
        commands: {
            'discount-opportunities': { method: 'GET', path: '/payables/discount-opportunities', summary: 'GET /payables/discount-opportunities  [scope: payables:read]' },
        },
    },
    procurement: {
        summary: 'procurement (v1)',
        commands: {
            suppliers: { method: 'GET', path: '/procurement/suppliers', summary: 'GET /procurement/suppliers  [scope: procurement:read]' },
            'purchase-orders': { method: 'GET', path: '/procurement/purchase-orders', summary: 'GET /procurement/purchase-orders  [scope: procurement:read]' },
            requisitions: { method: 'GET', path: '/procurement/requisitions', summary: 'GET /procurement/requisitions  [scope: procurement:read]' },
        },
    },
    inventory: {
        summary: 'inventory (v1)',
        commands: {
            'stock-levels': { method: 'GET', path: '/inventory/stock-levels', summary: 'GET /inventory/stock-levels  [scope: inventory:read]' },
            valuation: { method: 'GET', path: '/inventory/valuation', summary: 'GET /inventory/valuation  [scope: inventory:read]' },
            warehouses: { method: 'GET', path: '/inventory/warehouses', summary: 'GET /inventory/warehouses  [scope: inventory:read]' },
        },
    },
    hr: {
        summary: 'hr (v1)',
        commands: {
            employees: { method: 'GET', path: '/hr/employees', summary: 'GET /hr/employees  [scope: hr:read]' },
            headcount: { method: 'GET', path: '/hr/headcount', summary: 'GET /hr/headcount  [scope: hr:read]' },
        },
    },
    'fixed-assets': {
        summary: 'fixed assets (v1)',
        commands: {
            list: { method: 'GET', path: '/fixed-assets', summary: 'GET /fixed-assets  [scope: fixed_assets:read]' },
            overview: { method: 'GET', path: '/fixed-assets/overview', summary: 'GET /fixed-assets/overview  [scope: fixed_assets:read]' },
        },
    },
    manufacturing: {
        summary: 'manufacturing (v1)',
        commands: {
            'work-orders': { method: 'GET', path: '/manufacturing/work-orders', summary: 'GET /manufacturing/work-orders  [scope: manufacturing:read]' },
            'bills-of-materials': { method: 'GET', path: '/manufacturing/bills-of-materials', summary: 'GET /manufacturing/bills-of-materials  [scope: manufacturing:read]' },
        },
    },
    'tech-tree': {
        summary: 'tech tree (v1)',
        commands: {
            nodes: { method: 'GET', path: '/tech-tree/nodes', summary: 'GET /tech-tree/nodes  [scope: tech_tree:read]' },
            graph: { method: 'GET', path: '/tech-tree/graph', summary: 'GET /tech-tree/graph  [scope: tech_tree:read]' },
        },
    },
    influence: {
        summary: 'influence (v1)',
        commands: {
            layers: { method: 'GET', path: '/influence/layers', summary: 'GET /influence/layers  [scope: business:influence:read]' },
            'missions-context': { method: 'GET', path: '/influence/missions/:mission/context', summary: 'GET /influence/missions/{mission}/context  [scope: business:influence:read]' },
        },
    },
    qms: {
        summary: 'qms (v1)',
        commands: {
            readiness: { method: 'GET', path: '/qms/readiness', summary: 'GET /qms/readiness  [scope: business:qms:read]' },
            objectives: { method: 'GET', path: '/qms/objectives', summary: 'GET /qms/objectives  [scope: business:qms:read]' },
            risks: { method: 'GET', path: '/qms/risks', summary: 'GET /qms/risks  [scope: business:qms:read]' },
            capas: { method: 'GET', path: '/qms/capas', summary: 'GET /qms/capas  [scope: business:qms:read]' },
            audits: { method: 'GET', path: '/qms/audits', summary: 'GET /qms/audits  [scope: business:qms:read]' },
            competence: { method: 'GET', path: '/qms/competence', summary: 'GET /qms/competence  [scope: business:qms:read]' },
            documents: { method: 'GET', path: '/qms/documents', summary: 'GET /qms/documents  [scope: business:qms:read]' },
            certification: { method: 'GET', path: '/qms/certification', summary: 'GET /qms/certification  [scope: business:qms:read]' },
            obligations: { method: 'GET', path: '/qms/obligations', summary: 'GET /qms/obligations  [scope: business:qms:read]' },
        },
    },
    'data-objects': {
        summary: 'data objects (v1)',
        commands: {
            list: { method: 'GET', path: '/data/objects', summary: 'GET /data/objects  [scope: data:objects:read]' },
            schema: { method: 'GET', path: '/data/objects/:object/schema', summary: 'GET /data/objects/{object}/schema  [scope: data:objects:read]' },
            create: { method: 'POST', path: '/data/objects', summary: 'POST /data/objects  [scope: data:objects:write]' },
            records: { method: 'GET', path: '/data/objects/:object/records', summary: 'GET /data/objects/{object}/records  [scope: data:records:read]' },
            'create-records': { method: 'POST', path: '/data/objects/:object/records', summary: 'POST /data/objects/{object}/records  [scope: data:records:write]' },
            upsert: { method: 'POST', path: '/data/objects/:object/records/upsert', summary: 'POST /data/objects/{object}/records/upsert  [scope: data:records:write]' },
        },
    },
    'data-records': {
        summary: 'data records (v1)',
        commands: {
            get: { method: 'GET', path: '/data/records/:uuid', summary: 'GET /data/records/{uuid}  [scope: data:records:read]' },
            update: { method: 'PATCH', path: '/data/records/:uuid', summary: 'PATCH /data/records/{uuid}  [scope: data:records:write]' },
            delete: { method: 'DELETE', path: '/data/records/:uuid', summary: 'DELETE /data/records/{uuid}  [scope: data:records:write]' },
        },
    },
    kits: {
        summary: 'kits (v1)',
        commands: {
            list: { method: 'GET', path: '/kits', summary: 'GET /kits  [scope: kits:read]' },
            get: { method: 'GET', path: '/kits/:uuid', summary: 'GET /kits/{uuid}  [scope: kits:read]' },
        },
    },
    'business-dna': {
        summary: 'business dna (v1)',
        commands: {
            list: { method: 'GET', path: '/business/dna', summary: 'GET /business/dna  [scope: business:dna:read]' },
            get: { method: 'GET', path: '/business/dna/:id', summary: 'GET /business/dna/{id}  [scope: business:dna:read]' },
        },
    },
    'business-succession': {
        summary: 'business succession planning (v1, read-only)',
        commands: {
            list: { method: 'GET', path: '/business/succession', summary: 'GET /business/succession  [scope: business:succession:read]' },
            get: { method: 'GET', path: '/business/succession/:id', summary: 'GET /business/succession/{id}  [scope: business:succession:read]' },
        },
    },
    'business-plan': {
        summary: 'business plan (v1)',
        commands: {
            list: { method: 'GET', path: '/business/plan', summary: 'GET /business/plan  [scope: business:plan:read]' },
        },
    },
    iot: {
        summary: 'iot (v1)',
        commands: {
            devices: { method: 'GET', path: '/iot/devices', summary: 'GET /iot/devices  [scope: iot:read]' },
            'create-devices': { method: 'POST', path: '/iot/devices', summary: 'POST /iot/devices  [scope: iot:write]' },
            'create-readings': { method: 'POST', path: '/iot/readings', summary: 'POST /iot/readings  [scope: iot:write]' },
            'create-alarms': { method: 'POST', path: '/iot/alarms', summary: 'POST /iot/alarms  [scope: iot:write]' },
        },
    },
    property: {
        summary: 'property (v1)',
        commands: {
            locations: { method: 'GET', path: '/property/locations', summary: 'GET /property/locations  [scope: property:read]' },
            'work-orders': { method: 'GET', path: '/property/work-orders', summary: 'GET /property/work-orders  [scope: property:read]' },
            assets: { method: 'GET', path: '/property/assets', summary: 'GET /property/assets  [scope: property:read]' },
        },
    },
    funnels: {
        summary: 'funnels (v1)',
        commands: {
            list: { method: 'GET', path: '/funnels', summary: 'GET /funnels  [scope: funnels:read]' },
            get: { method: 'GET', path: '/funnels/:uuid', summary: 'GET /funnels/{uuid}  [scope: funnels:read]' },
        },
    },
    'ad-simulations': {
        summary: 'ad simulations (v1)',
        commands: {
            list: { method: 'GET', path: '/ad-simulations', summary: 'GET /ad-simulations  [scope: business:ad-simulations:read]' },
            get: { method: 'GET', path: '/ad-simulations/:id', summary: 'GET /ad-simulations/{id}  [scope: business:ad-simulations:read]' },
        },
    },
    sites: {
        summary: 'sites (v1)',
        commands: {
            'store-locations': { method: 'GET', path: '/sites/:token/store-locations', summary: 'GET /sites/{token}/store-locations' },
            products: { method: 'GET', path: '/sites/:token/products', summary: 'GET /sites/{token}/products' },
            search: { method: 'GET', path: '/sites/:token/products/search', summary: 'GET /sites/{token}/products/search' },
            product: { method: 'GET', path: '/sites/:token/products/:slug', summary: 'GET /sites/{token}/products/{slug}' },
            'products-2': { method: 'GET', path: '/sites/:token/products/:slug', summary: 'GET /sites/{token}/products/{slug}', hidden: true },
            related: { method: 'GET', path: '/sites/:token/products/:slug/related', summary: 'GET /sites/{token}/products/{slug}/related' },
            reviews: { method: 'GET', path: '/sites/:token/products/:slug/reviews', summary: 'GET /sites/{token}/products/{slug}/reviews' },
            collections: { method: 'GET', path: '/sites/:token/collections', summary: 'GET /sites/{token}/collections' },
            'collections-products': { method: 'GET', path: '/sites/:token/collections/:slug/products', summary: 'GET /sites/{token}/collections/{slug}/products' },
            cart: { method: 'GET', path: '/sites/:token/cart', summary: 'GET /sites/{token}/cart' },
            'cart-count': { method: 'GET', path: '/sites/:token/cart/count', summary: 'GET /sites/{token}/cart/count' },
            'create-cart-items': { method: 'POST', path: '/sites/:token/cart/items', summary: 'POST /sites/{token}/cart/items' },
            'update-cart-items': { method: 'PUT', path: '/sites/:token/cart/items/:itemId', summary: 'PUT /sites/{token}/cart/items/{itemId}' },
            'delete-cart-items': { method: 'DELETE', path: '/sites/:token/cart/items/:itemId', summary: 'DELETE /sites/{token}/cart/items/{itemId}' },
            'delete-cart': { method: 'DELETE', path: '/sites/:token/cart', summary: 'DELETE /sites/{token}/cart' },
            'create-cart-apply-code': { method: 'POST', path: '/sites/:token/cart/apply-code', summary: 'POST /sites/{token}/cart/apply-code' },
            'delete-cart-apply-code': { method: 'DELETE', path: '/sites/:token/cart/apply-code/:applicationId', summary: 'DELETE /sites/{token}/cart/apply-code/{applicationId}' },
            'create-checkout-payment-intent': { method: 'POST', path: '/sites/:token/checkout/payment-intent', summary: 'POST /sites/{token}/checkout/payment-intent' },
            'create-checkout-process': { method: 'POST', path: '/sites/:token/checkout/process', summary: 'POST /sites/{token}/checkout/process' },
            orders: { method: 'GET', path: '/sites/:token/orders/:number', summary: 'GET /sites/{token}/orders/{number}' },
            'blog-articles': { method: 'GET', path: '/sites/:token/blog-articles', summary: 'GET /sites/{token}/blog-articles' },
            visitor: { method: 'GET', path: '/sites/:token/visitor', summary: 'GET /sites/{token}/visitor' },
            'create-contact-submissions': { method: 'POST', path: '/sites/:token/contact-submissions', summary: 'POST /sites/{token}/contact-submissions' },
        },
    },
    'travel-flights': {
        summary: 'travel flights (v1)',
        commands: {
            get: { method: 'GET', path: '/travel/flights/:flight', summary: 'GET /travel/flights/{flight}  [scope: travel:flights:read]' },
        },
    },
    'travel-stays': {
        summary: 'travel stays (v1)',
        commands: {
            get: { method: 'GET', path: '/travel/stays/:stay', summary: 'GET /travel/stays/{stay}  [scope: travel:stays:read]' },
        },
    },
    'travel-cars': {
        summary: 'travel cars (v1)',
        commands: {
            get: { method: 'GET', path: '/travel/cars/:car', summary: 'GET /travel/cars/{car}  [scope: travel:cars:read]' },
        },
    },
};

/**
 * Web affordances — where a HUMAN goes in the browser for each resource.
 *
 * Some surfaces are experiences, not data: you can't play a mini game, watch
 * a movie, or draw on a smartboard in a terminal. For those (and for records
 * people routinely open after finding them here), the CLI prints an
 * "↗ Open: <url>" line on a TTY and powers `openluxe <resource> open`.
 *
 * Per resource:
 *   hub    — path of the area's landing page (verified against the web app's
 *            route table; do NOT guess routes).
 *   item   — (row) => path for ONE record. Only for id-bound web routes; the
 *            server's `public_url` field (kits, pro profiles, funnels, …)
 *            always wins when present because slug/uuid/token bindings are
 *            the server's to know.
 *   label  — verb for the link line (default "Open").
 *   open   — path template for the injected `open` command; a trailing
 *            `:param?` is optional and dropped when not given.
 *
 * Piped/non-TTY output NEVER changes — agents and scripts see byte-identical
 * JSON. Humans on a TTY get the link line on stderr.
 */
export const WEB = {
    'mini-games': { hub: '/mini-games', label: 'Play', open: '/mini-games/:slug?', openSummary: 'Open the mini-games hub (or one game by slug) in your browser' },
    arena: { hub: '/arenas', label: 'Play', open: '/arenas', openSummary: 'Open the arena lobby in your browser' },
    openflix: { hub: '/openflix', label: 'Watch', open: '/openflix', openSummary: 'Open OpenFlix in your browser' },
    livestreams: { hub: '/livestreams', label: 'Watch', open: '/livestreams/:slug?', openSummary: 'Open livestreams (or one room by slug) in your browser' },
    webinars: { hub: '/webinars', open: '/webinars/:slug?', openSummary: 'Open webinars (or one webinar by slug) in your browser' },
    kits: { hub: '/kits', open: '/kits', openSummary: 'Open your kits in your browser (kit records carry a public_url landing link)' },
    courses: { hub: '/courses', label: 'Learn', open: '/courses/:slug?', openSummary: 'Open courses (or one course by slug) in your browser' },
    smartboards: { hub: '/smartboards', item: (r) => (r.uuid ? `/smartboards/${r.uuid}` : null), open: '/smartboards/:uuid?', openSummary: 'Open a smartboard by uuid (or the hub) in your browser' },
    kanbans: { hub: '/kanbans', item: (r) => (r.uuid ? `/kanbans/${r.uuid}` : null), open: '/kanbans/:kanban?', openSummary: 'Open a kanban board by uuid (or the hub) in your browser' },
    listings: { hub: '/listings', item: (r) => (r.uuid ? `/listing/${r.uuid}` : null), open: '/listings', openSummary: 'Open listings in your browser' },
    meetups: { hub: '/events', open: '/events', openSummary: 'Open events/meetups in your browser' },
    associations: { item: (r) => (r.slug ? `/associations/${r.slug}` : null), open: '/associations/:association', openSummary: 'Open an association hub in your browser (by slug)' },
    'branding-projects': { hub: '/open-creative/brand-hub', item: (r) => (r.id ? `/open-creative/brand-hub/projects/${r.id}` : null), open: '/open-creative/brand-hub', openSummary: 'Open the Brand Hub in your browser' },
    brands: { hub: '/open-creative/brand-hub', open: '/open-creative/brand-hub', openSummary: 'Open the Brand Hub in your browser' },
    deals: { item: (r) => (r.uuid ? `/deals/${r.uuid}` : null), open: '/deals/:deal', openSummary: 'Open a deal by uuid in your browser' },
    escrow: { item: (r) => (r.id ? `/escrow/${r.id}` : null), open: '/escrow/:escrow', openSummary: 'Open an escrow transaction in your browser' },
    contacts: { item: (r) => (r.id ? `/contacts/${r.id}` : null), open: '/contacts/:contact', openSummary: 'Open a contact in your browser' },
    tasks: { hub: '/tasks', open: '/tasks', openSummary: 'Open your tasks in your browser' },
    goals: { hub: '/goals', open: '/goals', openSummary: 'Open your goals in your browser' },
    'live-shop': { hub: '/live-shop', open: '/live-shop', openSummary: 'Open Live Shop in your browser' },
    credits: { hub: '/credits' },
    'professional-profiles': { open: '/pro/:handle', openSummary: 'Open a public professional profile in your browser (by handle)' },
};

// Inject the `open` commands so `openluxe <resource>` help lists them and the
// dispatcher can route them (kind: 'web' — no API call, prints/launches a URL).
for (const [name, web] of Object.entries(WEB)) {
    const res = RESOURCES[name];
    if (web.open && res && !res.commands.open) {
        res.commands.open = { kind: 'web', path: web.open, summary: web.openSummary || 'Open in your browser' };
    }
}
