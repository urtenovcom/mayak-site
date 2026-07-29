"use server";

import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/config";
import { endSession } from "@/lib/admin/session";

/** Выход: чистим httpOnly-cookie и кэш подтверждения, уводим на страницу входа. */
export async function logoutAction(): Promise<void> {
  await endSession();
  redirect(ADMIN_LOGIN_PATH);
}
