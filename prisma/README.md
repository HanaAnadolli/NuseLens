# prisma/README.md

NuseLens uses Prisma with Supabase Postgres.

Use the transaction pooler URL for `DATABASE_URL` and the session pooler URL for `DIRECT_URL`.

Run:

```bash
npx prisma generate
npx prisma migrate dev
```

Optional seed variables:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-me
```
