# INSTRUCTIONS.md

NuseLens is a V1 wedding / kanagjegj photo upload app.

Setup:

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The first registered user is automatically created as an admin.

Database:

Set `DATABASE_URL` to the Supabase transaction pooler connection string and `DIRECT_URL` to the Supabase session pooler connection string, then run `npx prisma migrate dev`.

Supabase Storage uploads:

Create a public Supabase Storage bucket named `photos`. Set `PHOTO_STORAGE=supabase`, `SUPABASE_STORAGE_BUCKET=photos`, and `SUPABASE_SERVICE_ROLE_KEY` to the project service role key from Supabase Dashboard > Project Settings > API.

Keep `SUPABASE_SERVICE_ROLE_KEY` only in server-side `.env` files. Do not expose it with a `NEXT_PUBLIC_` prefix.

Google Drive uploads are still available as an optional fallback by setting `PHOTO_STORAGE=google_drive` and configuring the Google Drive service account variables in `.env.example`.
