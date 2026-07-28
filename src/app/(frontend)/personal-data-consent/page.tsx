import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getContacts } from "@/lib/content";
import { SITE } from "@/lib/site";

// Шаблон, требует проверки юристом (152-ФЗ).

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  description:
    "Согласие пользователя на обработку персональных данных ООО «Маяк» в соответствии с Федеральным законом № 152-ФЗ.",
  // Без своего `alternates` страница унаследовала бы canonical главной.
  alternates: { canonical: "/personal-data-consent" },
};

export default async function PersonalDataConsentPage() {
  const contacts = await getContacts();

  return (
    <LegalLayout
      label="Документы"
      title="Согласие на обработку персональных данных"
      description="Условия, на которых пользователь даёт согласие на обработку своих персональных данных."
    >
      <p className="text-ink-soft leading-relaxed mb-4">
        Отправляя заявку через формы на сайте, пользователь (далее — Субъект)
        свободно, своей волей и в своём интересе даёт согласие {SITE.legalName}{" "}
        (далее — Оператор) на обработку своих персональных данных на условиях,
        изложенных ниже, в соответствии с Федеральным законом от 27.07.2006
        № 152-ФЗ «О персональных данных».
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">1. Перечень персональных данных</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Субъект даёт согласие на обработку следующих персональных данных:
      </p>
      <ul className="list-disc pl-5 text-ink-soft leading-relaxed mb-4 space-y-2">
        <li>фамилия, имя (имя, указанное в форме);</li>
        <li>номер контактного телефона.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">2. Цели обработки</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Согласие даётся в целях обработки заявки, обратной связи с Субъектом,
        консультирования, подготовки коммерческого предложения, а также
        заключения и исполнения договора.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">3. Перечень действий с данными</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Оператор вправе осуществлять сбор, запись, систематизацию, накопление,
        хранение, уточнение (обновление, изменение), извлечение, использование,
        блокирование, удаление и уничтожение персональных данных как с
        использованием средств автоматизации, так и без таковых.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">4. Срок действия согласия</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Согласие действует с момента его предоставления и до достижения целей
        обработки либо до момента отзыва согласия Субъектом.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">5. Отзыв согласия</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Субъект вправе отозвать настоящее согласие в любой момент, направив
        Оператору соответствующее письменное обращение на адрес электронной
        почты{" "}
        <a
          href={`mailto:${contacts.email}`}
          className="text-burgundy font-semibold underline underline-offset-2"
        >
          {contacts.email}
        </a>
        . После получения отзыва Оператор прекращает обработку персональных
        данных и уничтожает их, за исключением случаев, когда обработка должна
        быть продолжена в силу требований законодательства.
      </p>
    </LegalLayout>
  );
}
