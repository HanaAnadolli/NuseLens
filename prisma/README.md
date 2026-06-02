# prisma/README.md

NuseLens uses Prisma with Neon Postgres.

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
