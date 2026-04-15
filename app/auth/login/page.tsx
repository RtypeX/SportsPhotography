import Link from "next/link";

import { defaultCollectionSlug, getCollectionDefinition } from "@/lib/site-content";

import { resendVerificationAction, signInAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    email?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const email = params.email ?? "";
  const message = params.message ?? "";
  const primaryCollection = getCollectionDefinition(defaultCollectionSlug);

  return (
    <main className="auth-shell" id="main-content">
      <div className="auth-panel">
        <p className="section-label">Admin Sign In</p>
        <h1>{primaryCollection.collectionName}</h1>
        <p className="auth-copy">
          Private sign-in for Dustin to update photo titles, captions, and featured picks. If this is a first-time login,
          verify the email first and then come back here.
        </p>

        {message ? <p className="auth-message">{message}</p> : null}

        <form action={signInAction} className="auth-form">
          <label>
            Email
            <input
              type="email"
              name="email"
              defaultValue={email}
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              spellCheck={false}
              required
            />
          </label>
          <label>
            Password
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button type="submit">Enter admin panel</button>
        </form>

        <form action={resendVerificationAction} className="auth-secondary-form">
          <input type="hidden" name="email" value={email} />
          <button type="submit" disabled={!email}>
            Resend verification email
          </button>
        </form>
        {!email ? <p className="auth-assist">Enter the account email above to resend the verification link.</p> : null}

        <p className="auth-note">
          Public gallery: <Link href="/">Return to collection</Link>
        </p>
      </div>
    </main>
  );
}
