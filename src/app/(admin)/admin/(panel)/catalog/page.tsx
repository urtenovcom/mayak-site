import type { Metadata } from "next";
import Link from "next/link";
import {
  Alert,
  Badge,
  EmptyState,
  PageHead,
  Panel,
  Thumb,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { apiFetch, toUserMessage } from "@/lib/admin/api";
import { mediaSrc } from "@/lib/admin/format";
import { requireToken } from "@/lib/admin/session";
import type { AdminProduct, Paginated } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { typo } from "@/lib/typo";
import { DeleteProduct } from "./DeleteProduct";

export const metadata: Metadata = {
  title: "Каталог",
  robots: { index: false, follow: false },
};

export default async function CatalogPage() {
  const token = await requireToken("/admin/catalog");

  let data: Paginated<AdminProduct> | null = null;
  let error: string | null = null;

  try {
    // published=all — в админке видны и черновики.
    data = await apiFetch<Paginated<AdminProduct>>("/api/products", {
      token,
      query: { published: "all", limit: 200 },
    });
  } catch (caught) {
    error = toUserMessage(caught);
  }

  return (
    <>
      <PageHead
        title="Каталог"
        description={typo("Товары сайта: карточки, комплектация и порядок вывода.")}
        actions={
          <ButtonLink href="/admin/catalog/new" className="h-10 px-5 text-[14px]">
            Добавить товар
          </ButtonLink>
        }
      />

      {error && (
        <Alert tone="error" className="mb-4" title="Не удалось загрузить каталог">
          {error}
        </Alert>
      )}

      <Panel bodyClassName="p-0">
        {data && data.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="В каталоге пусто"
              description="Добавьте первый товар — он появится в списке и на сайте."
              action={
                <ButtonLink href="/admin/catalog/new" className="h-10 px-5 text-[14px]">
                  Добавить товар
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Фото</th>
                  <th className={thClass}>Название</th>
                  <th className={thClass}>Тип</th>
                  <th className={thClass}>Эксплуатация</th>
                  <th className={thClass}>Порядок</th>
                  <th className={thClass}>Статус</th>
                  <th className={cn(thClass, "text-right")}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((product) => (
                  <tr key={product.id}>
                    <td className={tdClass}>
                      <Thumb src={mediaSrc(product.image)} alt="" className="h-12 w-16" />
                    </td>
                    <td className={tdClass}>
                      <Link
                        href={`/admin/catalog/${product.id}`}
                        className="font-bold text-ink transition hover:text-burgundy"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-ink-soft">/{product.slug}</p>
                    </td>
                    <td className={cn(tdClass, "text-[13px] text-ink-soft")}>{product.type}</td>
                    <td className={cn(tdClass, "text-[13px] text-ink-soft")}>
                      {product.exploitation}
                    </td>
                    <td className={cn(tdClass, "text-[13px] text-ink-soft")}>{product.sortOrder}</td>
                    <td className={tdClass}>
                      {product.published ? (
                        <Badge tone="success">опубликован</Badge>
                      ) : (
                        <Badge tone="muted">черновик</Badge>
                      )}
                    </td>
                    <td className={cn(tdClass, "text-right")}>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/catalog/${product.id}`}
                          className="inline-flex h-9 items-center rounded-full border border-line bg-white px-3.5 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy"
                        >
                          Изменить
                        </Link>
                        <DeleteProduct id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {data && data.items.length > 0 && (
        <p className="mt-3 text-[13px] text-ink-soft">Всего товаров: {data.pagination.total}</p>
      )}
    </>
  );
}
