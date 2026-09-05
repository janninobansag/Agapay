"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { signIn, signInRemembered, signOut } from "@/auth";
import { signInSchema, signUpSchema } from "@/features/auth/schemas";
import { getPrisma } from "@/lib/db/prisma";

export type AuthFormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function authenticate(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const login = formData.get("rememberMe") === "on" ? signInRemembered : signIn;
    await login("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/post-login",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message:
          error.type === "CredentialsSignin"
            ? "The email or password is incorrect."
            : "Sign-in is temporarily unavailable. Please try again.",
      };
    }
    throw error;
  }

  return {};
}

export async function registerResident(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existingUser = await getPrisma().user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return { message: "An account with this email already exists." };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  try {
    await getPrisma().user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "RESIDENT",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { message: "An account with this email already exists." };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Your account was created. Please sign in." };
    }
    throw error;
  }

  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
