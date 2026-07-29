"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useId, useRef, useState } from "react";
import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  Checkbox,
  Field,
  SelectInput,
  TextArea,
  TextInput,
  controlClass,
} from "@/components/admin/ui";
import {
  Accordion,
  Document,
  Gallery,
  Heading,
  List,
  Paragraph,
  Picture,
  Quote,
  Table,
  Video,
} from "@/components/icons";
import { LINES_HINT } from "@/lib/admin/format";
import {
  ANCHOR_PATTERN,
  ARTICLE_BLOCK_LABELS,
  ARTICLE_BLOCK_TYPES,
  headingLevel,
  isLocalImagePath,
  slugifyAnchor,
  type ArticleBlock,
  type ArticleBlockType,
} from "@/lib/blog-blocks";
import { cn } from "@/lib/cn";
import type {
  AccordionBlockValues,
  ArticleBlockValues,
  FileBlockValues,
  GalleryBlockValues,
  HeadingBlockValues,
  ImageBlockValues,
  ListBlockValues,
  QuoteBlockValues,
  TableBlockValues,
  TextBlockValues,
  VideoBlockValues,
} from "./actions";

const smallButton =
  "inline-flex h-8 items-center justify-center rounded-full border border-line bg-white px-3 text-[12px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-40";

const dangerButton =
  "inline-flex h-8 items-center justify-center rounded-full border border-burgundy/25 bg-white px-3 text-[12px] font-bold text-burgundy transition hover:bg-burgundy hover:text-white disabled:opacity-40";

type IconComponent = React.ComponentType<{ className?: string }>;

/**
 * Иконка и пояснение к типу блока для меню «+ Добавить блок».
 * Названия типов берутся из ARTICLE_BLOCK_LABELS — там же, откуда их берут
 * русские сообщения об ошибках API.
 */
const BLOCK_TYPE_META: Record<ArticleBlockType, { hint: string; Icon: IconComponent }> = {
  heading: { hint: "Раздел (H2) или подзаголовок (H3) внутри раздела.", Icon: Heading },
  text: { hint: "Абзацы основного текста.", Icon: Paragraph },
  list: { hint: "Маркированный или нумерованный.", Icon: List },
  table: { hint: "Заголовки столбцов и строки.", Icon: Table },
  quote: { hint: "Выделенная реплика с автором.", Icon: Quote },
  image: { hint: "Одна картинка с подписью.", Icon: Picture },
  gallery: { hint: "Несколько картинок сеткой.", Icon: Gallery },
  video: { hint: "Плеер с постером и подписью.", Icon: Video },
  file: { hint: "Ссылка на документ для скачивания.", Icon: Document },
  accordion: { hint: "Раскрывающиеся вопросы и ответы.", Icon: Accordion },
};

/** Подпись под полем выбора картинки: почему нельзя вставить чужой адрес. */
const LOCAL_IMAGE_HINT =
  "Только файл с этого сайта: выберите из медиатеки или загрузите. Ссылку на чужой сайт вставлять нельзя — такая картинка не отобразится.";

/** Уникальный ключ/идентификатор: столкновений в пределах статьи не бывает. */
function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Пустой блок выбранного типа. `id` выдаётся сразу — API требует его всегда. */
export function newBlock(type: ArticleBlockType): ArticleBlockValues {
  const base = { key: uid("k"), id: uid(type) };

  switch (type) {
    case "heading":
      // Якорь соберётся из текста заголовка, как только его начнут вводить.
      return { ...base, id: uid("razdel"), type, text: "", level: 2, autoId: true };
    case "text":
      return { ...base, type, paragraphs: "" };
    case "list":
      return { ...base, type, items: "", ordered: false };
    case "table":
      return { ...base, type, headers: [], rows: [], caption: "" };
    case "quote":
      return { ...base, type, text: "", author: "" };
    case "image":
      return { ...base, type, src: "", alt: "", caption: "" };
    case "gallery":
      return { ...base, type, images: [{ key: uid("img"), src: "", alt: "" }] };
    case "video":
      return { ...base, type, src: "", poster: "", caption: "" };
    case "file":
      return { ...base, type, url: "", title: "" };
    case "accordion":
      return { ...base, type, items: [{ key: uid("qa"), question: "", answer: "" }] };
  }
}

/** Блок из API (уже приведённый конвертером) → значения формы. */
export function blockToValues(block: ArticleBlock, index: number): ArticleBlockValues {
  const base = { key: `${block.id}-${index}`, id: block.id };

  switch (block.type) {
    case "heading":
      // autoId: false — у сохранённого заголовка якорь уже опубликован.
      return {
        ...base,
        type: "heading",
        text: block.text,
        level: headingLevel(block),
        autoId: false,
      };
    case "text":
      return { ...base, type: "text", paragraphs: block.paragraphs.join("\n") };
    case "list":
      return {
        ...base,
        type: "list",
        items: block.items.join("\n"),
        ordered: block.ordered === true,
      };
    case "table": {
      // Ширина — по самой длинной строке: если в базе когда-то потерялась
      // ячейка, в редакторе строка всё равно встанет по своим столбцам.
      const width = Math.max(block.headers.length, ...block.rows.map((row) => row.length), 0);
      return {
        ...base,
        type: "table",
        headers: Array.from({ length: width }, (_, i) => block.headers[i] ?? ""),
        rows: block.rows.map((row) => Array.from({ length: width }, (_, i) => row[i] ?? "")),
        caption: block.caption ?? "",
      };
    }
    case "quote":
      return { ...base, type: "quote", text: block.text, author: block.author ?? "" };
    case "image":
      return {
        ...base,
        type: "image",
        src: block.src,
        alt: block.alt,
        caption: block.caption ?? "",
      };
    case "gallery":
      return {
        ...base,
        type: "gallery",
        images: block.images.map((image, i) => ({
          key: `${block.id}-img-${i}`,
          src: image.src,
          alt: image.alt,
        })),
      };
    case "video":
      return {
        ...base,
        type: "video",
        src: block.src,
        poster: block.poster ?? "",
        caption: block.caption ?? "",
      };
    case "file":
      return { ...base, type: "file", url: block.url, title: block.title };
    case "accordion":
      return {
        ...base,
        type: "accordion",
        items: block.items.map((item, i) => ({
          key: `${block.id}-qa-${i}`,
          question: item.question,
          answer: item.answer,
        })),
      };
  }
}

// ---------------------------------------------------------------------------
// Проверка перед отправкой
// ---------------------------------------------------------------------------

/** Заголовки таблицы так, как их увидит API: хвостовые пустые он отбрасывает. */
function effectiveHeaders(headers: string[]): string[] {
  const trimmed = headers.map((header) => header.trim());
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === "") trimmed.pop();
  return trimmed;
}

/** Строки, в которых есть хоть одно непустое значение, — только они уходят на API. */
function filledRows(rows: string[][]): string[][] {
  return rows.filter((row) => row.some((cell) => cell.trim() !== ""));
}

function lines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Внешний адрес картинки.
 *
 * `next/image` на чужом хосте не рисует картинку, а бросает исключение и
 * роняет всю страницу статьи, поэтому такой путь не должен попадать в базу.
 */
const EXTERNAL_IMAGE_PROBLEM =
  "путь должен начинаться с «/» и вести на файл этого сайта. Ссылку на чужой сайт использовать нельзя — загрузите картинку в медиатеку";

/** Найденная проблема блока: ключ для подсветки, номер и текст для человека. */
export type BlockProblem = { key: string; index: number; message: string };

/** Первая незаполненная обязательная часть блока, по-русски. */
function blockProblem(block: ArticleBlockValues): string | null {
  const id = block.id.trim();
  if (!id) return "не заполнен идентификатор блока";

  switch (block.type) {
    case "heading":
      if (!block.text.trim()) return "не заполнен текст заголовка";
      return ANCHOR_PATTERN.test(id)
        ? null
        : "в якоре допустимы только строчные латинские буквы, цифры и дефис — пробелы и кириллица в адресе раздела не работают";
    case "text":
      return lines(block.paragraphs).length > 0 ? null : "не заполнен ни один абзац";
    case "list":
      return lines(block.items).length > 0 ? null : "не заполнен ни один пункт";
    case "table":
      return effectiveHeaders(block.headers).length > 0
        ? null
        : filledRows(block.rows).length > 0
          ? "заполнены строки, но не заполнен ни один заголовок столбца"
          : "не заполнен ни один заголовок столбца";
    case "quote":
      return block.text.trim() ? null : "не заполнен текст цитаты";
    case "image":
      if (!block.src.trim()) return "не выбрано изображение";
      if (!isLocalImagePath(block.src)) return EXTERNAL_IMAGE_PROBLEM;
      return block.alt.trim() ? null : "не заполнен alt изображения";
    case "gallery":
      if (block.images.length === 0) return "не добавлено ни одного изображения";
      if (block.images.some((image) => image.src.trim() && !isLocalImagePath(image.src))) {
        return EXTERNAL_IMAGE_PROBLEM;
      }
      return block.images.every((image) => image.src.trim() && image.alt.trim())
        ? null
        : "у каждого изображения галереи нужны и файл, и alt";
    case "video":
      if (!block.src.trim()) return "не указана ссылка на видео";
      return !block.poster.trim() || isLocalImagePath(block.poster)
        ? null
        : `постер: ${EXTERNAL_IMAGE_PROBLEM}`;
    case "file":
      if (!block.url.trim()) return "не указана ссылка на файл";
      return block.title.trim() ? null : "не заполнено название файла";
    case "accordion":
      if (block.items.length === 0) return "не добавлено ни одного вопроса";
      return block.items.every((item) => item.question.trim() && item.answer.trim())
        ? null
        : "у каждого пункта аккордеона нужны и вопрос, и ответ";
  }
}

/**
 * Проверка блоков перед отправкой формы.
 *
 * Собираем ВСЕ проблемы разом: править форму на восемь экранов по одной
 * ошибке за отправку — мучение. Ловим ровно то, что отклонит API, плюс
 * внешние адреса картинок (их API примет, а страница на них падает).
 */
export function validateBlocks(blocks: ArticleBlockValues[]): BlockProblem[] {
  const problems: BlockProblem[] = [];

  blocks.forEach((block, index) => {
    const problem = blockProblem(block);
    if (problem) {
      problems.push({
        key: block.key,
        index,
        message: `Блок ${index + 1} «${ARTICLE_BLOCK_LABELS[block.type]}»: ${problem}.`,
      });
    }
  });

  const seen = new Map<string, number>();
  blocks.forEach((block, index) => {
    const id = block.id.trim();
    if (!id) return;
    const first = seen.get(id);
    if (first === undefined) {
      seen.set(id, index);
      return;
    }
    problems.push({
      key: block.key,
      index,
      message: `Блоки ${first + 1} и ${index + 1} используют один идентификатор «${id}» — он должен быть уникальным в пределах статьи.`,
    });
  });

  return problems.sort((a, b) => a.index - b.index);
}

/** Сводка для шапки формы: первая ошибка и сколько ещё осталось. */
export function problemsSummary(problems: BlockProblem[]): string {
  if (problems.length === 0) return "";
  if (problems.length === 1) return problems[0].message;
  return `${problems[0].message} Ещё проблем в других блоках: ${problems.length - 1}.`;
}

// ---------------------------------------------------------------------------
// Редактор
// ---------------------------------------------------------------------------

export function BlocksEditor({
  blocks,
  onChange,
  disabled,
  problems = [],
}: {
  blocks: ArticleBlockValues[];
  onChange: (blocks: ArticleBlockValues[]) => void;
  disabled?: boolean;
  /** Проблемы последней проверки: подсвечиваем блоки и прокручиваем к первому. */
  problems?: BlockProblem[];
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // Куда вернуть фокус после перестановки/вставки. Без этого кнопка «Выше» у
  // блока, доехавшего до начала, становится disabled — и фокус улетает в body.
  //
  // Запрос лежит в ref, а эффект будит счётчик: если хранить запрос в
  // состоянии и обнулять его внутри эффекта, эффект перезапускается и его
  // же cleanup отменяет ещё не сработавший requestAnimationFrame.
  const focusRequest = useRef<{ key: string; what: "up" | "down" | "field" } | null>(null);
  const [focusTick, setFocusTick] = useState(0);

  function requestFocus(key: string, what: "up" | "down" | "field") {
    focusRequest.current = { key, what };
    setFocusTick((tick) => tick + 1);
  }

  useEffect(() => {
    const request = focusRequest.current;
    if (!request || !listRef.current) return;
    const list = listRef.current;
    focusRequest.current = null;

    // Кадр отсрочки: меню типов — это Radix Dialog, и при закрытии он
    // возвращает фокус на свою кнопку. Без отсрочки он перебивал бы нашу
    // установку фокуса, и пользователь оставался бы на точке вставки.
    const frame = requestAnimationFrame(() => {
      const fieldset = list.querySelector<HTMLElement>(
        `[data-block-key="${CSS.escape(request.key)}"]`,
      );
      if (!fieldset) return;

      if (request.what === "field") {
        fieldset.scrollIntoView({ block: "center", behavior: "smooth" });
        // Именно поле ввода, а не первая кнопка: кнопки перестановки стоят в
        // разметке выше полей, и фокус на них человеку сейчас не нужен.
        const field = fieldset.querySelector<HTMLElement>("input:not([type=checkbox]), textarea");
        (field ?? fieldset.querySelector<HTMLElement>("button"))?.focus();
        return;
      }

      const wanted = fieldset.querySelector<HTMLButtonElement>(`[data-move="${request.what}"]`);
      const fallback = fieldset.querySelector<HTMLButtonElement>(
        `[data-move="${request.what === "up" ? "down" : "up"}"]`,
      );
      (wanted && !wanted.disabled ? wanted : fallback)?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [focusTick]);

  // Прокрутка к первому проблемному блоку — только при новой проверке
  // (массив problems приезжает из состояния формы и меняется по ссылке
  // ровно при отправке, а не на каждое нажатие клавиши).
  useEffect(() => {
    if (problems.length === 0 || !listRef.current) return;
    const fieldset = listRef.current.querySelector<HTMLElement>(
      `[data-block-key="${CSS.escape(problems[0].key)}"]`,
    );
    fieldset?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [problems]);

  const problemByKey = new Map(problems.map((problem) => [problem.key, problem.message]));

  function replace(index: number, next: ArticleBlockValues) {
    onChange(blocks.map((item, i) => (i === index ? next : item)));
  }

  function insert(index: number, type: ArticleBlockType) {
    const block = newBlock(type);
    const next = [...blocks];
    next.splice(index, 0, block);
    onChange(next);
    requestFocus(block.key, "field");
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    requestFocus(blocks[index].key, delta < 0 ? "up" : "down");
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  /**
   * Якорь из текста заголовка: транслитерация плюс числовой суффикс, если
   * такой якорь в статье уже занят.
   */
  function uniqueAnchor(text: string, ownKey: string): string {
    const taken = new Set(
      blocks.filter((block) => block.key !== ownKey).map((block) => block.id.trim()),
    );
    const root = slugifyAnchor(text);
    if (!taken.has(root)) return root;

    let suffix = 2;
    while (taken.has(`${root}-${suffix}`)) suffix += 1;
    return `${root}-${suffix}`;
  }

  return (
    <div className="flex flex-col" ref={listRef}>
      {blocks.length === 0 && (
        <p className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center text-[13px] text-ink-soft">
          Блоков пока нет. Добавьте первый — из них состоит тело статьи.
        </p>
      )}

      {blocks.map((block, index) => {
        const meta = BLOCK_TYPE_META[block.type];
        // У заголовка в шапке блока виден уровень: иначе раздел и
        // подзаголовок в свёрнутом виде неразличимы.
        const label =
          block.type === "heading" && block.level === 3
            ? `${ARTICLE_BLOCK_LABELS.heading} (H3)`
            : ARTICLE_BLOCK_LABELS[block.type];
        const problem = problemByKey.get(block.key);

        return (
          <div key={block.key}>
            <Inserter
              onAdd={(type) => insert(index, type)}
              disabled={disabled}
              position={`перед блоком ${index + 1}`}
            />

            <fieldset
              data-block-key={block.key}
              className={cn(
                "scroll-mt-24 rounded-brand-sm border p-3.5",
                problem
                  ? "border-burgundy/50 bg-burgundy/[0.03]"
                  : "border-line bg-warm-bg/40",
              )}
              disabled={disabled}
            >
              <legend className="sr-only">
                Блок {index + 1}: {label}
              </legend>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  <meta.Icon className="h-4 text-burgundy" />
                  {index + 1}. {label}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    data-move="up"
                    className={smallButton}
                    onClick={() => move(index, -1)}
                    disabled={disabled || index === 0}
                    aria-label={`Переместить блок ${index + 1} выше`}
                  >
                    ↑ Выше
                  </button>
                  <button
                    type="button"
                    data-move="down"
                    className={smallButton}
                    onClick={() => move(index, 1)}
                    disabled={disabled || index === blocks.length - 1}
                    aria-label={`Переместить блок ${index + 1} ниже`}
                  >
                    ↓ Ниже
                  </button>
                  <ConfirmButton
                    triggerLabel="Удалить"
                    triggerClassName={dangerButton}
                    disabled={disabled}
                    title={`Удалить блок «${index + 1}. ${label}»?`}
                    description="Блок исчезнет из формы. Статья изменится на сайте после сохранения."
                    confirmLabel="Удалить блок"
                    onConfirm={() => remove(index)}
                  />
                </div>
              </div>

              {problem && (
                <p
                  role="alert"
                  className="mb-3 rounded-brand-sm border border-burgundy/30 bg-burgundy/5 px-3 py-2 text-[12px] font-semibold leading-snug text-burgundy"
                >
                  {problem}
                </p>
              )}

              <BlockFields
                block={block}
                disabled={disabled}
                invalid={Boolean(problem)}
                makeAnchor={uniqueAnchor}
                onChange={(next) => replace(index, next)}
              />
            </fieldset>
          </div>
        );
      })}

      <Inserter
        onAdd={(type) => insert(blocks.length, type)}
        disabled={disabled}
        position="в конец статьи"
        prominent
      />
    </div>
  );
}

/**
 * Точка вставки блока.
 *
 * Между блоками их столько же, сколько блоков, поэтому вид приглушённый:
 * тонкая линия с «+», которая проявляется при наведении и при фокусе с
 * клавиатуры. Кнопка обычная — Tab и Enter работают без доработок, на узком
 * экране она растягивается на всю ширину и ничего не ломает.
 */
function Inserter({
  onAdd,
  disabled,
  position,
  prominent,
}: {
  onAdd: (type: ArticleBlockType) => void;
  disabled?: boolean;
  position: string;
  prominent?: boolean;
}) {
  if (prominent) {
    return (
      <div className="pt-3">
        <AddBlockMenu
          onAdd={onAdd}
          disabled={disabled}
          position={position}
          trigger={
            <span className="inline-flex h-9 items-center rounded-full border border-burgundy/35 bg-white px-4 text-[13px] font-bold text-burgundy transition hover:bg-warm">
              + Добавить блок
            </span>
          }
        />
      </div>
    );
  }

  return (
    <AddBlockMenu
      onAdd={onAdd}
      disabled={disabled}
      position={position}
      className="group flex w-full items-center gap-2 py-1.5 text-left"
      trigger={
        <>
          <span className="h-px flex-1 bg-line transition group-hover:bg-burgundy/40 group-focus-visible:bg-burgundy/40" />
          <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-bold text-ink-soft/70 transition group-hover:border-burgundy/40 group-hover:text-burgundy group-focus-visible:border-burgundy group-focus-visible:text-burgundy">
            + Блок сюда
          </span>
          <span className="h-px flex-1 bg-line transition group-hover:bg-burgundy/40 group-focus-visible:bg-burgundy/40" />
        </>
      }
    />
  );
}

/** Меню типов блока: иконка, название и короткое пояснение. */
function AddBlockMenu({
  onAdd,
  disabled,
  position,
  trigger,
  className,
}: {
  onAdd: (type: ArticleBlockType) => void;
  disabled?: boolean;
  position: string;
  trigger: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Тип выбран — фокус уводит редактор (в поля нового блока), и возвращать
  // его на кнопку не нужно. Если меню просто закрыли, фокус возвращается
  // на кнопку штатно, как и ждёт клавиатурный пользователь.
  const picked = useRef(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={className}
        disabled={disabled}
        aria-label={`Добавить блок ${position}`}
      >
        {trigger}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-carbon/40 backdrop-blur-[2px]" />
        <Dialog.Content
          className="anim-modal fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(680px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-brand-sm border border-line bg-white shadow-float"
          onCloseAutoFocus={(event) => {
            if (picked.current) event.preventDefault();
            picked.current = false;
          }}
        >
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <Dialog.Title className="text-[16px] font-extrabold tracking-tight text-ink">
                Тип блока
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-[13px] text-ink-soft">
                Блок добавится {position}.
              </Dialog.Description>
            </div>
            <Dialog.Close className="text-[13px] font-bold text-ink-soft transition hover:text-burgundy">
              Закрыть
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <ul className="grid gap-2 sm:grid-cols-2">
              {ARTICLE_BLOCK_TYPES.map((type) => {
                const meta = BLOCK_TYPE_META[type];
                return (
                  <li key={type}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 rounded-brand-sm border border-line bg-white p-3 text-left transition hover:border-burgundy/50 hover:bg-warm-bg/60"
                      onClick={() => {
                        picked.current = true;
                        onAdd(type);
                        setOpen(false);
                      }}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-soft text-burgundy">
                        <meta.Icon className="h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-bold text-ink">
                          {ARTICLE_BLOCK_LABELS[type]}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-ink-soft">
                          {meta.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Разрушительное действие внутри формы — только после подтверждения.
 *
 * Общий `ConfirmDelete` здесь не подходит: он рассчитан на серверный экшен и
 * возвращает `ActionResult`, а блоки, столбцы и строки удаляются в состоянии
 * формы и уезжают на сервер вместе со всей статьёй.
 */
function ConfirmButton({
  triggerLabel,
  triggerClassName,
  triggerTitle,
  title,
  description,
  confirmLabel,
  disabled,
  onConfirm,
}: {
  triggerLabel: React.ReactNode;
  triggerClassName: string;
  triggerTitle?: string;
  title: string;
  description: string;
  confirmLabel: string;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={triggerClassName} disabled={disabled} title={triggerTitle}>
        {triggerLabel}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-carbon/40 backdrop-blur-[2px]" />
        <Dialog.Content className="anim-modal fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-brand-sm border border-line bg-white p-5 shadow-float">
          <Dialog.Title className="text-[17px] font-extrabold tracking-tight text-ink">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            {description}
          </Dialog.Description>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:bg-warm-soft">
              Отмена
            </Dialog.Close>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              className="inline-flex h-10 items-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800"
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Поля конкретных блоков
// ---------------------------------------------------------------------------

type FieldsProps<T extends ArticleBlockValues> = {
  block: T;
  disabled?: boolean;
  onChange: (block: ArticleBlockValues) => void;
};

function BlockFields({
  block,
  disabled,
  invalid,
  makeAnchor,
  onChange,
}: {
  block: ArticleBlockValues;
  disabled?: boolean;
  /** Блок не прошёл проверку — таблица показывает подсказку прямо у сетки. */
  invalid: boolean;
  makeAnchor: (text: string, ownKey: string) => string;
  onChange: (block: ArticleBlockValues) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <HeadingFields
          block={block}
          disabled={disabled}
          makeAnchor={makeAnchor}
          onChange={onChange}
        />
      );
    case "text":
      return <TextFields block={block} disabled={disabled} onChange={onChange} />;
    case "list":
      return <ListFields block={block} disabled={disabled} onChange={onChange} />;
    case "table":
      return <TableFields block={block} disabled={disabled} invalid={invalid} onChange={onChange} />;
    case "quote":
      return <QuoteFields block={block} disabled={disabled} onChange={onChange} />;
    case "image":
      return <ImageFields block={block} disabled={disabled} onChange={onChange} />;
    case "gallery":
      return <GalleryFields block={block} disabled={disabled} onChange={onChange} />;
    case "video":
      return <VideoFields block={block} disabled={disabled} onChange={onChange} />;
    case "file":
      return <FileFields block={block} disabled={disabled} onChange={onChange} />;
    case "accordion":
      return <AccordionFields block={block} disabled={disabled} onChange={onChange} />;
  }
}

/** Поля блока в две колонки — как в остальных формах панели. */
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 lg:grid-cols-2">{children}</div>;
}

function HeadingFields({
  block,
  disabled,
  makeAnchor,
  onChange,
}: FieldsProps<HeadingBlockValues> & {
  makeAnchor: (text: string, ownKey: string) => string;
}) {
  const uidPrefix = useId();

  return (
    <Grid>
      <Field label="Текст заголовка" htmlFor={`${uidPrefix}-text`} required>
        <TextInput
          id={`${uidPrefix}-text`}
          value={block.text}
          disabled={disabled}
          onChange={(event) => {
            const text = event.target.value;
            onChange({
              ...block,
              text,
              // Пока якорь не трогали руками и блок не сохранён, он едет
              // следом за заголовком; после сохранения — замирает.
              id: block.autoId ? makeAnchor(text, block.key) : block.id,
            });
          }}
        />
      </Field>

      <Field
        label="Уровень"
        htmlFor={`${uidPrefix}-level`}
        hint="Раздел — крупный заголовок и пункт оглавления. Подзаголовок делит раздел на части и в оглавлении показывается вложенным. Уровни глубже не используются."
      >
        <SelectInput
          id={`${uidPrefix}-level`}
          value={String(block.level)}
          disabled={disabled}
          onChange={(event) => onChange({ ...block, level: event.target.value === "3" ? 3 : 2 })}
        >
          <option value="2">Раздел (H2)</option>
          <option value="3">Подзаголовок (H3)</option>
        </SelectInput>
      </Field>

      <Field
        label="Якорь (id)"
        htmlFor={`${uidPrefix}-id`}
        required
        className="lg:col-span-2"
        hint="Адрес раздела после # и пункт оглавления. Собирается из заголовка латиницей; менять у опубликованной статьи не стоит — сломаются ссылки."
      >
        <TextInput
          id={`${uidPrefix}-id`}
          value={block.id}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...block, id: event.target.value.trim(), autoId: false })
          }
        />
      </Field>
    </Grid>
  );
}

function TextFields({ block, disabled, onChange }: FieldsProps<TextBlockValues>) {
  const uidPrefix = useId();

  return (
    <Field label="Абзацы" htmlFor={`${uidPrefix}-paragraphs`} required hint="По одному абзацу на строку.">
      <TextArea
        id={`${uidPrefix}-paragraphs`}
        rows={5}
        value={block.paragraphs}
        disabled={disabled}
        onChange={(event) => onChange({ ...block, paragraphs: event.target.value })}
      />
    </Field>
  );
}

function ListFields({ block, disabled, onChange }: FieldsProps<ListBlockValues>) {
  const uidPrefix = useId();

  return (
    <div className="flex flex-col gap-3">
      <Field label="Пункты" htmlFor={`${uidPrefix}-items`} required hint={LINES_HINT}>
        <TextArea
          id={`${uidPrefix}-items`}
          rows={4}
          value={block.items}
          disabled={disabled}
          onChange={(event) => onChange({ ...block, items: event.target.value })}
        />
      </Field>

      <Checkbox
        label="Нумерованный список"
        checked={block.ordered}
        disabled={disabled}
        onChange={(event) => onChange({ ...block, ordered: event.target.checked })}
      />
    </div>
  );
}

function QuoteFields({ block, disabled, onChange }: FieldsProps<QuoteBlockValues>) {
  const uidPrefix = useId();

  return (
    <Grid>
      <Field label="Текст цитаты" htmlFor={`${uidPrefix}-text`} required className="lg:col-span-2">
        <TextArea
          id={`${uidPrefix}-text`}
          rows={3}
          value={block.text}
          disabled={disabled}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
        />
      </Field>

      <Field label="Автор" htmlFor={`${uidPrefix}-author`} hint="Необязательно: имя и должность.">
        <TextInput
          id={`${uidPrefix}-author`}
          value={block.author}
          disabled={disabled}
          onChange={(event) => onChange({ ...block, author: event.target.value })}
        />
      </Field>
    </Grid>
  );
}

function ImageFields({ block, disabled, onChange }: FieldsProps<ImageBlockValues>) {
  const uidPrefix = useId();

  return (
    <Grid>
      <Field label="Изображение" htmlFor={`${uidPrefix}-src`} required hint={LOCAL_IMAGE_HINT}>
        <ImagePicker
          id={`${uidPrefix}-src`}
          value={block.src}
          disabled={disabled}
          onChange={(value) => onChange({ ...block, src: value })}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <Field
          label="Alt изображения"
          htmlFor={`${uidPrefix}-alt`}
          required
          hint="Что изображено — для поиска и скринридеров."
        >
          <TextInput
            id={`${uidPrefix}-alt`}
            value={block.alt}
            disabled={disabled}
            onChange={(event) => onChange({ ...block, alt: event.target.value })}
          />
        </Field>

        <Field label="Подпись" htmlFor={`${uidPrefix}-caption`} hint="Необязательно: текст под картинкой.">
          <TextInput
            id={`${uidPrefix}-caption`}
            value={block.caption}
            disabled={disabled}
            onChange={(event) => onChange({ ...block, caption: event.target.value })}
          />
        </Field>
      </div>
    </Grid>
  );
}

function GalleryFields({ block, disabled, onChange }: FieldsProps<GalleryBlockValues>) {
  const uidPrefix = useId();

  function update(index: number, patch: Partial<GalleryBlockValues["images"][number]>) {
    onChange({
      ...block,
      images: block.images.map((image, i) => (i === index ? { ...image, ...patch } : image)),
    });
  }

  function swap(index: number, delta: number) {
    const images = [...block.images];
    [images[index], images[index + delta]] = [images[index + delta], images[index]];
    onChange({ ...block, images });
  }

  return (
    <div className="flex flex-col gap-3">
      {block.images.map((image, index) => (
        <div key={image.key} className="rounded-brand-sm border border-line bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Изображение {index + 1}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                className={smallButton}
                disabled={disabled || index === 0}
                aria-label={`Переместить изображение ${index + 1} выше`}
                onClick={() => swap(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={smallButton}
                disabled={disabled || index === block.images.length - 1}
                aria-label={`Переместить изображение ${index + 1} ниже`}
                onClick={() => swap(index, 1)}
              >
                ↓
              </button>
              <RemoveNested
                label={`изображение ${index + 1}`}
                empty={!image.src.trim() && !image.alt.trim()}
                disabled={disabled || block.images.length === 1}
                onConfirm={() =>
                  onChange({ ...block, images: block.images.filter((_, i) => i !== index) })
                }
              />
            </div>
          </div>

          <Grid>
            <Field
              label="Файл"
              htmlFor={`${uidPrefix}-${image.key}-src`}
              required
              hint={LOCAL_IMAGE_HINT}
            >
              <ImagePicker
                id={`${uidPrefix}-${image.key}-src`}
                value={image.src}
                disabled={disabled}
                onChange={(value) => update(index, { src: value })}
              />
            </Field>

            <Field label="Alt" htmlFor={`${uidPrefix}-${image.key}-alt`} required>
              <TextInput
                id={`${uidPrefix}-${image.key}-alt`}
                value={image.alt}
                disabled={disabled}
                onChange={(event) => update(index, { alt: event.target.value })}
              />
            </Field>
          </Grid>
        </div>
      ))}

      <div>
        <button
          type="button"
          className={smallButton}
          disabled={disabled}
          onClick={() =>
            onChange({ ...block, images: [...block.images, { key: uid("img"), src: "", alt: "" }] })
          }
        >
          + Изображение
        </button>
      </div>
    </div>
  );
}

function VideoFields({ block, disabled, onChange }: FieldsProps<VideoBlockValues>) {
  const uidPrefix = useId();

  return (
    <Grid>
      <Field
        label="Ссылка на видео"
        htmlFor={`${uidPrefix}-src`}
        required
        className="lg:col-span-2"
        // Медиатека принимает только растровые изображения (SVG и прочее
        // запрещены намеренно), поэтому файл видео сюда не загрузить —
        // остаётся указать путь к уже выложенному файлу.
        hint="Медиатека принимает только изображения. Видео выкладывается отдельно — укажите путь, например /video/montazh.mp4, или полный адрес."
      >
        <TextInput
          id={`${uidPrefix}-src`}
          value={block.src}
          disabled={disabled}
          placeholder="/video/файл.mp4"
          onChange={(event) => onChange({ ...block, src: event.target.value })}
        />
      </Field>

      <Field label="Постер" htmlFor={`${uidPrefix}-poster`} hint={`Кадр до запуска, необязательно. ${LOCAL_IMAGE_HINT}`}>
        <ImagePicker
          id={`${uidPrefix}-poster`}
          value={block.poster}
          disabled={disabled}
          onChange={(value) => onChange({ ...block, poster: value })}
        />
      </Field>

      <Field label="Подпись" htmlFor={`${uidPrefix}-caption`} hint="Необязательно.">
        <TextInput
          id={`${uidPrefix}-caption`}
          value={block.caption}
          disabled={disabled}
          onChange={(event) => onChange({ ...block, caption: event.target.value })}
        />
      </Field>
    </Grid>
  );
}

function FileFields({ block, disabled, onChange }: FieldsProps<FileBlockValues>) {
  const uidPrefix = useId();

  return (
    <Grid>
      <Field
        label="Ссылка на файл"
        htmlFor={`${uidPrefix}-url`}
        required
        // То же ограничение, что и у видео: документ через медиатеку не
        // загрузить, API принимает только растровые изображения.
        hint="Медиатека принимает только изображения. Документ выкладывается отдельно — укажите путь, например /certs/sertifikat.pdf, или полный адрес."
      >
        <TextInput
          id={`${uidPrefix}-url`}
          value={block.url}
          disabled={disabled}
          placeholder="/certs/файл.pdf"
          onChange={(event) => onChange({ ...block, url: event.target.value })}
        />
      </Field>

      <Field
        label="Название"
        htmlFor={`${uidPrefix}-title`}
        required
        hint="Текст ссылки на странице статьи."
      >
        <TextInput
          id={`${uidPrefix}-title`}
          value={block.title}
          disabled={disabled}
          onChange={(event) => onChange({ ...block, title: event.target.value })}
        />
      </Field>
    </Grid>
  );
}

function AccordionFields({ block, disabled, onChange }: FieldsProps<AccordionBlockValues>) {
  const uidPrefix = useId();

  function update(index: number, patch: Partial<AccordionBlockValues["items"][number]>) {
    onChange({
      ...block,
      items: block.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  function swap(index: number, delta: number) {
    const items = [...block.items];
    [items[index], items[index + delta]] = [items[index + delta], items[index]];
    onChange({ ...block, items });
  }

  return (
    <div className="flex flex-col gap-3">
      {block.items.map((item, index) => (
        <div key={item.key} className="rounded-brand-sm border border-line bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Вопрос {index + 1}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                className={smallButton}
                disabled={disabled || index === 0}
                aria-label={`Переместить вопрос ${index + 1} выше`}
                onClick={() => swap(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={smallButton}
                disabled={disabled || index === block.items.length - 1}
                aria-label={`Переместить вопрос ${index + 1} ниже`}
                onClick={() => swap(index, 1)}
              >
                ↓
              </button>
              <RemoveNested
                label={`вопрос ${index + 1}`}
                empty={!item.question.trim() && !item.answer.trim()}
                disabled={disabled || block.items.length === 1}
                onConfirm={() =>
                  onChange({ ...block, items: block.items.filter((_, i) => i !== index) })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Field label="Вопрос" htmlFor={`${uidPrefix}-${item.key}-q`} required>
              <TextInput
                id={`${uidPrefix}-${item.key}-q`}
                value={item.question}
                disabled={disabled}
                onChange={(event) => update(index, { question: event.target.value })}
              />
            </Field>

            <Field label="Ответ" htmlFor={`${uidPrefix}-${item.key}-a`} required>
              <TextArea
                id={`${uidPrefix}-${item.key}-a`}
                rows={3}
                value={item.answer}
                disabled={disabled}
                onChange={(event) => update(index, { answer: event.target.value })}
              />
            </Field>
          </div>
        </div>
      ))}

      <div>
        <button
          type="button"
          className={smallButton}
          disabled={disabled}
          onClick={() =>
            onChange({
              ...block,
              items: [...block.items, { key: uid("qa"), question: "", answer: "" }],
            })
          }
        >
          + Вопрос
        </button>
      </div>
    </div>
  );
}

/**
 * Удаление вложенного элемента (картинки галереи, пункта аккордеона).
 * Пустой элемент удаляется сразу — подтверждать нечего; заполненный
 * спрашивает, как и блок целиком.
 */
function RemoveNested({
  label,
  empty,
  disabled,
  onConfirm,
}: {
  label: string;
  empty: boolean;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  if (empty) {
    return (
      <button type="button" className={dangerButton} disabled={disabled} onClick={onConfirm}>
        Убрать
      </button>
    );
  }

  return (
    <ConfirmButton
      triggerLabel="Убрать"
      triggerClassName={dangerButton}
      disabled={disabled}
      title={`Убрать ${label}?`}
      description="Заполненные поля будут потеряны."
      confirmLabel="Убрать"
      onConfirm={onConfirm}
    />
  );
}

/**
 * Редактор таблицы.
 *
 * Каждая ячейка — отдельное поле, а не одна строка с разделителем «|»:
 * разделитель нельзя было ввести в текст ячейки, а пустая ячейка при разборе
 * терялась, из-за чего столбцы съезжали под чужие заголовки.
 */
function TableFields({
  block,
  disabled,
  invalid,
  onChange,
}: FieldsProps<TableBlockValues> & { invalid: boolean }) {
  const uidPrefix = useId();
  const { headers, rows } = block;
  const width = Math.max(headers.length, ...rows.map((row) => row.length), 0);

  // Строки есть, а заголовков нет — это пользователь уже сломал таблицу сам,
  // о таком говорим сразу. В остальных случаях ждём попытки сохранить, чтобы
  // только что добавленный пустой блок не встречал красным.
  const brokenNow = effectiveHeaders(headers).length === 0 && filledRows(rows).length > 0;
  const showAlert = invalid || brokenNow;

  /** Приводит заголовки и все строки к одной ширине, чтобы сетка не разъезжалась. */
  function normalize(nextHeaders: string[], nextRows: string[][], size: number) {
    onChange({
      ...block,
      headers: Array.from({ length: size }, (_, i) => nextHeaders[i] ?? ""),
      rows: nextRows.map((row) => Array.from({ length: size }, (_, i) => row[i] ?? "")),
    });
  }

  function removeColumn(column: number) {
    const nextHeaders = headers.filter((_, i) => i !== column);
    const nextRows = rows.map((row) => row.filter((_, i) => i !== column));
    onChange(
      nextHeaders.length === 0
        ? { ...block, headers: [], rows: [] }
        : { ...block, headers: nextHeaders, rows: nextRows },
    );
  }

  /** Пустой столбец удаляем молча, заполненный — спрашиваем. */
  function columnIsEmpty(column: number) {
    return (
      (headers[column] ?? "").trim() === "" &&
      rows.every((row) => (row[column] ?? "").trim() === "")
    );
  }

  const lastColumn = width === 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-brand-sm border border-line bg-white p-3">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Столбцы и строки
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-ink-soft/80">
              Каждая ячейка — отдельное поле. Пустые ячейки сохраняются, любые символы (в том числе
              «|») вводятся как есть.
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              className={smallButton}
              onClick={() => normalize(headers, rows, width + 1)}
              disabled={disabled}
            >
              + Столбец
            </button>
            <button
              type="button"
              className={smallButton}
              onClick={() => normalize(headers, [...rows, []], Math.max(width, 1))}
              disabled={disabled || width === 0}
            >
              + Строка
            </button>
          </div>
        </div>

        {showAlert && (
          <p
            role="alert"
            className="mb-2 rounded-brand-sm border border-burgundy/30 bg-burgundy/5 px-3 py-2 text-[12px] font-semibold leading-snug text-burgundy"
          >
            Заполните хотя бы один заголовок столбца — иначе таблицу сохранить нельзя. Если таблица
            не нужна, удалите блок целиком.
          </p>
        )}

        {width === 0 && rows.length === 0 ? (
          <p className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-3 py-4 text-center text-[12px] text-ink-soft">
            Таблица пуста. Нажмите «+ Столбец», чтобы начать.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="w-7" />
                  {Array.from({ length: width }, (_, column) => (
                    <th key={column} className="p-1 align-top">
                      <input
                        className={cn(controlClass, "h-9 font-bold")}
                        value={headers[column] ?? ""}
                        placeholder={`Заголовок ${column + 1}`}
                        aria-label={`Заголовок столбца ${column + 1}`}
                        onChange={(event) => {
                          const next = [...headers];
                          next[column] = event.target.value;
                          onChange({ ...block, headers: next });
                        }}
                        disabled={disabled}
                      />
                      {columnIsEmpty(column) && !lastColumn ? (
                        <button
                          type="button"
                          className="mt-1 text-[11px] font-bold text-ink-soft transition hover:text-burgundy"
                          onClick={() => removeColumn(column)}
                          disabled={disabled}
                        >
                          × столбец
                        </button>
                      ) : (
                        <ConfirmButton
                          triggerLabel="× столбец"
                          triggerClassName="mt-1 text-[11px] font-bold text-ink-soft transition hover:text-burgundy"
                          disabled={disabled}
                          title={`Удалить столбец ${column + 1}?`}
                          description={
                            lastColumn
                              ? "Это последний столбец: вместе с ним удалятся ВСЕ строки таблицы — без заголовков хранить их негде."
                              : "Значения этого столбца во всех строках будут потеряны."
                          }
                          confirmLabel={lastColumn ? "Удалить таблицу" : "Удалить столбец"}
                          onConfirm={() => removeColumn(column)}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => {
                  const rowIsEmpty = row.every((cell) => cell.trim() === "");
                  const dropRow = () =>
                    onChange({ ...block, rows: rows.filter((_, i) => i !== rowIndex) });

                  return (
                    <tr key={rowIndex}>
                      <td className="p-1 align-middle">
                        {rowIsEmpty ? (
                          <button
                            type="button"
                            className="text-[13px] font-bold text-ink-soft transition hover:text-burgundy"
                            onClick={dropRow}
                            disabled={disabled}
                            aria-label={`Удалить строку ${rowIndex + 1}`}
                            title="Удалить строку"
                          >
                            ×
                          </button>
                        ) : (
                          <ConfirmButton
                            triggerLabel="×"
                            triggerClassName="text-[13px] font-bold text-ink-soft transition hover:text-burgundy"
                            triggerTitle="Удалить строку"
                            disabled={disabled}
                            title={`Удалить строку ${rowIndex + 1}?`}
                            description="Заполненные ячейки строки будут потеряны."
                            confirmLabel="Удалить строку"
                            onConfirm={dropRow}
                          />
                        )}
                      </td>
                      {Array.from({ length: width }, (_, column) => (
                        <td key={column} className="p-1 align-top">
                          <input
                            className={cn(controlClass, "h-9")}
                            value={row[column] ?? ""}
                            aria-label={`Строка ${rowIndex + 1}, столбец ${column + 1}`}
                            onChange={(event) =>
                              onChange({
                                ...block,
                                rows: rows.map((current, i) =>
                                  i === rowIndex
                                    ? current.map((cell, j) =>
                                        j === column ? event.target.value : cell,
                                      )
                                    : current,
                                ),
                              })
                            }
                            disabled={disabled}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Field label="Подпись таблицы" htmlFor={`${uidPrefix}-caption`} hint="Необязательно.">
        <TextInput
          id={`${uidPrefix}-caption`}
          value={block.caption}
          disabled={disabled}
          onChange={(event) => onChange({ ...block, caption: event.target.value })}
        />
      </Field>
    </div>
  );
}
