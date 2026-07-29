"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Alert, Field, Panel, TextInput } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { AdminSiteSettings } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import {
  MAX_CHAT_LABEL_LENGTH,
  MAX_TELEGRAM_CHATS,
  toTelegramChats,
  type TelegramChat,
} from "@/lib/telegram-chats";
import {
  discoverTelegramChatsAction,
  saveLeadDeliveryAction,
  type DiscoveredChat,
  type LeadDeliveryFormValues,
} from "./actions";

/** Строка списка в форме. `key` — ключ React, на сервер не уходит. */
type ChatRow = TelegramChat & { key: string };

let rowSeq = 0;
function toRows(chats: TelegramChat[]): ChatRow[] {
  return chats.map((chat) => ({ ...chat, key: `chat-${rowSeq++}` }));
}

const secondaryButton =
  "inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-50";

export function LeadDeliveryForm({ settings }: { settings: AdminSiteSettings }) {
  const router = useRouter();

  const [rows, setRows] = useState<ChatRow[]>(() =>
    toRows(toTelegramChats(settings.leadTelegramChats)),
  );
  const [email, setEmail] = useState(settings.leadEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Устаревшее одиночное поле в интерфейсе не показываем, но молчать о нём
  // нельзя: пока список пуст, уведомления уходят именно по нему, и надпись
  // «в Telegram не уведомляем» была бы неправдой.
  const legacyChatId = settings.leadTelegramChatId?.trim() ?? "";

  function updateRow(key: string, patch: Partial<TelegramChat>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow(chat: TelegramChat = { chatId: "", label: "" }) {
    setRows((current) => [...current, { ...chat, key: `chat-${rowSeq++}` }]);
  }

  function removeRow(key: string) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const values: LeadDeliveryFormValues = {
      leadTelegramChats: rows.map(({ chatId, label }) => ({ chatId, label })),
      leadEmail: email,
    };

    startTransition(async () => {
      const result = await saveLeadDeliveryAction(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Сохранено.");
      router.refresh();
    });
  }

  const alreadyAdded = new Set(rows.map((row) => row.chatId.trim()).filter(Boolean));

  return (
    <form onSubmit={handleSubmit}>
      <Panel
        title="Куда сообщать о заявках"
        description="Заявка с сайта в любом случае сохраняется в разделе «Заявки». Здесь — куда продублировать её в Telegram и на почту."
      >
        {/* Получатели в Telegram */}
        <fieldset className="min-w-0" disabled={pending}>
          <legend className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            Получатели в Telegram
          </legend>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Уведомление уходит каждому из списка. Можно добавить и личные чаты, и общий чат
            отдела — до {MAX_TELEGRAM_CHATS} получателей. Получатели независимы: если кто-то
            заблокировал бота, остальные всё равно получат заявку.
          </p>

          <div className="mt-3 flex flex-col gap-2.5">
            {rows.length === 0 && (
              <div className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center">
                <p className="text-[13px] font-bold text-ink">Список получателей пуст</p>
                <p className="mx-auto mt-1 max-w-lg text-[13px] leading-relaxed text-ink-soft">
                  {legacyChatId
                    ? `Пока список пуст, работает старая одиночная настройка — уведомления уходят в чат ${legacyChatId}. Добавьте получателей здесь, и заявка начнёт приходить им.`
                    : "Значит, в Telegram уведомления не уходят вовсе. На сами заявки это не влияет: они всё равно попадают в раздел «Заявки», в журнал и на почту."}
                </p>
              </div>
            )}

            {rows.map((row, index) => (
              <ChatRowFields
                key={row.key}
                row={row}
                index={index}
                onChange={(patch) => updateRow(row.key, patch)}
                onRemove={() => removeRow(row.key)}
              />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButton}
              onClick={() => addRow()}
              disabled={pending || rows.length >= MAX_TELEGRAM_CHATS}
            >
              + Добавить получателя
            </button>

            <DiscoverChatsDialog
              alreadyAdded={alreadyAdded}
              disabled={pending || rows.length >= MAX_TELEGRAM_CHATS}
              onPick={(chat) => addRow(chat)}
            />
          </div>

          {rows.length >= MAX_TELEGRAM_CHATS && (
            <p className="mt-2 text-[12px] leading-snug text-burgundy/80">
              Достигнут предел — {MAX_TELEGRAM_CHATS} получателей. Чтобы добавить нового,
              удалите кого-то из списка.
            </p>
          )}
        </fieldset>

        {/* Почта */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Field
            label="Почта для уведомлений"
            htmlFor="leadEmail"
            hint="Адрес, на который придёт письмо о новой заявке."
          >
            <TextInput
              id="leadEmail"
              type="email"
              autoComplete="off"
              placeholder="zayavki@example.ru"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={pending}
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {error && (
            <Alert tone="error" title="Не удалось сохранить">
              {error}
            </Alert>
          )}
          {success && <Alert tone="success">{success}</Alert>}

          <div>
            <Button type="submit" disabled={pending} className="h-10 px-5 text-[14px]">
              {pending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Строка списка
// ---------------------------------------------------------------------------

function ChatRowFields({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: ChatRow;
  index: number;
  onChange: (patch: Partial<TelegramChat>) => void;
  onRemove: () => void;
}) {
  // Строк несколько — id полей обязаны быть уникальны, иначе <label for>
  // указывал бы на поле чужой строки.
  const uid = useId();

  return (
    <div className="rounded-brand-sm border border-line bg-warm-bg/40 p-3.5">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
        <Field
          label={`Получатель ${index + 1}: подпись`}
          htmlFor={`${uid}-label`}
          hint="Кто это — чтобы список читался. Например: «Максим», «Общий чат отдела»."
        >
          <TextInput
            id={`${uid}-label`}
            autoComplete="off"
            maxLength={MAX_CHAT_LABEL_LENGTH}
            placeholder="Общий чат отдела продаж"
            value={row.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </Field>

        <Field
          label="chat_id"
          htmlFor={`${uid}-chatId`}
          hint="Число или @username канала. У группы номер отрицательный и длинный."
        >
          <TextInput
            id={`${uid}-chatId`}
            autoComplete="off"
            placeholder="-1001234567890"
            value={row.chatId}
            onChange={(event) => onChange({ chatId: event.target.value })}
          />
        </Field>

        <div className="lg:pt-[26px]">
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-10 items-center rounded-full border border-burgundy/25 bg-white px-4 text-[13px] font-bold text-burgundy transition hover:bg-burgundy hover:text-white"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Помощник «узнать chat_id»
// ---------------------------------------------------------------------------

function DiscoverChatsDialog({
  alreadyAdded,
  disabled,
  onPick,
}: {
  alreadyAdded: Set<string>;
  disabled?: boolean;
  onPick: (chat: TelegramChat) => void;
}) {
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<DiscoveredChat[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function load() {
    setError(null);
    startTransition(async () => {
      const result = await discoverTelegramChatsAction();
      if (!result.ok) {
        setChats(null);
        setError(result.error);
        return;
      }
      setChats(result.data);
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) load();
        else {
          setChats(null);
          setError(null);
        }
      }}
    >
      <Dialog.Trigger className={secondaryButton} disabled={disabled}>
        Узнать chat_id
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-carbon/40 backdrop-blur-[2px]" />
        <Dialog.Content className="anim-modal fixed left-1/2 top-1/2 z-50 flex max-h-[min(680px,calc(100vh-32px))] w-[min(620px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-brand-sm border border-line bg-white p-5 shadow-float">
          <Dialog.Title className="text-[17px] font-extrabold tracking-tight text-ink">
            Кто недавно писал боту
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Telegram не показывает chat_id в интерфейсе, поэтому спрашиваем его у самого бота.
            Здесь — чаты, из которых боту приходили сообщения примерно за последние сутки.
            Выберите нужный, и он добавится в список получателей.
          </Dialog.Description>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
            {pending && <p className="text-[14px] text-ink-soft">Спрашиваем Telegram…</p>}

            {!pending && error && (
              <Alert tone="error" title="Не удалось получить список">
                {error}
              </Alert>
            )}

            {!pending && !error && chats?.length === 0 && (
              <Alert tone="info" title="Telegram не вернул ни одного чата">
                {
                  "Бот запоминает только те чаты, из которых ему недавно писали, — и хранит их " +
                  "около суток.\n\n" +
                  "Чтобы появился ЛИЧНЫЙ чат: откройте бота в Telegram и отправьте ему любое " +
                  "сообщение, например «Старт».\n\n" +
                  "Чтобы появился ОБЩИЙ чат: создайте группу, добавьте в неё бота и напишите в " +
                  "этой группе любое сообщение.\n\n" +
                  "После этого нажмите «Обновить»."
                }
              </Alert>
            )}

            {!pending && !error && chats && chats.length > 0 && (
              <ul className="flex flex-col gap-2">
                {chats.map((chat) => {
                  const added = alreadyAdded.has(chat.chatId);
                  return (
                    <li
                      key={chat.chatId}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-3 rounded-brand-sm border border-line bg-warm-bg/40 px-3.5 py-3",
                        added && "opacity-60",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-ink">{chat.title}</p>
                        <p className="mt-0.5 text-[12px] text-ink-soft">
                          {chat.kind} · {chat.chatId}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={added}
                        onClick={() => {
                          onPick({ chatId: chat.chatId, label: chat.title });
                          setOpen(false);
                        }}
                        className="inline-flex h-9 shrink-0 items-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {added ? "Уже в списке" : "Добавить"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={load} disabled={pending} className={secondaryButton}>
              {pending ? "Обновляем…" : "Обновить"}
            </button>
            <Dialog.Close className="inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:bg-warm-soft">
              Закрыть
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
