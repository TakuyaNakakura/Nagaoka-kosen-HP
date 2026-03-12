import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "ntca_session";

export function sessionCookieOptions() {
  const secure =
    process.env.COOKIE_SECURE != null
      ? process.env.COOKIE_SECURE === "true"
      : process.env.VERCEL === "1" ||
        process.env.VERCEL === "true" ||
        process.env.VERCEL_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

export async function invalidateSession(token: string) {
  await prisma.session.deleteMany({
    where: {
      tokenHash: hashToken(token),
    },
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  if (!session.user.active) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireUser(role?: UserRole) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?notice=${encodeURIComponent("ログインが必要です")}&kind=error`);
  if (role && user.role !== role) {
    redirect(`/login?notice=${encodeURIComponent("権限がありません")}&kind=error`);
  }
  return user;
}

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(24).toString("hex");
  await prisma.passwordResetRequest.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return token;
}

export async function consumePasswordResetToken(token: string, password: string) {
  const request = await prisma.passwordResetRequest.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: true,
    },
  });

  if (!request || request.usedAt || request.expiresAt < new Date()) {
    return false;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: request.userId },
      data: {
        passwordHash: await hashPassword(password),
      },
    }),
    prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({
      where: {
        userId: request.userId,
      },
    }),
  ]);

  return true;
}

export async function actorMeta() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      actorUserId: null,
      actorLabel: "public",
    };
  }

  return {
    actorUserId: user.id,
    actorLabel: `${user.role === UserRole.ADMIN ? "admin" : "member"}: ${user.name}`,
  };
}
