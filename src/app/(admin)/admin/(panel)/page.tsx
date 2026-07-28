import { redirect } from "next/navigation";
import { ADMIN_HOME_PATH } from "@/lib/admin/config";

/** Главный экран админки — заявки. */
export default function AdminIndexPage() {
  redirect(ADMIN_HOME_PATH);
}
