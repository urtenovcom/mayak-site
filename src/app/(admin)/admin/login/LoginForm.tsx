"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, Field, TextInput } from "@/components/admin/ui";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  // Поля контролируемые: иначе React сбрасывает форму после действия
  // и при ошибке логин пришлось бы вводить заново.
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />

      <Field label="Логин" htmlFor="login" required>
        <TextInput
          id="login"
          name="login"
          autoComplete="username"
          autoFocus
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          disabled={pending}
        />
      </Field>

      <Field label="Пароль" htmlFor="password" required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending}
        />
      </Field>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Button type="submit" disabled={pending} className="mt-1 h-11 w-full text-[14px]">
        {pending ? "Проверяем…" : "Войти"}
      </Button>
    </form>
  );
}
