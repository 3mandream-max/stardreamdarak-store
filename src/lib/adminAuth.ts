import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "admin_auth";

export async function isAdminAuthenticated() {
  return (await cookies()).get(ADMIN_COOKIE)?.value === "1";
}

export async function requireAdminAuth() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
}

export async function setAdminAuthCookie() {
  // Security note: Cookie gate is for MVP only and is not a full authentication/authorization solution.
  (await cookies()).set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function clearAdminAuthCookie() {
  (await cookies()).delete(ADMIN_COOKIE);
}
