This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Sign-in provider setup

Copy `.env.local.example` to `.env.local`, then add credentials from your own provider projects. Do not commit `.env.local` or paste provider secrets into source code.

### Google sign-in

Create an OAuth 2.0 client with application type **Web application** in Google Cloud Console. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local`. Add the callback URL for the exact host and port you run:

- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/google`
- Your production URL followed by `/api/auth/callback/google`

The Google sign-in button stays disabled when the Web client ID or secret is missing or still a placeholder. A successful first Google sign-in routes the farmer to profile completion for their name, mobile number, and location.

### Phone OTP

Set the `NEXT_PUBLIC_FIREBASE_*` web configuration values in `.env.local`, enable **Phone** under Firebase Authentication sign-in providers, and configure SMS regions. Web phone authentication requires reCAPTCHA and an authorized domain; use the Firebase Auth Emulator or configured test phone numbers for local development, then use an authorized HTTPS domain for real SMS sign-in.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
