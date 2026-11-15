export function getGoogleOAuthConfig() {
  const clientId = (
    process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || ""
  ).trim();
  const clientSecret = (
    process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || ""
  ).trim();

  if (
    !clientId.endsWith(".apps.googleusercontent.com") ||
    !clientSecret ||
    /your|placeholder|example|changeme|replace[-_ ]?me/i.test(clientSecret)
  ) {
    return null;
  }

  return { clientId, clientSecret };
}

export function getFirebaseProjectId() {
  const cleanProjectId = (value: string | undefined) =>
    (value ?? "")
      .trim()
      .replace(/,+\s*$/, "")
      .replace(/^(["'])(.*)\1$/, "$2")
      .trim();

  return (
    cleanProjectId(process.env.FIREBASE_PROJECT_ID) ||
    cleanProjectId(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  );
}
