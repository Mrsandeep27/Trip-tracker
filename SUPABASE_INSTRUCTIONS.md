
# ⚡️ Setting up Multiplayer (Supabase)

To enable real-time sharing, you need to connect a free Supabase database.

### 1. Get Credentials
1. Go to [Supabase.com](https://supabase.com) and create a free project.
2. In your Project Dashboard -> **Settings** -> **API**.
3. Copy:
   - **Project URL**
   - **anon / public key**

### 2. Update .env File
Create a file named `.env` in the project root:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Setup Database (SQL)
Go to the **SQL Editor** in Supabase and run this script (copy/paste from `supabase_schema.sql`):

```sql
-- Create a table for trips
create table trips (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  budget numeric default 0
);

-- Create a table for expenses
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  trip_id text references trips(id) on delete cascade not null,
  title text not null,
  amount numeric not null,
  paid_by text not null,
  date text,
  category text
);

-- Create a table for members (optional, but good for persistence)
create table members (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  trip_id text references trips(id) on delete cascade not null,
  name text not null
);

-- Enable Realtime
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table trips;

-- Policies (For anonymous access - straightforward for this demo)
-- WARNING: This allows anyone with your anon key to read/write. 
-- For production, you would want proper authentication.
alter table trips enable row level security;
alter table expenses enable row level security;
alter table members enable row level security;

create policy "Public trips access" on trips for all using (true) with check (true);
create policy "Public expenses access" on expenses for all using (true) with check (true);
create policy "Public members access" on members for all using (true) with check (true);
```
