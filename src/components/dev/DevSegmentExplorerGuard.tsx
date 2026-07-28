"use client";

/**
 * Обход бага Next.js 16.2.9 (только dev-режим, прод-сборки не касается).
 *
 * Dev-overlay складывает пути файлов-сегментов в trie, у которого `children` —
 * обычный объектный литерал `{}` (см. `next/dist/next-devtools/dev-overlay/
 * segment-explorer-trie.d.ts` и скомпилированный код в
 * `next/dist/compiled/next-devtools/index.js`):
 *
 *     for (const part of pagePath.split("/")) {
 *       node.children[part] || (node.children[part] = { value: undefined, children: {} });
 *       node = node.children[part];
 *     }
 *
 * Для сегмента с именем `constructor` выражение `children["constructor"]`
 * возвращает унаследованный `Object.prototype.constructor`, то есть функцию
 * `Object`. Она истинна — новый узел не создаётся, обход «проваливается» в саму
 * функцию `Object`, у которой нет `children`, и следующая итерация падает:
 *
 *     TypeError: Cannot read properties of undefined (reading 'page.tsx')
 *
 * Вставка в trie вызывается из `useLayoutEffect` внутри дерева приложения
 * (`SegmentViewNode` → `SegmentTrieNode`), поэтому исключение роняет всю
 * страницу `/constructor`. В прод-сборке dev-overlay не подключается — там
 * страница работает.
 *
 * Здесь мы оборачиваем только два метода dispatcher'а, отвечающих за trie.
 * Единственное последствие: маршруты с «зарезервированными» именами сегментов
 * не показываются в Segment Explorer. Ни на рендер, ни на прод это не влияет.
 */

type Dispatcher = Record<string, unknown>;

const GUARDED_METHODS = [
  "segmentExplorerNodeAdd",
  "segmentExplorerNodeRemove",
] as const;

if (process.env.NODE_ENV !== "production") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const devtools = require("next/dist/compiled/next-devtools") as {
      dispatcher?: Dispatcher;
    };
    const dispatcher = devtools?.dispatcher;

    if (dispatcher && !dispatcher.__mayakSegmentExplorerGuarded) {
      dispatcher.__mayakSegmentExplorerGuarded = true;

      for (const method of GUARDED_METHODS) {
        const original = dispatcher[method];
        if (typeof original !== "function") continue;

        dispatcher[method] = (...args: unknown[]) => {
          try {
            return (original as (...a: unknown[]) => unknown).apply(
              dispatcher,
              args,
            );
          } catch {
            // Segment Explorer не смог построить узел — молча пропускаем,
            // страница должна продолжать работать.
            return undefined;
          }
        };
      }
    }
  } catch {
    // Dev-overlay недоступен (например, отключён) — обход не нужен.
  }
}

export function DevSegmentExplorerGuard() {
  return null;
}
