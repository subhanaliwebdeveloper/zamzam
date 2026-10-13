ZAM ZAM CAFE - LOCAL DEVELOPMENT AND VERCEL DEPLOYMENT

LOCAL DEVELOPMENT
1) Configure backend/.env using backend/.env.example.
2) Install dependencies in both backend and frontend folders with npm install.
3) Run START-ZAMZAM.bat, or run `npm run dev` in each folder separately.
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173
4) Local development can use the local-only admin defaults:
   - Email: admin@zamzamcafe.com
   - Password: admin123
   Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env to change them.

VERCEL DEPLOYMENT
Deploy the frontend and backend as two separate Vercel projects from this repository.
Do not deploy the repository root as a single project.

Backend project:
1) Import the repository as a Vercel project and set Root Directory to `backend`.
2) Add these Production environment variables in Vercel:
   - MONGODB_URI: MongoDB Atlas connection string
   - JWT_SECRET: a unique random secret of at least 32 characters
   - ADMIN_EMAIL: the intended admin account email
   - ADMIN_PASSWORD: a strong, unique admin password
   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
   - CAFE_LAT and CAFE_LNG (optional; defaults point to Nia Lahore)
3) Deploy. The backend project URL is the API host; endpoints use the `/api` prefix.
4) If using MongoDB Atlas, allow network access from Vercel as required by your Atlas
   network policy. Never commit real credentials or put backend secrets in the frontend.

Frontend project:
1) Create a second Vercel project from the same repository and set Root Directory to
   `frontend`.
2) Set `VITE_API_URL` to the backend URL followed by `/api`, for example
   `https://zamzam-api.vercel.app/api`.
3) Use the Vite build command `npm run build` and output directory `dist`, then deploy.
   VITE_ variables are embedded at build time; redeploy after changing them.

Vercel serverless functions do not support persistent Socket.IO connections. The admin
orders page refreshes periodically on Vercel; live Socket.IO notifications remain
available for local development or when using a separate persistent Socket.IO host.
