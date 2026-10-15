"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";

type AuthMode = "signin" | "signup";

type RequestedRole =
  | "participant"
  | "volunteer"
  | "organizer";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("signin");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [requestedRole, setRequestedRole] =
  useState<RequestedRole>("participant");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
            data: {
                full_name: fullName.trim(),
                requested_role: requestedRole,
            },
            emailRedirectTo:
                `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        /*
          Some Supabase projects allow immediate sessions
          after signup. Others require email confirmation.
        */

        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }

        setSuccessMessage(
          "Account created. Check your email for the confirmation link before signing in."
        );

        setMode("signin");
        setPassword("");
        return;
      }

      const { error } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again."
            : error.message
        );

        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Authentication error:", error);

      setErrorMessage(
        "Unable to connect to the authentication service. Check your connection and Supabase configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-layout">

        {/* LEFT BRAND PANEL */}

        <aside className="auth-brand-panel">
          <div className="auth-brand">

            <div className="auth-brand-mark">
              V<span>.</span>
            </div>

            <div>
              <h1>VerteX</h1>
              <span>CAMPUS INTELLIGENCE</span>
            </div>
          </div>

          <div className="auth-brand-content">

            <div className="auth-eyebrow">
              <Sparkles size={15} />
              THE FUTURE OF CAMPUS EVENTS
            </div>

            <h2>
              Bring your
              <br />
              campus <span>together.</span>
            </h2>

            <p>
              One intelligent workspace to plan events,
              coordinate teams, manage venues, and keep
              your campus connected.
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <CalendarDays size={19} />
                </span>

                <div>
                  <strong>Smarter event planning</strong>

                  <p>
                    Organize campus activities in one place.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <ShieldCheck size={19} />
                </span>

                <div>
                  <strong>Secure authentication</strong>

                  <p>
                    Sign in using your own account.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <Users size={19} />
                </span>

                <div>
                  <strong>Connected teams</strong>

                  <p>
                    Build better campus experiences together.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="auth-brand-footer">
            <span>
              <span className="auth-footer-dot" />
              CAMPUS EVENT INTELLIGENCE
            </span>

            <span>VER TEX · 2026</span>
          </div>
        </aside>

        {/* RIGHT AUTHENTICATION PANEL */}

        <section className="auth-form-panel">

          <div className="auth-form-top">
            <span>WELCOME TO VER TEX</span>

            <div className="auth-secure-label">
              <LockKeyhole size={13} />
              Secure sign-in
            </div>
          </div>

          <div className="auth-form-container">

            <div className="auth-mobile-brand">
              <div className="auth-brand-mark">
                V<span>.</span>
              </div>

              <strong>VerteX</strong>
                </div>
            </div>

            <div className="auth-heading">

              <div className="auth-heading-icon">
                {mode === "signin" ? (
                  <ShieldCheck size={23} />
                ) : (
                  <Users size={23} />
                )}
              </div>

              <h2>
                {mode === "signin"
                  ? "Welcome back"
                  : "Create your account"}
              </h2>

              <p>
                {mode === "signin"
                  ? "Sign in to access your campus workspace."
                  : "Join VerteX and get started with your campus workspace."}
              </p>
            </div>

            {/* MODE SWITCHER */}

            

            {/* AUTHENTICATION FORM */}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {mode === "signup" && (
                <label className="auth-field">

                  <span>Full name</span>

                  <div className="auth-input-wrap">
                    <Users size={17} />

                    <input
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      required
                      maxLength={100}
                    />
                  </div>

                </label>
              )}

                {mode === "signup" && (
  <label className="auth-field">
    <span>Account type</span>

    <select
      className="auth-role-select"
      value={requestedRole}
      onChange={(event) =>
        setRequestedRole(
          event.target.value as RequestedRole
        )
      }
    >
      <option value="participant">
        Participant — Discover and register for events
      </option>

      <option value="volunteer">
        Volunteer — Help manage campus activities
      </option>

      <option value="organizer">
        Organizer — Request event management access
      </option>
    </select>

    {requestedRole === "organizer" && (
      <small className="auth-role-hint">
        Organizer access requires administrator approval.
      </small>
    )}
  </label>
)}

              <label className="auth-field">

                <span>Email address</span>

                <div className="auth-input-wrap">
                  <Mail size={17} />

                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    maxLength={254}
                  />
                </div>

              </label>

              <label className="auth-field">

                <span>Password</span>

                <div className="auth-input-wrap">
                  <LockKeyhole size={17} />

                  <input
                    type={
                      showPassword ? "text" : "password"
                    }
                    name="password"
                    autoComplete={
                      mode === "signin"
                        ? "current-password"
                        : "new-password"
                    }
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    minLength={8}
                    maxLength={128}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </label>

              {errorMessage && (
                <div
                  className="auth-message auth-error"
                  role="alert"
                >
                  <XCircle size={17} />

                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div
                  className="auth-message auth-success"
                  role="status"
                >
                  <CheckCircle2 size={17} />

                  <span>{successMessage}</span>
                </div>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />

                    {mode === "signin"
                      ? "Signing in..."
                      : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "signin"
                      ? "Sign in to VerteX"
                      : "Create my account"}

                    <ArrowRight size={17} />
                  </>
                )}
              </button>

            </form>

{/* Small account switcher */}

<div className="auth-switch-prompt">
  {mode === "signin" ? (
    <>
      <span>Don't have an account?</span>

      <button
        type="button"
        onClick={() => changeMode("signup")}
      >
        Create account
      </button>
    </>
  ) : (
    <>
      <span>Already have an account?</span>

      <button
        type="button"
        onClick={() => changeMode("signin")}
      >
        Sign in
      </button>
    </>
  )}
</div>

<div className="auth-form-divider">

            <div className="auth-security-note">
              <ShieldCheck size={18} />

              <p>
                Your account is managed by Supabase
                Authentication. Use your own credentials
                and never share your password.
              </p>
            </div>

          </div>

          <footer className="auth-form-footer">
            <span>
              © 2026 VerteX Campus Intelligence
            </span>

            <span>
              Designed for connected campuses
            </span>
          </footer>

        </section>
      </section>
    </main>
  );
}