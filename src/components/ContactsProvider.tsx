"use client";

// Контакты для клиентских компонентов.
//
// Шапка и кнопка «скопировать номер MAX» — клиентские, а контакты теперь
// приходят из базы на сервере. Прокидывать их пропсами через всё дерево
// незачем: значение одно на весь сайт и кладётся в контекст в общем layout.
//
// Вне провайдера хук отдаёт статические контакты из src/lib/site.ts — тот же
// фолбэк, что и на сервере: компонент не должен отрисовать пустой телефон.

import { createContext, useContext, type ReactNode } from "react";
import type { SiteContacts } from "@/lib/content-types";
import { CONTACTS } from "@/lib/site";

const STATIC_CONTACTS: SiteContacts = {
  phones: [...CONTACTS.phones],
  telegram: CONTACTS.telegram,
  max: CONTACTS.max,
  email: CONTACTS.email,
  address: CONTACTS.address,
};

const ContactsContext = createContext<SiteContacts | null>(null);

export function ContactsProvider({
  value,
  children,
}: {
  value: SiteContacts;
  children: ReactNode;
}) {
  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContacts(): SiteContacts {
  return useContext(ContactsContext) ?? STATIC_CONTACTS;
}
