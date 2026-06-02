// features/auth/hooks.ts
"use client";

import type { AuthUser } from "@/features/auth/types";

interface AuthResponse {
  data?: {
    user: AuthUser;
  };
  error?: string;
}

export async function submitLogin(input: { email: string; password: string }): Promise<AuthUser> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await response.json()) as AuthResponse;

    if (!response.ok || !body.data?.user) {
      throw new Error(body.error ?? "Hyrja nuk u krye dot.");
    }

    return body.data.user;
  } catch {
    throw new Error("Hyrja nuk u krye dot. Ju lutemi kontrolloni të dhënat dhe provoni përsëri.");
  }
}

export async function submitRegister(input: {
  name?: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await response.json()) as AuthResponse;

    if (!response.ok || !body.data?.user) {
      throw new Error(body.error ?? "Llogaria nuk u krijua dot.");
    }

    return body.data.user;
  } catch {
    throw new Error("Llogaria nuk u krijua dot. Ju lutemi provoni përsëri.");
  }
}

export async function submitLogout(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Dalja nuk u krye dot.");
    }
  } catch {
    throw new Error("Dalja nuk u krye dot. Ju lutemi provoni përsëri.");
  }
}

export async function submitPasswordChange(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error ?? "Fjalëkalimi nuk u ndryshua dot.");
    }
  } catch {
    throw new Error("Fjalëkalimi nuk u ndryshua dot. Ju lutemi provoni përsëri.");
  }
}
