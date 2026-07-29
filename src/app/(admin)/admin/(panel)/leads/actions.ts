"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/admin/api";
import { withToken } from "@/lib/admin/run";
import { LEAD_STATUSES, type ActionResult, type Lead, type LeadStatus } from "@/lib/admin/types";

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus,
): Promise<ActionResult<Lead>> {
  if (!LEAD_STATUSES.includes(status)) {
    return { ok: false, error: `Неизвестный статус: ${status}` };
  }

  const result = await withToken((token) =>
    apiFetch<Lead>(`/api/leads/${id}`, { method: "PUT", token, body: { status } }),
  );

  if (result.ok) revalidatePath("/admin/leads");
  return result;
}

export async function deleteLeadAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/leads/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) revalidatePath("/admin/leads");
  return result;
}
