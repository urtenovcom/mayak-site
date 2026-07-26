import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { CONTACTS, SITE } from "@/lib/site";

// Шаблон, требует проверки юристом (152-ФЗ).

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика обработки персональных данных ООО «Маяк» в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      label="Документы"
      title="Политика конфиденциальности"
      description="Порядок обработки и защиты персональных данных пользователей сайта ООО «Маяк»."
    >
      <h2 className="text-2xl font-bold mt-10 mb-4">1. Общие положения</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Настоящая Политика обработки персональных данных (далее — Политика)
        действует в отношении всей информации, которую {SITE.legalName} (далее —
        Оператор) может получить о пользователе во время использования сайта.
        Политика разработана в соответствии с Федеральным законом от 27.07.2006
        № 152-ФЗ «О персональных данных».
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">2. Оператор персональных данных</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Оператором является {SITE.legalName}. Контактный адрес для обращений по
        вопросам обработки персональных данных:{" "}
        <a
          href={`mailto:${CONTACTS.email}`}
          className="text-burgundy font-semibold underline underline-offset-2"
        >
          {CONTACTS.email}
        </a>
        .
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">3. Какие данные собираются</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Через формы обратной связи на сайте Оператор может собирать следующие
        персональные данные:
      </p>
      <ul className="list-disc pl-5 text-ink-soft leading-relaxed mb-4 space-y-2">
        <li>имя пользователя;</li>
        <li>номер телефона;</li>
        <li>иные данные, добровольно указанные пользователем в сообщении.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">4. Цели обработки</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Персональные данные обрабатываются в следующих целях:
      </p>
      <ul className="list-disc pl-5 text-ink-soft leading-relaxed mb-4 space-y-2">
        <li>обработка заявок и обращений пользователя;</li>
        <li>обратная связь, консультирование и подготовка коммерческого предложения;</li>
        <li>заключение и исполнение договоров.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">5. Правовые основания и условия обработки</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Обработка персональных данных осуществляется на основании согласия
        субъекта персональных данных, а также в случаях, предусмотренных
        законодательством Российской Федерации. Оператор не передаёт
        персональные данные третьим лицам, за исключением случаев, прямо
        предусмотренных законом.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">6. Защита данных</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Оператор принимает необходимые правовые, организационные и технические
        меры для защиты персональных данных от неправомерного доступа,
        уничтожения, изменения, блокирования и иных неправомерных действий.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">7. Права субъекта персональных данных</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Пользователь имеет право:
      </p>
      <ul className="list-disc pl-5 text-ink-soft leading-relaxed mb-4 space-y-2">
        <li>получать информацию об обработке своих персональных данных;</li>
        <li>требовать уточнения, блокирования или уничтожения данных, если они неполны, устарели или незаконно получены;</li>
        <li>отозвать согласие на обработку персональных данных;</li>
        <li>обжаловать действия Оператора в уполномоченном органе по защите прав субъектов персональных данных.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">8. Контакты</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        По всем вопросам, связанным с обработкой персональных данных, вы можете
        обратиться к Оператору по адресу электронной почты{" "}
        <a
          href={`mailto:${CONTACTS.email}`}
          className="text-burgundy font-semibold underline underline-offset-2"
        >
          {CONTACTS.email}
        </a>
        .
      </p>
    </LegalLayout>
  );
}
