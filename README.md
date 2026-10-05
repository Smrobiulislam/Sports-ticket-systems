# Sports Event Mobile Ticketing

Mobile-first sports event ticketing starter built with React + Vite and Node.js + Express.

## Included
- Sports event listing
- Ticket tier selection
- Demo checkout flow
- Unique ticket ID + QR code
- Mobile ticket display
- Organizer dashboard
- Create event
- Sales/revenue summary
- Attendee list
- CSV export
- Modular structure ready for real payment, database, seat selection and notifications

## Run

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

This starter uses in-memory demo data. Replace the storage/service layer with PostgreSQL/MongoDB for production and connect Stripe/another payment provider using the service abstraction.

## Environment
See `backend/.env.example`.
Never commit real payment/API secrets.
