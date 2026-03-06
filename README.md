# Trip Tracker

A React + Vite web application for planning and tracking trips, backed by Supabase (PostgreSQL).

## Tech Stack
- **Frontend**: React, Vite
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Project Structure
```
src/                # React components and logic
public/             # Static assets
supabase/           # DB config and migrations
supabase_schema.sql
```

## Getting Started
```bash
git clone https://github.com/mrsandeep27/Trip-tracker.git
cd Trip-tracker
npm install
cp .env.example .env   # Add your Supabase URL and anon key
npm run dev
```

## Features
- Plan and organize trips
- Persistent data via Supabase
- Responsive React UI

## License
MIT
