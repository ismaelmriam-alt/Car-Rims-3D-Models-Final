# RIMS — DRIVE DIFFERENT (Phase 1 + Phase 2)

React + Vite client and Express API. MongoDB is optional.

## Live demo

[car-rims-3d-models.vercel.app](https://car-rims-3d-models.vercel.app)

## Run

```
npm run install:all
npm run dev                            # client :5173, API :5000; no database required
cd server && npm test                  # fitment engine + API tests
```

The demo catalog loads from local seed data in memory by default. Demo orders last only until the API restarts. To persist catalog data and demo orders, set `MONGO_URI` in `server/.env`, run `npm run seed`, and restart the API.
Homepage hero: the supplied racing artwork is the static background and video poster; an optional looping clip can be placed at `client/public/media/hero.mp4` for desktop.

## Deploying the frontend to Vercel

Create a Vercel project from this repository and leave **Root Directory** at the repository root. The root `vercel.json` installs the client dependencies, builds the Vite app in `client`, and publishes `client/dist`. Its rewrite supports direct navigation and refreshes on client-side routes. Do not set the output directory to `client` or `client/src`.

The frontend requests its API from `/api` by default, which works with the local Vite proxy. For production, deploy the Express API separately and set the Vercel environment variable `VITE_API_BASE_URL` to that API's origin (for example, `https://api.example.com`, with no trailing slash) for the Production environment. The API must allow requests from the deployed site; the frontend alone does not host the Express API. Redeploy after changing the environment variable.

## Fitment (Phase 2)

- Vehicle wheel specs are transcribed from cited sources (koleso.ee, tirewheelguide.com); each fitment record stores its source URL and retrieval date. Models without source data are marked **unverified** and never receive compatibility claims.
- Compatibility rule (shown in the UI): equal bolt pattern, rim centre bore ≥ hub bore, equal diameter, width within ±0.5", offset within ±3 mm of a size listed for the trim. Tolerances are an engineering choice, not a manufacturer rule. Style suggestions never affect compatibility.
- Verified recommendations show the compatible product size and why it matches the selected trim. Unverified models can receive vehicle-specific design ideas, but never a claimed compatible rim or size.
- Rim products and their sizes are fictional demo data.
- The 3D car is procedural and stylised (by body type), not an exact model of the chosen vehicle.
- Product imagery uses real-world wheel photographs from Wikimedia Commons, saved in `client/public/media/real-rims/`. They are visual references only, not verified photos of the fictional demo products or their finishes. The photo sources and license details are listed in `client/public/media/real-rims/CREDITS.md`.

## Cart / Checkout (demo)

Cart in localStorage; orders are validated server-side (prices, stock and sizes come from the catalog) and stored in memory by default or MongoDB when configured, with `isDemo: true`. Payment methods: Cash on Delivery, Wish, Bank Transfer — no real payment, shipping or email.
