# INSTRUCTIONS.md

NuseLens is a V1 wedding / kanagjegj photo upload app.

Setup:

```bash
cp .env.example .env
npm install
docker compose up -d
npx prisma generate
npx prisma migrate dev
npm run dev
```

The first registered user is automatically created as an admin.

Local Docker database:

```bash
docker compose up -d
npx prisma migrate dev
```
