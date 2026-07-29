// Перевод сообщений REST API на русский.
//
// API отвечает по-английски и именами полей из схемы («Field "purpose" must be
// a non-empty string»). В русской панели это нечитаемо, поэтому типовые
// формулировки переводим и подставляем человеческие названия полей.
// Незнакомый текст отдаём как есть — лучше английская правда, чем молчание.

import { ARTICLE_BLOCK_LABELS, type ArticleBlockType } from "../blog-blocks";

export type FieldLabels = Record<string, string>;

/** Названия полей, общие для всех разделов. Раздел может переопределить их своими. */
const BASE_FIELD_LABELS: FieldLabels = {
  // каталог
  name: "Название",
  image: "Изображение",
  purpose: "Назначение",
  type: "Тип",
  exploitation: "Эксплуатация",
  size: "Габариты",
  description: "Описание",
  tags: "Теги",
  options: "Опции",
  complectation: "Комплектация",
  individual: "Индивидуальный размер",
  // блог
  title: "Заголовок",
  excerpt: "Краткий анонс",
  imageAlt: "Alt изображения",
  readingTime: "Время чтения",
  keywords: "Ключевые слова",
  intro: "Вступление",
  sections: "Тело статьи",
  publishedAt: "Дата публикации",
  updatedAt: "Дата обновления",
  // направления
  icon: "Иконка",
  label: "Метка",
  kicker: "Надзаголовок",
  bullets: "Буллиты",
  key: "Ключ",
  products: "Товары-примеры",
  // контакты и настройки
  phones: "Телефоны",
  telegram: "Telegram",
  max: "MAX",
  email: "E-mail",
  address: "Адрес",
  value: "Значение",
  n: "Номер",
  // заявки
  phone: "Телефон",
  comment: "Комментарий",
  source: "Источник",
  page: "Страница",
  status: "Статус",
  // общее
  slug: "Slug",
  sortOrder: "Порядок",
  published: "Публикация",
  alt: "Alt",
};

/** Точные совпадения — фразы API, у которых нет переменной части. */
const EXACT: Record<string, string> = {
  "Invalid login or password": "Неверный логин или пароль.",
  "Too many failed login attempts, please try again later":
    "Слишком много неудачных попыток входа. Подождите несколько минут и попробуйте снова.",
  "Too many requests, please try again later":
    "Слишком много запросов подряд. Подождите немного и повторите.",
  "Please provide login and password": "Введите логин и пароль.",
  "Not authorized as an admin": "Недостаточно прав: операция доступна только администратору.",
  "Not authorized, no token provided": "Сессия истекла. Войдите в админку заново.",
  "Not authorized, invalid token": "Сессия недействительна. Войдите в админку заново.",
  "Not authorized, user not found": "Учётная запись не найдена. Войдите заново.",
  "Not authorized to read unpublished content":
    "Недостаточно прав, чтобы видеть неопубликованные записи.",
  "Record with these unique values already exists":
    "Запись с такими значениями уже существует — измените slug или название.",
  "Related record is missing or still referenced":
    "Связанная запись отсутствует или на неё ещё есть ссылки.",
  "Required field cannot be null": "Не заполнено обязательное поле.",
  "Missing required value": "Не заполнено обязательное значение.",
  "Invalid input value": "Некорректное значение в одном из полей.",
  "Invalid request data": "Некорректные данные запроса.",
  "Value is too long for one of the fields": "Одно из полей слишком длинное.",
  "Value is out of range for its field": "Значение выходит за допустимый диапазон.",
  "Numeric value is out of range for its field": "Число выходит за допустимый диапазон.",
  "Number is out of range for its field": "Число выходит за допустимый диапазон.",
  "Database request failed": "Ошибка базы данных на стороне API.",
  "Internal server error": "Внутренняя ошибка сервера API.",
  "Record not found": "Запись не найдена.",
  "Lead not found": "Заявка не найдена.",
  "Product not found": "Товар не найден.",
  "Article not found": "Статья не найдена.",
  "Solution not found": "Направление не найдено.",
  "Stat not found": "Показатель не найден.",
  "Process step not found": "Этап не найден.",
  "Media not found": "Файл не найден.",
  "No file uploaded": "Файл не выбран.",
  "File is not a valid raster image": "Файл не является растровым изображением.",
  "sections must be an array": "Тело статьи передано в неверном формате.",
  "products must be an array": "Товары-примеры переданы в неверном формате.",
  "email must be a valid email": "Укажите корректный адрес электронной почты.",
  '"email" must be a valid email address, e.g. "info@example.com"':
    "Укажите корректный адрес электронной почты.",
  // Настройки → Настройка метрик и Настройка заявок. Панель проверяет формат
  // до отправки, но ответ API тоже должен читаться по-русски.
  '"yandexMetrikaId" must contain only digits (up to 12), e.g. "98765432"':
    "Номер счётчика Яндекс.Метрики — только цифры, например 98765432.",
  '"googleAnalyticsId" must look like "G-XXXXXXXXXX" (GA4 measurement ID). Universal Analytics ids like "UA-12345" are not supported':
    "Идентификатор Google Analytics 4 выглядит как G-XXXXXXXXXX. Старые идентификаторы вида UA-12345 не поддерживаются.",
  '"leadTelegramChatId" must be a numeric chat id (e.g. "-1001234567890") or a "@username"':
    "chat_id — это число (у групп начинается с «−») или @username канала. Узнать можно у @userinfobot.",
  '"leadEmail" must be a valid email address, e.g. "zayavki@example.com"':
    "Проверьте адрес почты для уведомлений.",
};

function labelFor(field: string, labels: FieldLabels): string {
  return labels[field] ?? BASE_FIELD_LABELS[field] ?? field;
}

/** «image, purpose, size» → «Изображение, Назначение, Габариты». */
function labelList(raw: string, labels: FieldLabels): string {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((field) => labelFor(field, labels))
    .join(", ");
}

// ---------------------------------------------------------------------------
// Блоки статьи
// ---------------------------------------------------------------------------
//
// Тело статьи API адресует как `sections[N]`, дописывая тип блока и, для
// вложенных структур, номер элемента:
//
//   sections[2] (type "gallery") images[1]: "alt" is required and must be a
//   non-empty string
//
// Разбираем такой префикс отдельно от текста ошибки: номер блока и его тип
// нужны почти во всех сообщениях, а хвостов — с десяток.

/**
 * Названия полей блоков — ровно те, что стоят подписями в форме.
 *
 * Одно и то же имя поля у разных типов значит разное («src» у изображения —
 * это «Изображение», у видео — «Ссылка на видео»), поэтому сначала смотрим
 * перекрытие по типу блока и только потом общий список.
 */
const BLOCK_FIELD_LABELS: Record<string, string> = {
  id: "Якорь (id)",
  level: "Уровень",
  text: "Текст",
  paragraphs: "Абзацы",
  items: "Пункты",
  ordered: "Нумерованный список",
  headers: "Заголовки столбцов",
  rows: "Строки",
  caption: "Подпись",
  author: "Автор",
  src: "Файл",
  alt: "Alt",
  poster: "Постер",
  images: "Изображения",
  url: "Ссылка на файл",
  title: "Название",
  question: "Вопрос",
  answer: "Ответ",
};

const BLOCK_TYPE_FIELD_LABELS: Partial<Record<ArticleBlockType, FieldLabels>> = {
  heading: { text: "Текст заголовка" },
  quote: { text: "Текст цитаты" },
  table: { caption: "Подпись таблицы" },
  image: { src: "Изображение", alt: "Alt изображения" },
  gallery: { images: "Изображения", src: "Файл", alt: "Alt" },
  video: { src: "Ссылка на видео", caption: "Подпись" },
  file: { url: "Ссылка на файл", title: "Название" },
  accordion: { items: "Вопросы и ответы" },
};

/** Названия полей для конкретного блока: перекрытия типа поверх общих. */
function blockLabels(type: string | undefined): FieldLabels {
  const overrides = type ? BLOCK_TYPE_FIELD_LABELS[type as ArticleBlockType] : undefined;
  return { ...BLOCK_FIELD_LABELS, ...overrides };
}

/** «Блок 3 «Галерея», изображение 2» — адрес места ошибки по-русски. */
function blockPrefix(middle: string, index: number, type: string | undefined): string {
  const label = type ? ARTICLE_BLOCK_LABELS[type as ArticleBlockType] : undefined;

  let prefix = `Блок ${index + 1}`;
  if (label) prefix += ` «${label}»`;
  if (/\(legacy format\)/.test(middle)) prefix += " (старый формат)";

  const nested = middle.match(/(images|items)\[(\d+)\]/);
  if (nested) {
    const name = nested[1] === "images" ? "изображение" : "пункт";
    prefix += `, ${name} ${Number(nested[2]) + 1}`;
  }

  if (/ table$/.test(middle)) prefix += ", таблица";

  return prefix;
}

/** Текст ошибки блока без адреса. `null` — формулировка незнакомая. */
function blockProblem(rest: string, labels: FieldLabels): string | null {
  let match: RegExpMatchArray | null;

  match = rest.match(/^"([^"]+)" is required and must be a non-empty string$/);
  if (match) return `заполните поле «${labelFor(match[1], labels)}»`;

  match = rest.match(/^"([^"]+)" must contain at least one non-empty string$/);
  if (match) return `заполните хотя бы одну строку в поле «${labelFor(match[1], labels)}»`;

  match = rest.match(/^"([^"]+)" must be a non-empty array$/);
  if (match) return `добавьте хотя бы один элемент в «${labelFor(match[1], labels)}»`;

  if (rest === '"headers" must contain at least one column') {
    return "заполните хотя бы один заголовок столбца";
  }

  if (rest === 'table must be an object with "headers" and "rows"') {
    return "таблица передана в неверном формате";
  }

  if (rest === 'table requires at least one column in "headers"') {
    return "в таблице не заполнен ни один заголовок столбца";
  }

  // "level" must be one of: 2, 3 (H1 is reserved for the page title; ...)
  if (/^"level" must be one of/.test(rest)) {
    return "у заголовка допустимы только уровни «Раздел (H2)» и «Подзаголовок (H3)»";
  }

  match = rest.match(/^"([^"]+)" must be a boolean$/);
  if (match) return `поле «${labelFor(match[1], labels)}» передано в неверном формате`;

  match = rest.match(/^images\[(\d+)\] must be an object with "src" and "alt"$/);
  if (match) return `изображение ${Number(match[1]) + 1} передано в неверном формате`;

  match = rest.match(/^items\[(\d+)\] must be an object with "question" and "answer"$/);
  if (match) return `пункт ${Number(match[1]) + 1} передан в неверном формате`;

  if (/^"type" is required\./.test(rest)) return "не указан тип блока";

  match = rest.match(/^unknown block type "([^"]*)"\./);
  if (match) return `неизвестный тип блока «${match[1]}»`;

  return null;
}

/** Сообщение про блок статьи → русский текст. `null` — сообщение не про блоки. */
function translateBlockError(text: string): string | null {
  // sections: duplicate block id "task" — ids must be unique within an article
  let match = text.match(/^sections: duplicate block id "([^"]*)"/);
  if (match) {
    return `Идентификатор блока «${match[1]}» повторяется — он должен быть уникальным в пределах статьи.`;
  }

  // sections[1] must be an object
  match = text.match(/^sections\[(\d+)\] must be an object$/);
  if (match) return `Блок ${Number(match[1]) + 1} передан в неверном формате.`;

  // Хвост может содержать ": " («Allowed types: …»), поэтому середина ленивая:
  // разделителем считаем первое двоеточие после адреса блока.
  match = text.match(/^sections\[(\d+)\](.*?): ([\s\S]+)$/);
  if (!match) return null;

  // Названия полей берём по типу блока, а не из подписей формы статьи:
  // «src» у изображения и у видео называются в форме по-разному.
  const type = match[2].match(/\(type "([^"]*)"\)/)?.[1];
  const problem = blockProblem(match[3], blockLabels(type));
  if (!problem) return null;

  return `${blockPrefix(match[2], Number(match[1]), type)}: ${problem}.`;
}

/**
 * Переводит сообщение API на русский.
 * @param labels названия полей конкретной формы (перекрывают общие).
 */
export function translateApiError(message: string, labels: FieldLabels = {}): string {
  const text = message.trim();
  if (!text) return "Неизвестная ошибка.";

  const exact = EXACT[text];
  if (exact) return exact;

  // Блоки статьи — отдельный разбор: у них свой формат адреса ошибки.
  const block = translateBlockError(text);
  if (block) return block;

  let match: RegExpMatchArray | null;

  // Missing or empty required fields: image, purpose, size
  match = text.match(/^Missing or empty required fields:\s*(.+)$/i);
  if (match) return `Заполните обязательные поля: ${labelList(match[1], labels)}.`;

  // Field "purpose" must be a non-empty string
  match = text.match(/^Field "([^"]+)" must be a non-empty string$/i);
  if (match) return `Поле «${labelFor(match[1], labels)}» не может быть пустым.`;

  // products[0] requires both "name" and "image"
  match = text.match(/^products\[(\d+)\] requires both "name" and "image"$/i);
  if (match) {
    return `У товара-примера ${Number(match[1]) + 1} нужно заполнить и название, и изображение.`;
  }

  // products[1] duplicates name "X" within the same solution
  match = text.match(/^products\[(\d+)\] duplicates name "([^"]*)" within the same solution$/i);
  if (match) {
    return `Товар-пример ${Number(match[1]) + 1}: название «${match[2]}» уже есть в этом направлении — имена должны быть разными.`;
  }

  // "sortOrder" must be an integer [between -2147483648 and 2147483647]
  match = text.match(/^"?([A-Za-z[\]\d.]+)"? must be an integer(?: between .+)?$/);
  if (match) {
    const field = match[1].replace(/^products\[\d+\]\./, "");
    return `Поле «${labelFor(field, labels)}» должно быть целым числом.`;
  }

  // publishedAt must be a valid date
  match = text.match(/^(\w+) must be a valid date$/i);
  if (match) return `Поле «${labelFor(match[1], labels)}» содержит некорректную дату.`;

  // status must be one of: NEW, IN_PROGRESS, DONE, SPAM
  match = text.match(/^status must be one of:\s*(.+)$/i);
  if (match) return `Недопустимый статус. Разрешены: ${match[1]}.`;

  // Query parameter "published" must be one of: all, true, false
  match = text.match(/^Query parameter "([^"]+)" must be (.+)$/i);
  if (match) return `Некорректный параметр запроса «${match[1]}».`;

  // name is required, phone must contain at least 6 digits (заявки)
  if (/\bis required\b/.test(text) && /,|^\w+ is required$/.test(text)) {
    const fields = text
      .split(",")
      .map((part) => part.trim().match(/^(\w+) is required$/)?.[1])
      .filter((field): field is string => Boolean(field));
    if (fields.length > 0) {
      return `Заполните обязательные поля: ${fields
        .map((field) => labelFor(field, labels))
        .join(", ")}.`;
    }
  }

  // Получатели уведомлений: "leadTelegramChats[0].chatId" …
  // Панель проверяет их до отправки, но ответ API тоже должен читаться
  // по-русски — например, когда данные завели напрямую в базе.
  match = text.match(/^"leadTelegramChats\[(\d+)\]\.chatId" is required/);
  if (match) return `Получатель ${Number(match[1]) + 1}: не заполнен chat_id.`;

  match = text.match(/^"leadTelegramChats\[(\d+)\]\.chatId" must be a numeric chat id/);
  if (match) {
    return (
      `Получатель ${Number(match[1]) + 1}: chat_id должен быть числом ` +
      "(у групп начинается с «-») или @username канала."
    );
  }

  match = text.match(
    /^"leadTelegramChats\[(\d+)\]\.label" must be no longer than (\d+) characters/,
  );
  if (match) {
    return `Получатель ${Number(match[1]) + 1}: подпись длиннее ${match[2]} символов.`;
  }

  match = text.match(/^"leadTelegramChats\[(\d+)\]" must be an object/);
  if (match) return `Получатель ${Number(match[1]) + 1} передан в неверном формате.`;

  match = text.match(/^"leadTelegramChats" must contain no more than (\d+) recipients/);
  if (match) return `Получателей больше ${match[1]} — столько сохранить нельзя.`;

  if (/^"leadTelegramChats" must be an array/.test(text)) {
    return "Список получателей передан в неверном формате.";
  }

  // Unsupported file type: text/html. Allowed: image/jpeg, ...
  match = text.match(/^Unsupported file (?:type|extension):\s*([^.]+)\./i);
  if (match) {
    return `Такой файл загрузить нельзя (${match[1].trim()}). Допустимы только растровые изображения.`;
  }
  match = text.match(/^Unsupported image format:\s*(.+)$/i);
  if (match) return `Формат изображения не поддерживается (${match[1]}).`;
  match = text.match(/^Could not process image:\s*(.+)$/i);
  if (match) return `Не удалось обработать изображение: ${match[1]}`;

  return text;
}
