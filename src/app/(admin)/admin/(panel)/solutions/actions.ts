"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/admin/api";
import { linesToArray } from "@/lib/admin/format";
import type { FieldLabels } from "@/lib/admin/errors";
import { CONTENT_TAGS, revalidateContent } from "@/lib/admin/revalidate";
import { withToken } from "@/lib/admin/run";
import type {
  ActionResult,
  AdminFaqItem,
  AdminProcessStep,
  AdminSolution,
  AdminStat,
} from "@/lib/admin/types";

/** Адрес раздела «Главная» — под ним живут все три таба. */
const PATH = "/admin/solutions";

/** Названия полей формы направления — для русских сообщений об ошибках API. */
const LABELS: FieldLabels = {
  label: "Метка вкладки",
  kicker: "Надзаголовок",
  title: "Заголовок",
  icon: "Иконка",
  description: "Описание",
};

const STAT_LABELS: FieldLabels = { value: "Значение", label: "Подпись", icon: "Иконка" };
const PROCESS_LABELS: FieldLabels = { n: "Номер", title: "Название этапа" };


export type SolutionProductValues = {
  /** ключ React, на сервер не уходит */
  key: string;
  name: string;
  image: string;
};

export type SolutionFormValues = {
  key: string;
  icon: string;
  label: string;
  kicker: string;
  title: string;
  description: string;
  bullets: string;
  published: boolean;
  sortOrder: string;
  products: SolutionProductValues[];
};

function toBody(values: SolutionFormValues) {
  const body: Record<string, unknown> = {
    icon: values.icon.trim(),
    label: values.label.trim(),
    kicker: values.kicker.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
    bullets: linesToArray(values.bullets),
    published: values.published,
    // API заменяет вложенные товары целиком, порядок берём из формы.
    products: values.products.map((item, index) => ({
      name: item.name.trim(),
      image: item.image.trim(),
      sortOrder: index,
    })),
  };

  if (values.key.trim()) body.key = values.key.trim();

  const sortOrder = values.sortOrder.trim();
  if (sortOrder) body.sortOrder = sortOrder;

  return body;
}

export async function saveSolutionAction(
  id: string | null,
  values: SolutionFormValues,
): Promise<ActionResult<AdminSolution>> {
  const result = await withToken(
    (token) =>
      id
        ? apiFetch<AdminSolution>(`/api/solutions/${id}`, {
            method: "PUT",
            token,
            body: toBody(values),
          })
        : apiFetch<AdminSolution>("/api/solutions", {
            method: "POST",
            token,
            body: toBody(values),
          }),
    LABELS,
  );

  if (result.ok) {
    revalidatePath("/admin/solutions");
    revalidatePath(`/admin/solutions/${result.data.id}`);
    // Блок «Решения по задачам» на главной обновляется сразу.
    revalidateContent(CONTENT_TAGS.solutions);
  }

  return result;
}

export async function deleteSolutionAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/solutions/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) {
    revalidatePath("/admin/solutions");
    revalidateContent(CONTENT_TAGS.solutions);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Цифры доверия (таб «Цифры доверия»)
// ---------------------------------------------------------------------------
//
// Живут в том же эндпоинте /api/settings, что и контакты, поэтому тег кэша у
// них общий — `settings`. Раздел панели при этом другой: цифры и этапы это
// блоки главной страницы, а не контактные данные компании.

export type StatFormValues = {
  value: string;
  label: string;
  icon: string;
  sortOrder: string;
};

export async function saveStatAction(
  id: string | null,
  values: StatFormValues,
): Promise<ActionResult<AdminStat>> {
  const body: Record<string, unknown> = {
    value: values.value.trim(),
    label: values.label,
    icon: values.icon.trim(),
  };
  if (values.sortOrder.trim()) body.sortOrder = values.sortOrder.trim();

  const result = await withToken(
    (token) =>
      id
        ? apiFetch<AdminStat>(`/api/settings/stats/${id}`, { method: "PUT", token, body })
        : apiFetch<AdminStat>("/api/settings/stats", { method: "POST", token, body }),
    STAT_LABELS,
  );

  if (result.ok) {
    revalidatePath(PATH);
    // Контакты, цифры и этапы приходят одним эндпоинтом — тег у них общий.
    revalidateContent(CONTENT_TAGS.settings);
  }
  return result;
}

export async function deleteStatAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/settings/stats/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) {
    revalidatePath(PATH);
    revalidateContent(CONTENT_TAGS.settings);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Этапы работы (таб «Этапы работы»)
// ---------------------------------------------------------------------------

export type ProcessFormValues = {
  n: string;
  title: string;
  sortOrder: string;
};

export async function saveProcessAction(
  id: string | null,
  values: ProcessFormValues,
): Promise<ActionResult<AdminProcessStep>> {
  const body: Record<string, unknown> = {
    n: values.n.trim(),
    title: values.title.trim(),
  };
  if (values.sortOrder.trim()) body.sortOrder = values.sortOrder.trim();

  const result = await withToken(
    (token) =>
      id
        ? apiFetch<AdminProcessStep>(`/api/settings/process/${id}`, { method: "PUT", token, body })
        : apiFetch<AdminProcessStep>("/api/settings/process", { method: "POST", token, body }),
    PROCESS_LABELS,
  );

  if (result.ok) {
    revalidatePath(PATH);
    revalidateContent(CONTENT_TAGS.settings);
  }
  return result;
}

export async function deleteProcessAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/settings/process/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) {
    revalidatePath(PATH);
    revalidateContent(CONTENT_TAGS.settings);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Вопросы и ответы
// ---------------------------------------------------------------------------

const FAQ_LABELS: FieldLabels = { question: "Вопрос", answer: "Ответ" };

export type FaqFormValues = {
  question: string;
  answer: string;
  published: boolean;
  showOnHome: boolean;
  sortOrder: string;
};

export async function saveFaqAction(
  id: string | null,
  values: FaqFormValues,
): Promise<ActionResult<AdminFaqItem>> {
  const body: Record<string, unknown> = {
    question: values.question.trim(),
    answer: values.answer.trim(),
    published: values.published,
    showOnHome: values.showOnHome,
  };
  if (values.sortOrder.trim()) body.sortOrder = values.sortOrder.trim();

  const result = await withToken(
    (token) =>
      id
        ? apiFetch<AdminFaqItem>(`/api/faq/${id}`, { method: "PUT", token, body })
        : apiFetch<AdminFaqItem>("/api/faq", { method: "POST", token, body }),
    FAQ_LABELS,
  );

  if (result.ok) {
    revalidatePath(PATH);
    // Вопросы показываются на главной и на /faq — сбрасываем их общий тег.
    revalidateContent(CONTENT_TAGS.faq);
  }
  return result;
}

export async function deleteFaqAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/faq/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) {
    revalidatePath(PATH);
    revalidateContent(CONTENT_TAGS.faq);
  }
  return result;
}
