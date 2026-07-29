import Image from "next/image";
import Link from "next/link";
import { Download } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import type { ArticleBlock, BlogArticle } from "@/lib/blog";
import { articleOutline, headingLevel, isLocalImagePath } from "@/lib/blog-blocks";
import { cn } from "@/lib/cn";
import { typo } from "@/lib/typo";

/**
 * Тело статьи блога.
 *
 * Рисует последовательность блоков (`article.sections` — это массив
 * ArticleBlock, см. src/lib/blog-blocks.ts). Заголовки получают `id` и
 * `scroll-mt-28`: они же служат якорями и пунктами оглавления справа.
 *
 * Каждый блок получает свой `id`, а не только заголовки, — так на любой блок
 * можно дать ссылку из текста, не заводя лишний заголовок.
 */
/**
 * Есть ли что рисовать.
 *
 * Отдельный проход нужен, чтобы у первого ВИДИМОГО блока не появился отступ
 * раздела, если предыдущий блок был отброшен.
 */
function isRenderable(block: ArticleBlock): boolean {
  if (block.type === "image") return isLocalImagePath(block.src);
  if (block.type === "gallery") return block.images.some((image) => isLocalImagePath(image.src));
  return true;
}

export function ArticleBody({ article }: { article: BlogArticle }) {
  const blocks = article.sections.filter(isRenderable);
  const outline = articleOutline(blocks);

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <div className="min-w-0">
          <div className="space-y-5 text-[17px] leading-[1.85] text-ink-soft">
            {/* Ключ по индексу: два одинаковых абзаца — легальный текст,
                а не ошибка данных, и по содержимому они неразличимы. */}
            {article.intro.map((paragraph, index) => (
              <p key={index}>{typo(paragraph)}</p>
            ))}
          </div>

          <div className="mt-12">
            {blocks.map((block, index) => (
              <Block key={block.id} block={block} first={index === 0} />
            ))}
          </div>

          <aside className="mt-16 rounded-[30px] bg-burgundy p-7 text-white sm:p-10">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">
              Обсудить проект
            </p>
            <h2 className="mt-3 text-[28px] font-extrabold leading-tight sm:text-[34px]">
              Подберём решение под вашу задачу
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/75">
              Пришлите назначение, планировку и адрес объекта. Специалисты ООО «Маяк» уточнят
              комплектацию и подготовят расчёт.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-burgundy"
              >
                Смотреть каталог
              </Link>
              <Link
                href="/kontakty"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white"
              >
                Получить консультацию
              </Link>
            </div>
          </aside>
        </div>

        {outline.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl border border-line bg-white p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-burgundy/70">
                Содержание
              </p>
              <nav className="mt-4">
                <ol className="space-y-3">
                  {outline.map((section) => (
                    <li key={section.heading.id}>
                      <a
                        href={`#${section.heading.id}`}
                        className="text-[14px] leading-snug text-ink-soft transition hover:text-burgundy"
                      >
                        {typo(section.heading.text)}
                      </a>

                      {/* Подзаголовки — вложенным уровнем: плоский список
                          H2 и H3 вперемешку читался бы как равнозначные
                          разделы. */}
                      {section.children.length > 0 && (
                        <ul className="mt-2 space-y-2 border-l border-line pl-3">
                          {section.children.map((child) => (
                            <li key={child.id}>
                              <a
                                href={`#${child.id}`}
                                className="text-[13px] leading-snug text-ink-soft/80 transition hover:text-burgundy"
                              >
                                {typo(child.text)}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>
        )}
      </div>
    </Container>
  );
}

/**
 * Отступ сверху задаёт сам блок: перед заголовком нужен разрыв раздела, между
 * остальными блоками — обычный интервал. Первый блок статьи отступа не
 * получает, иначе он оторвался бы от вступления.
 */
function Block({ block, first }: { block: ArticleBlock; first: boolean }) {
  const content = blockContent(block);
  // Блок, который нечем нарисовать (например, картинка с внешним адресом),
  // не должен оставлять после себя пустую обёртку с отступом.
  if (content === null) return null;

  return (
    <div
      id={block.id}
      className={cn(
        "scroll-mt-28",
        first
          ? "mt-0"
          : block.type !== "heading"
            ? "mt-6"
            : // Подзаголовок отделяется от предыдущего блока слабее раздела:
              // он продолжает тот же раздел, а не открывает новый.
              headingLevel(block) === 3
              ? "mt-8 sm:mt-10"
              : "mt-12 sm:mt-14",
      )}
    >
      {content}
    </div>
  );
}

function blockContent(block: ArticleBlock): React.ReactElement | null {
  switch (block.type) {
    case "heading":
      // Раздел — H2, подзаголовок внутри раздела — H3. Уровень тега и кегль
      // задаются вместе: перескакивать уровни ради размера нельзя.
      return headingLevel(block) === 3 ? (
        <h3 className="text-[20px] font-extrabold leading-snug tracking-[-0.01em] text-ink sm:text-[23px]">
          {typo(block.text)}
        </h3>
      ) : (
        <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
          {typo(block.text)}
        </h2>
      );

    case "text":
      return (
        <div className="space-y-4 text-[16px] leading-[1.8] text-ink-soft">
          {block.paragraphs.map((paragraph, index) => (
            <p key={index}>{typo(paragraph)}</p>
          ))}
        </div>
      );

    case "list": {
      const items = block.items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3 text-[16px] leading-relaxed text-ink-soft">
          {block.ordered ? (
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-burgundy text-[12px] font-bold text-white">
              {index + 1}
            </span>
          ) : (
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-burgundy" />
          )}
          <span className="min-w-0">{typo(item)}</span>
        </li>
      ));

      const className = "space-y-3 rounded-3xl border border-line bg-warm-soft p-6 sm:p-7";
      return block.ordered ? (
        <ol className={className}>{items}</ol>
      ) : (
        <ul className={className}>{items}</ul>
      );
    }

    case "table":
      return (
        <figure>
          {/* Прокрутка внутри таблицы, а не всей страницы: на 375px широкая
              таблица иначе давала бы горизонтальную полосу у документа. */}
          <div className="overflow-x-auto rounded-3xl border border-line">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead className="bg-burgundy text-white">
                <tr>
                  {block.headers.map((header, index) => (
                    <th key={`${header}-${index}`} className="px-5 py-4 text-[14px] font-bold">
                      {typo(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 ? "bg-warm-soft" : "bg-white"}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-t border-line px-5 py-4 text-[14px] leading-relaxed text-ink-soft"
                      >
                        {typo(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <Caption>{block.caption}</Caption>}
        </figure>
      );

    case "quote":
      return (
        <figure className="rounded-3xl border border-line bg-warm-soft p-7 sm:p-9">
          <blockquote className="border-l-2 border-burgundy pl-5 text-[18px] font-semibold leading-[1.65] text-ink sm:text-[20px]">
            {typo(block.text)}
          </blockquote>
          {block.author && (
            <figcaption className="mt-4 pl-6 text-[13px] font-bold uppercase tracking-[0.12em] text-burgundy/70">
              {typo(block.author)}
            </figcaption>
          )}
        </figure>
      );

    case "image":
      // Внешний адрес next/image не рисует, а бросает — и роняет всю статью.
      // Конвертер такие картинки уже отбрасывает; эта проверка страхует путь
      // мимо конвертера (статический фолбэк из blog.ts).
      if (!isLocalImagePath(block.src)) return null;
      return (
        <figure>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-warm-soft">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 880px"
              className="object-cover"
            />
          </div>
          {block.caption && <Caption>{block.caption}</Caption>}
        </figure>
      );

    case "gallery": {
      const images = block.images.filter((image) => isLocalImagePath(image.src));
      if (images.length === 0) return null;
      return (
        <ul
          className={cn(
            "grid gap-3 sm:gap-4",
            images.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {images.map((image, index) => (
            <li
              key={`${image.src}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-warm-soft"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 440px"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      );
    }

    case "video":
      return (
        <figure>
          <div className="overflow-hidden rounded-3xl border border-line bg-carbon">
            {/* Субтитров в медиатеке нет, поэтому <track> не добавляем;
                управление проигрыванием доступно с клавиатуры через controls. */}
            <video
              className="aspect-video w-full"
              controls
              preload="metadata"
              poster={block.poster}
              src={block.src}
            />
          </div>
          {block.caption && <Caption>{block.caption}</Caption>}
        </figure>
      );

    case "file":
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-3xl border border-line bg-white p-5 transition hover:border-burgundy/40 hover:bg-warm-soft sm:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-burgundy text-white">
            <Download className="h-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[16px] font-bold leading-snug text-ink">
              {typo(block.title)}
            </span>
            <span className="mt-0.5 block text-[13px] text-ink-soft">Открыть документ</span>
          </span>
        </a>
      );

    case "accordion":
      return (
        <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
          {block.items.map((item, index) => (
            // <details> доступен с клавиатуры и работает без JS: Tab наводит
            // на <summary>, Enter/Пробел раскрывает.
            <details key={`${item.question}-${index}`} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[16px] font-bold leading-snug text-ink transition hover:text-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-burgundy sm:px-7 sm:py-5">
                <span className="min-w-0">{typo(item.question)}</span>
                <span
                  aria-hidden
                  className="relative h-4 w-4 shrink-0 text-burgundy before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-4 before:-translate-y-1/2 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-0.5 after:-translate-x-1/2 after:bg-current after:transition-transform group-open:after:scale-y-0"
                />
              </summary>
              <div className="px-5 pb-5 text-[15px] leading-[1.8] text-ink-soft sm:px-7 sm:pb-6">
                {typo(item.answer)}
              </div>
            </details>
          ))}
        </div>
      );
  }
}

function Caption({ children }: { children: string }) {
  return (
    <figcaption className="mt-3 text-[13px] leading-relaxed text-ink-soft/80">
      {typo(children)}
    </figcaption>
  );
}
