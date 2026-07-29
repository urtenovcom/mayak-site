"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormBar } from "@/components/admin/FormBar";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { Field, Panel, TextArea, TextInput } from "@/components/admin/ui";
import { LINES_HINT, arrayToLines, toDateInputValue } from "@/lib/admin/format";
import type { AdminArticle } from "@/lib/admin/types";
import { toArticleBlocks } from "@/lib/blog-blocks";
import { saveArticleAction, type ArticleFormValues } from "./actions";
import { DeleteArticle } from "./DeleteArticle";
import {
  BlocksEditor,
  blockToValues,
  newBlock,
  problemsSummary,
  validateBlocks,
  type BlockProblem,
} from "./BlocksEditor";

/** Кнопка сохранения живёт в шапке, вне `<form>`, и связана с ней через `form`. */
const FORM_ID = "article-form";

const EMPTY: ArticleFormValues = {
  title: "",
  slug: "",
  description: "",
  excerpt: "",
  image: "",
  imageAlt: "",
  readingTime: "",
  publishedAt: toDateInputValue(new Date()),
  updatedAt: toDateInputValue(new Date()),
  keywords: "",
  intro: "",
  published: true,
  sortOrder: "",
  blocks: [newBlock("heading"), newBlock("text")],
};

function toValues(article: AdminArticle): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    description: article.description,
    excerpt: article.excerpt,
    image: article.image,
    imageAlt: article.imageAlt,
    readingTime: article.readingTime,
    publishedAt: toDateInputValue(article.publishedAt),
    updatedAt: toDateInputValue(article.updatedAt),
    keywords: arrayToLines(article.keywords),
    intro: arrayToLines(article.intro),
    published: article.published,
    sortOrder: String(article.sortOrder),
    // Статьи, созданные до перехода на блоки, лежат в базе старыми секциями.
    // Конвертер разворачивает их в блоки прямо при открытии формы — тот же
    // самый, что работает на публичном сайте, поэтому редактор и страница
    // показывают одно и то же.
    blocks: toArticleBlocks(article.sections).map(blockToValues),
  };
}

export function ArticleForm({ article }: { article?: AdminArticle }) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleFormValues>(
    article ? toValues(article) : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  // Проблемы блоков последней проверки: подсвечивают блоки и прокручивают к
  // первому. Ссылка на массив меняется только при отправке, поэтому редактор
  // не прокручивает форму на каждое нажатие клавиши.
  const [problems, setProblems] = useState<BlockProblem[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Незаполненный блок API отклоняет, а внешний адрес картинки роняет
    // публичную страницу — такую форму не отправляем вовсе.
    const found = validateBlocks(values.blocks);
    setProblems(found);
    if (found.length > 0) {
      setError(problemsSummary(found));
      return;
    }

    startTransition(async () => {
      const result = await saveArticleAction(article?.id ?? null, values);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (article) {
        setValues(toValues(result.data));
        setProblems([]);
        setSuccess("Сохранено. Публичная страница уже показывает новую версию.");
        router.refresh();
      } else {
        router.push(`/admin/blog/${result.data.id}`);
      }
    });
  }

  return (
    <>
      <FormBar
        formId={FORM_ID}
        backHref="/admin/blog"
        title={values.title.trim() || (article ? article.title : "Новая статья")}
        subtitle={
          article ? (
            <Link href={`/blog/${article.slug}`} target="_blank" className="hover:text-burgundy">
              /blog/{article.slug} ↗
            </Link>
          ) : (
            "Новая запись блога"
          )
        }
        published={values.published}
        publishedLabel="Опубликована"
        onPublishedChange={(next) => set("published", next)}
        submitLabel={article ? "Сохранить" : "Создать статью"}
        pending={pending}
        error={error}
        success={success}
        actions={
          article && (
            <DeleteArticle id={article.id} title={article.title} redirectTo="/admin/blog" />
          )
        }
      />

      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Panel
          title="Шапка статьи"
          description={
            article
              ? undefined
              : "Обязательные поля отмечены звёздочкой. Тело статьи собирается из блоков ниже."
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Заголовок" htmlFor="title" required className="lg:col-span-2">
              <TextInput
                id="title"
                value={values.title}
                onChange={(event) => set("title", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Slug" htmlFor="slug" hint="Часть адреса /blog/…. Пусто — из заголовка.">
              <TextInput
                id="slug"
                value={values.slug}
                onChange={(event) => set("slug", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Время чтения" htmlFor="readingTime" required hint="Например: 10 минут">
              <TextInput
                id="readingTime"
                value={values.readingTime}
                onChange={(event) => set("readingTime", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field
              label="Описание (SEO)"
              htmlFor="description"
              required
              className="lg:col-span-2"
            >
              <TextArea
                id="description"
                rows={3}
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field
              label="Краткий анонс"
              htmlFor="excerpt"
              required
              className="lg:col-span-2"
              hint="Показывается в карточке статьи в списке блога."
            >
              <TextArea
                id="excerpt"
                rows={3}
                value={values.excerpt}
                onChange={(event) => set("excerpt", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Дата публикации" htmlFor="publishedAt">
              <TextInput
                id="publishedAt"
                type="date"
                value={values.publishedAt}
                onChange={(event) => set("publishedAt", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Дата обновления" htmlFor="updatedAt">
              <TextInput
                id="updatedAt"
                type="date"
                value={values.updatedAt}
                onChange={(event) => set("updatedAt", event.target.value)}
                disabled={pending}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Обложка">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Изображение" htmlFor="image" required>
              <ImagePicker
                id="image"
                value={values.image}
                onChange={(value) => set("image", value)}
                disabled={pending}
              />
            </Field>

            <Field label="Alt изображения" htmlFor="imageAlt" required>
              <TextInput
                id="imageAlt"
                value={values.imageAlt}
                onChange={(event) => set("imageAlt", event.target.value)}
                disabled={pending}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Вступление и ключевые слова" description={LINES_HINT}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Вступление" htmlFor="intro" hint="По одному абзацу на строку.">
              <TextArea
                id="intro"
                rows={6}
                value={values.intro}
                onChange={(event) => set("intro", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Ключевые слова" htmlFor="keywords" hint={LINES_HINT}>
              <TextArea
                id="keywords"
                rows={6}
                value={values.keywords}
                onChange={(event) => set("keywords", event.target.value)}
                disabled={pending}
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="Тело статьи"
          description="Блоки: заголовок, текст, список, таблица, цитата, изображение, галерея, видео, файл, аккордеон. Порядок меняется стрелками."
        >
          <BlocksEditor
            blocks={values.blocks}
            onChange={(blocks) => set("blocks", blocks)}
            disabled={pending}
            problems={problems}
          />
        </Panel>

        {/* Публикация переехала в закреплённую шапку формы — здесь остальное. */}
        <Panel title="Порядок">
          <Field label="Порядок" htmlFor="sortOrder" hint="Меньше — выше в списке.">
            <TextInput
              id="sortOrder"
              inputMode="numeric"
              className="w-32"
              value={values.sortOrder}
              onChange={(event) => set("sortOrder", event.target.value)}
              disabled={pending}
            />
          </Field>
        </Panel>
      </form>
    </>
  );
}
