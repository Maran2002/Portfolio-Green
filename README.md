# Elamaran A — Full Stack Developer Portfolio

The portfolio runs as a single Next.js App Router application. Public pages are server-rendered with interactive client components where needed. Route Handlers provide the project, settings, admin, analytics, visitor tracking, and contact email APIs.

## Run locally

Use Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

The root `.env` is configured for this workspace. For another environment, copy `.env.example` to `.env.local` and fill in the values. Public display settings use the `NEXT_PUBLIC_` prefix. Keep backend credentials server-side:

```env
NEXT_PUBLIC_EMAIL=
NEXT_PUBLIC_LINKEDIN_URL=
NEXT_PUBLIC_GITHUB_URL=
NEXT_PUBLIC_USER_NAME="Elamaran A"
NEXT_PUBLIC_USER_FIRST_NAME=Elamaran
NEXT_PUBLIC_USER_LAST_NAME=A
NEXT_PUBLIC_USER_ROLE_PRIMARY="Full Stack Developer — MERN"
NEXT_PUBLIC_USER_ROLES="MERN Stack Developer,React Developer,Full Stack Engineer"
NEXT_PUBLIC_YEARS_EXPERIENCE=1+
NEXT_PUBLIC_PROJECTS_COUNT=5+
NEXT_PUBLIC_CLIENTS_COUNT=2+
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_APP_HEADER_NAME=x-client-access-id-pf
NEXT_PUBLIC_APP_HEADER_VALUE=

MONGODB_URI=
ADMIN_USERNAME=
ADMIN_PASSWORD=
JWT_SECRET=
API_KEY=
APP_HEADER_NAME=x-client-access-id-pf
APP_HEADER_VALUE=
MAIL_SERVICE=gmail
MAIL_SENDER_EMAIL=
MAIL_SENDER_PASS=
MAIL_RECIPIENT_EMAIL=
```

The public API key and context header preserve the existing client-to-API contract. The database, JWT, admin login, and mail credentials are only read by server Route Handlers.

## Routes

- `/` — portfolio sections
- `/project/[id]` — project details
- `/resume` — resume viewer
- `/admin` — admin login
- `/admin/dashboard` — project and settings management
- `/admin/analytics` — visitor analytics
- `/api/[...path]` — MongoDB-backed API Route Handler
- `/send-email` — contact form email Route Handler

## Production

```bash
npm run build
npm start
```

Deploy the Next.js application to a Node.js hosting platform such as Vercel.
