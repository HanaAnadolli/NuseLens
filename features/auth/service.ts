// features/auth/service.ts
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  clearSessionCookie,
  createRefreshToken,
  getSession,
  getSessionFromRequest,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@core/auth";
import { getPrisma } from "@core/db";
import { error, formatError } from "@core/logger";
import type { AuthResult, AuthUser } from "@/features/auth/types";

export const loginSchema = z.object({
  email: z.string().trim().email("Shkruani një adresë email të vlefshme."),
  password: z.string().min(1, "Shkruani fjalëkalimin."),
});

export const registerSchema = z.object({
  name: z.string().trim().max(80, "Emri është shumë i gjatë.").optional(),
  email: z.string().trim().email("Shkruani një adresë email të vlefshme."),
  password: z.string().min(8, "Fjalëkalimi duhet të ketë të paktën 8 karaktere."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Shkruani fjalëkalimin aktual."),
  newPassword: z.string().min(8, "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere."),
});

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new Error("Të dhënat e hyrjes nuk janë të sakta.");
    }

    const passwordMatches = await verifyPassword(input.password, user.password);

    if (!passwordMatches) {
      throw new Error("Të dhënat e hyrjes nuk janë të sakta.");
    }

    const authUser = toAuthUser(user);
    const token = await createRefreshToken({
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
      isAdmin: authUser.isAdmin,
    });

    await setSessionCookie(token);

    return { user: authUser };
  } catch (e) {
    error("Hyrja nuk u krye dot. Ju lutemi kontrolloni të dhënat dhe provoni përsëri.", {
      file: "features/auth/service.ts",
      function: "loginUser",
      email: input.email,
      error: formatError(e),
    });
    throw new Error("Hyrja nuk u krye dot. Ju lutemi kontrolloni të dhënat dhe provoni përsëri.");
  }
}

export async function registerUser(input: RegisterInput): Promise<AuthResult | { conflictMessage: string }> {
  try {
    const prisma = getPrisma();
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      return { conflictMessage: "Një llogari me këtë email ekziston tashmë." };
    }

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    const password = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password,
        name: input.name?.trim() || null,
        role: isFirstUser ? "admin" : "user",
        isAdmin: isFirstUser,
      },
    });

    const authUser = toAuthUser(user);
    const token = await createRefreshToken({
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
      isAdmin: authUser.isAdmin,
    });

    await setSessionCookie(token);

    return { user: authUser };
  } catch (e) {
    error("Llogaria nuk u krijua dot. Ju lutemi provoni përsëri.", {
      file: "features/auth/service.ts",
      function: "registerUser",
      email: input.email,
      error: formatError(e),
    });

    throw new Error("Llogaria nuk u krijua dot. Ju lutemi provoni përsëri.");
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await clearSessionCookie();
  } catch (e) {
    error("Dalja nuk u krye dot. Ju lutemi provoni përsëri.", {
      file: "features/auth/service.ts",
      function: "logoutUser",
      error: formatError(e),
    });
    throw new Error("Dalja nuk u krye dot. Ju lutemi provoni përsëri.");
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    return user ? toAuthUser(user) : null;
  } catch (e) {
    error("Përdoruesi aktual nuk u ngarkua dot.", {
      file: "features/auth/service.ts",
      function: "getCurrentUser",
      error: formatError(e),
    });
    return null;
  }
}

export async function requireUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return null;

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    return user ? toAuthUser(user) : null;
  } catch (e) {
    error("Kërkesa nuk u autentifikua dot.", {
      file: "features/auth/service.ts",
      function: "requireUserFromRequest",
      error: formatError(e),
    });
    return null;
  }
}

export async function requireAdminFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const user = await requireUserFromRequest(request);
    return user?.isAdmin ? user : null;
  } catch (e) {
    error("Kërkesa e administrimit nuk u autorizua dot.", {
      file: "features/auth/service.ts",
      function: "requireAdminFromRequest",
      error: formatError(e),
    });
    return null;
  }
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("Ju lutemi hyni për të vazhduar.");
    }

    const passwordMatches = await verifyPassword(input.currentPassword, user.password);

    if (!passwordMatches) {
      throw new Error("Fjalëkalimi aktual nuk është i saktë.");
    }

    const password = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password },
    });
  } catch (e) {
    error("Fjalëkalimi nuk u ndryshua dot. Ju lutemi provoni përsëri.", {
      file: "features/auth/service.ts",
      function: "changePassword",
      userId,
      error: formatError(e),
    });

    if (e instanceof Error && e.message === "Fjalëkalimi aktual nuk është i saktë.") {
      throw e;
    }

    throw new Error("Fjalëkalimi nuk u ndryshua dot. Ju lutemi provoni përsëri.");
  }
}

function toAuthUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isAdmin: boolean;
}): AuthUser {
  try {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
    };
  } catch (e) {
    error("Të dhënat e përdoruesit nuk u përgatitën dot.", {
      file: "features/auth/service.ts",
      function: "toAuthUser",
      error: formatError(e),
    });
    throw new Error("Të dhënat e përdoruesit nuk u përgatitën dot.");
  }
}
