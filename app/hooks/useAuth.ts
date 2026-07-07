"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignInData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  authProvider?: string;
  role?: string;
}

export function useAuth() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (signInData: SignInData) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sign in failed");
      }

      const callback =
        new URLSearchParams(window.location.search).get("callbackUrl");

      if (callback) {
        window.location.href = callback;
      } else {
        window.location.reload();
      }

      return data.user;
    } catch (err) {
      throw new Error(
        (err as Error).message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (signUpData: SignUpData) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sign up failed");
      }

      const callback =
        new URLSearchParams(window.location.search).get("callbackUrl");

      if (callback) {
        window.location.href = callback;
      } else {
        window.location.reload();
      }

      return data.user;
    } catch (err) {
      throw new Error(
        (err as Error).message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  const handleMicrosoftSignIn = () => {
    window.location.href = "/api/auth/microsoft";
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", {
      method: "POST",
    });

    window.location.href = "/";
  };

  return {
    loading,
    error,
    handleEmailSignIn,
    handleEmailSignUp,
    handleGoogleSignIn,
    handleMicrosoftSignIn,
    handleSignOut,
  };
}