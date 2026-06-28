# FutureBlink Announcement App

A Shopify embedded app that lets merchants set an announcement banner displayed live on their storefront.

## What It Does

1. Merchant types an announcement in the Shopify Admin dashboard (e.g. "Sale 50% Off")
2. Clicks **Save**
3. Text is stored in **MongoDB** (with timestamp for audit history)
4. Text is synced to **Shopify Shop Metafield** via GraphQL Admin API
5. The **Theme App Extension** reads the metafield and displays the banner live on the storefront

## Tech Stack

- Frontend: React, Shopify Polaris
- Backend: Node.js, React Router
- Database: MongoDB Atlas (Mongoose)
- Shopify API: Admin GraphQL API
- Storefront: Theme App Extension (Liquid)

## Features

- Create announcements from Shopify Admin
- Saves to MongoDB with timestamp (audit history)
- Syncs to Shopify Shop Metafield via GraphQL
- Displays live on storefront via Theme App Extension
- Success/error feedback in the dashboard UI

## How to Run Locally

### Prerequisites

- Node.js v20+
- Shopify CLI installed
- MongoDB Atlas account
- Shopify Partner account + Development Store

### 1. Clone the repo

git clone https://github.com/princylakadiya/futureblink-announcement-app.git
cd futureblink-announcement-app

### 2. Install dependencies

npm install

### 3. Create .env file in the root

SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_APP_URL=your_tunnel_url
MONGODB_URI=your_mongodb_atlas_connection_string
SCOPES=write_products,write_metafields,read_metafields,write_metaobjects

### 4. Run the app

shopify app dev

- Wait until terminal shows Local: http://localhost:XXXXX/
- Press P to open the app preview in your browser
- Install the app on your development store when prompted

### 5. Enable the Theme App Extension

1. Go to Online Store → Themes → Customize
2. Click App Embeds (eye icon in left sidebar)
3. Toggle ON Announcement Banner
4. Click Save

## How It Works

Admin Dashboard → Save clicked → MongoDB stores text + timestamp → Shopify Metafield updated → Theme Extension reads metafield → Banner shows on storefront

## Troubleshooting

**Blank page when opening app**
Wait for terminal to show Local: http://localhost:XXXXX/ then hard refresh (Ctrl+Shift+R)

**Announcement not showing on storefront**
Make sure the App Embed Block is toggled ON in the theme editor

**MongoDB connection error**
Check MONGODB_URI in .env and whitelist your IP in MongoDB Atlas Network Access

## Submission

- GitHub: https://github.com/princylakadiya/futureblink-announcement-app
- Demo Video: [Loom link here]
- Deployed URL: [Render/Fly.io URL here]
