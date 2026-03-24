"use client";

import { SessionProvider, signOut } from "next-auth/react";
import { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * A wrapper for SessionProvider that handles the client-side session state.
 * It also includes a global error handler to sign out users if the session
 * fetch fails with an invalid token/HTML response (common in redirect loops).
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const handleAuthError = (event: ErrorEvent) => {
      // Catch "Unexpected token <" or fetch errors related to Auth
      if (
        event.message.includes("Unexpected token '<'") ||
        event.message.includes("not valid JSON")
      ) {
        console.warn("Auth session corruption detected. Signing out...", event.message);
        signOut({ redirect: true, callbackUrl: "/login" });
      }
    };

    window.addEventListener("error", handleAuthError);
    return () => window.removeEventListener("error", handleAuthError);
  }, []);

  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
