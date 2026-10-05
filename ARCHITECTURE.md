# Architecture

Frontend and backend are separated so payment providers, database persistence, seat selection and notifications can evolve independently.

Purchase flow:
1. Customer selects event/tier.
2. Backend creates an order.
3. Payment provider session is created.
4. Payment webhook confirms payment.
5. Backend generates unique ticket + validation token.
6. Email/SMS service delivers ticket.
7. Mobile QR is displayed for stadium entry.

The current starter uses a demo order flow and in-memory data. Do not use it for real-money production until payment webhooks, persistent storage, authentication, rate limiting, audit logs and QR validation are implemented.
