import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

const SESSION_COOKIE = "vm_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type SessionPayload = {
  userId: string;
  email: string;
};

const getJwtSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is missing");
  }
  return new TextEncoder().encode(secret);
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const createSessionCookie = async (payload: SessionPayload) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret());

  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_MAX_AGE,
    },
  };
};

export const attachSession = async (
  response: NextResponse,
  payload: SessionPayload,
) => {
  const cookie = await createSessionCookie(payload);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
};

export const clearSession = (response: NextResponse) => {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const getUserFromRequest = async (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.userId as string | undefined;
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId } });
  } catch (error) {
    console.error("JWT verification failed", error);
    return null;
  }
};

export const decodeSessionToken = async (token?: string) => {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch (error) {
    console.error("Session decode failed", error);
    return null;
  }
};

export const requireUser = async (request: NextRequest) => {
  const user = await getUserFromRequest(request);
  if (!user) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return { user: null, response: res as NextResponse };
  }
  return { user, response: null as NextResponse | null };
};

