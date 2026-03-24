## Local Setup

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` and fill in these values:

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
```

## Prisma Postgres + Vercel Deployment

This app uses NextAuth with Google, GitHub, and credentials login. For production, use Prisma ORM with a hosted PostgreSQL database.

1. Create a Prisma Postgres database in the Prisma Data Platform.
2. Copy the connection string into `DATABASE_URL`.
3. Run a local migration:

```bash
npx prisma migrate dev --name init-postgres
```

4. Regenerate the Prisma client if needed:

```bash
npx prisma generate
```

5. Test locally with:

```bash
npm run dev
```

6. Import the repo into Vercel.
7. Add the same environment variables in the Vercel project settings.
8. Set `NEXTAUTH_URL` to your deployed site URL, for example:

```bash
NEXTAUTH_URL=https://your-app.vercel.app
```

9. Update OAuth providers with these production callbacks:

```text
Google: https://your-app.vercel.app/api/auth/callback/google
GitHub: https://your-app.vercel.app/api/auth/callback/github
```

10. Redeploy the app after saving env vars and provider callback URLs.

## Notes

- The old local SQLite database is not suitable for production hosting on Vercel.
- GitHub OAuth usually needs the final production callback URL, so test sign-in on the production domain after deploy.
