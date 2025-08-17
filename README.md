StarPawns Backend

This is the backend service for the StarPawns real-time auction platform.
It provides APIs, authentication, real-time socket communication, and integrations with Supabase (Postgres), Redis, and SendGrid.

🚀 Tech Stack
-Node.js + Express — REST API
-Supabase (PostgreSQL) — database
-Redis (Upstash) — caching & pub/sub
-Socket.IO — real-time bidding & auction updates
-JWT — authentication

⚙️ Environment Variables (.env)

Create a .env file in the root (backend/) with the following:
NODE_ENV=production
PORT=5000

CLIENT_URL=https://your-frontend-url.com
SOCKET_URL=https://your-backend-url.com

# ===== Database (Supabase) =====
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
DATABASE_URL=your-supabase-postgres-url

# ===== Redis (Upstash) =====
REDIS_URL=your-upstash-redis-url

# ===== Authentication =====
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d

# ===== SendGrid =====
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-email@example.com

🛠️ Installation & Setup

1. Clone the repo
git clone https://github.com/your-username/starpawns-backend.git
cd starpawns-backend/backend

2. Install dependencies
npm install

3. Set up environment variables
Create .env file as shown above.

4.Start the server
npm run dev     # for development (nodemon)
npm start       # for production


📡 API Endpoints
Base URL: https://your-backend-url.com/api

POST /auth/register – Register user

POST /auth/login – Login user & get JWT

GET /auctions – Fetch all auctions

POST /auctions/:id/decision – Seller decision (accept / reject / counter)

POST /bids – Place a bid


🔌 WebSocket Events

The backend uses Socket.IO for real-time bidding.
Events include:

placeBid → user places a bid
newBid → broadcast new bid to all clients
sellerDecision → notify buyers when seller accepts / rejects / counters

✅ Deployment

Frontend: Hosted on Render / Netlify (update CLIENT_URL)
Backend: Hosted on Render (PORT=5000)
Ensure CORS is configured to allow your frontend URL

