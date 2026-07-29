"use server";

import { redirect } from "next/navigation";
import { ApiError, toUserMessage } from "@/lib/admin/api";
import { ADMIN_LOGIN_PATH, ROLE_ERROR, safeNextPath } from "@/lib/admin/config";
import { endSession, fetchProfile, loginToApi, writeToken } from "@/lib/admin/session";
import {
  blockedMessage,
  checkLoginAllowed,
  clearLoginFailures,
  registerFailedLogin,
} from "@/lib/admin/login-guard";

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const login = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(String(formData.get("next") ?? ""));

  if (!login || !password) {
    return { error: "Введите логин и пароль." };
  }

  // Ограничитель на стороне сайта: только здесь виден реальный адрес клиента.
  const verdict = await checkLoginAllowed(login);
  if (verdict.blocked) {
    return { error: blockedMessage(verdict.retryAfterSeconds) };
  }

  try {
    const { token } = await loginToApi(login, password);

    // Роль проверяем до записи cookie: не-администратор в панели всё равно
    // получит 403 на каждом списке, поэтому не пускаем его вовсе.
    const user = await fetchProfile(token);
    if (user.role !== "SUPERADMIN") {
      // Пароль верный, но роль не та — это не попытка подбора, счётчик не трогаем.
      return { error: ROLE_ERROR };
    }

    await writeToken(token);
    await clearLoginFailures(login);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await registerFailedLogin(login);
      return { error: "Неверный логин или пароль." };
    }
    // Недоступный API — не повод засчитывать попытку: иначе сбой сети
    // заблокировал бы вход администратору.
    return { error: toUserMessage(error) };
  }

  // redirect() бросает исключение — только вне try/catch.
  redirect(nextPath);
}

/** Сброс непригодной сессии прямо со страницы входа. */
export async function resetSessionAction(): Promise<void> {
  await endSession();
  redirect(ADMIN_LOGIN_PATH);
}
