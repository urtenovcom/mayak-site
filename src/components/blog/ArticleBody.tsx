import Link from "next/link";
import type { BlogArticle } from "@/lib/blog";
import { Container } from "@/components/ui/Container";

export function ArticleBody({ article }: { article: BlogArticle }) {
  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <div className="min-w-0">
          <div className="space-y-5 text-[17px] leading-[1.85] text-ink-soft">{article.intro.map((p) => <p key={p}>{p}</p>)}</div>
          <div className="mt-12 space-y-14">
            {article.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">{section.title}</h2>
                {section.paragraphs && <div className="mt-5 space-y-4 text-[16px] leading-[1.8] text-ink-soft">{section.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>}
                {section.bullets && <ul className="mt-6 space-y-3 rounded-3xl border border-line bg-warm-soft p-6 sm:p-7">{section.bullets.map((item) => <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-ink-soft"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-burgundy" />{item}</li>)}</ul>}
                {section.table && <div className="mt-7 overflow-x-auto rounded-3xl border border-line"><table className="w-full min-w-[560px] border-collapse text-left"><thead className="bg-burgundy text-white"><tr>{section.table.headers.map((h) => <th key={h} className="px-5 py-4 text-[14px] font-bold">{h}</th>)}</tr></thead><tbody>{section.table.rows.map((row, i) => <tr key={row.join()} className={i % 2 ? "bg-warm-soft" : "bg-white"}>{row.map((cell) => <td key={cell} className="border-t border-line px-5 py-4 text-[14px] leading-relaxed text-ink-soft">{cell}</td>)}</tr>)}</tbody></table></div>}
              </section>
            ))}
          </div>
          <aside className="mt-16 rounded-[30px] bg-burgundy p-7 text-white sm:p-10">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">Обсудить проект</p>
            <h2 className="mt-3 text-[28px] font-extrabold leading-tight sm:text-[34px]">Подберём решение под вашу задачу</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/75">Пришлите назначение, планировку и адрес объекта. Специалисты ООО «Маяк» уточнят комплектацию и подготовят расчёт.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/catalog" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-burgundy">Смотреть каталог</Link><Link href="/kontakty" className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white">Получить консультацию</Link></div>
          </aside>
        </div>
        <aside className="hidden lg:block"><div className="sticky top-28 rounded-3xl border border-line bg-white p-6"><p className="text-[12px] font-bold uppercase tracking-[0.16em] text-burgundy/70">Содержание</p><nav className="mt-4"><ol className="space-y-3">{article.sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-[14px] leading-snug text-ink-soft transition hover:text-burgundy">{s.title}</a></li>)}</ol></nav></div></aside>
      </div>
    </Container>
  );
}
