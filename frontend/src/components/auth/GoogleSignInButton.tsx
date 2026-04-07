"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_black" | "filled_blue";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              logo_alignment?: "left" | "center";
            }
          ) => void;
        };
      };
    };
  }
}

type PublicSettings = {
  site?: {
    google_client_id?: string;
  };
};

type Props = {
  onCredential: (credential: string) => Promise<void> | void;
  disabled?: boolean;
};

export default function GoogleSignInButton({ onCredential, disabled = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<PublicSettings>("/settings/public/").then((res) => {
      const id = res?.site?.google_client_id || "";
      if (!id) {
        setError("Google sign-in is not configured yet.");
        return;
      }
      setClientId(id);
    });
  }, []);

  useEffect(() => {
    if (!clientId || disabled) return;

    const existing = document.querySelector('script[data-google-identity="true"]');
    const render = () => {
      if (!window.google || !containerRef.current) return;

      containerRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const credential = response?.credential || "";
          if (!credential) return;
          await onCredential(credential);
        },
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        text: "continue_with",
        shape: "pill",
        width: 220,
        logo_alignment: "left",
      });
    };

    if (existing) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-identity", "true");
    script.onload = render;
    script.onerror = () => setError("Failed to load Google sign-in.");
    document.head.appendChild(script);
  }, [clientId, disabled, onCredential]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="flex justify-center">
      <div ref={containerRef} />
    </div>
  );
}
