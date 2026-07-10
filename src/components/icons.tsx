import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const ChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Phone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h3l1.5 4-2 1.5a12 12 0 005 5l1.5-2 4 1.5V20a1 1 0 01-1 1A16 16 0 014 6a1 1 0 011-2z" />
  </svg>
);

export const Send = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 4L3 11l6 2 2 6 10-15z" />
    <path d="M9 13l4-4" />
  </svg>
);

export const Message = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5h16v11H9l-4 3v-3H4z" />
  </svg>
);

/* Фирменные иконки мессенджеров (из шапки bk-resurs), fill=currentColor */
export const Telegram = (p: IconProps) => (
  <svg viewBox="0 0 22.6196 18.9356" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...p}>
    <path d="M12.0601 14.8614C11.2101 15.7114 10.3101 16.5114 9.46007 17.3614C9.16007 17.6614 8.81007 17.8114 8.41007 17.8114C8.11007 17.8114 7.96007 17.6614 7.86007 17.4114C7.21007 15.4114 6.56007 13.3614 5.91007 11.3614C5.86007 11.1614 5.76007 11.0614 5.56007 11.0114C4.01007 10.5114 2.46007 10.0114 0.96007 9.51136C0.71007 9.41136 0.51007 9.36136 0.26007 9.21136C-0.0399305 9.01136 -0.0899305 8.66136 0.16007 8.41136C0.41007 8.16136 0.710069 7.96135 1.06007 7.86135C2.96007 7.11135 4.81007 6.41136 6.71007 5.66136C11.5101 3.81135 16.3101 1.96136 21.1101 0.111355C22.0101 -0.238645 22.7101 0.261355 22.6101 1.26136C22.5601 1.91136 22.4101 2.51136 22.2601 3.11136C21.2101 8.01136 20.1601 12.9114 19.1601 17.8114C18.9101 18.9614 18.1101 19.2614 17.1601 18.5614C15.5601 17.3614 13.9601 16.2114 12.3601 15.0114C12.2101 14.9614 12.1601 14.9114 12.0601 14.8614ZM8.46007 16.3614H8.51007C8.51007 16.3114 8.51007 16.2614 8.56007 16.2114C8.66007 15.1114 8.76007 14.0114 8.86007 12.8614C8.86007 12.6114 8.96007 12.4614 9.16007 12.2614C10.6601 10.9614 12.1101 9.61136 13.5601 8.26136C15.2101 6.81136 16.8101 5.31136 18.4601 3.86136C18.5101 3.81136 18.5601 3.61136 18.6601 3.51136C18.5101 3.51136 18.3601 3.41136 18.2101 3.46136C18.0101 3.51136 17.8101 3.61136 17.6601 3.71136C14.0601 6.01136 10.4601 8.26136 6.86007 10.5114C6.66007 10.6614 6.61007 10.7614 6.71007 10.9614C6.96007 11.7114 7.21007 12.5114 7.46007 13.2614C7.76007 14.3114 8.11007 15.3114 8.46007 16.3614Z" />
  </svg>
);

export const Max = (p: IconProps) => (
  <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...p}>
    <path fillRule="evenodd" clipRule="evenodd" d="M10.3183 4.93513C7.70177 4.79739 5.65991 6.61997 5.20965 9.47262C4.83678 11.835 5.49787 14.7135 6.06334 14.8584C6.30318 14.9198 6.88033 14.4767 7.30025 14.0792C7.37919 14.0045 7.49856 13.9919 7.59114 14.0487C8.24571 14.4505 8.98681 14.7525 9.80384 14.7955C12.49 14.9369 14.8705 12.8265 15.0112 10.1297C15.1519 7.43299 13.0045 5.07653 10.3183 4.93513ZM5.93672 18.6302C5.83542 18.5582 5.69584 18.5778 5.61093 18.6687C4.47613 19.8837 1.57188 20.7359 1.43885 19.0776C1.43885 17.7783 1.14814 16.6835 0.828068 15.478C0.43606 14.0016 0 12.3593 0 9.97239C0 4.28055 4.65015 0 10.1637 0C15.6772 0 20 4.48954 20 10.0277C20 15.5658 15.5396 19.9448 10.2158 19.9448C8.32709 19.9448 7.41055 19.6777 5.93672 18.6302Z" />
  </svg>
);

export const Sun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

export const Snowflake = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5L4.2 16.5M12 6l2-2M12 6l-2-2M12 18l2 2M12 18l-2 2" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export const MapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const Diamond = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l4 4-4 14L8 7z" />
    <path d="M4 9h16" />
  </svg>
);

/* —— Иконки направлений —— */

export const Crane = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 21V5l13 3" />
    <path d="M6 8h13" />
    <path d="M10 8V21" />
    <path d="M19 8v3l-2 2" />
    <path d="M16 16h2v2h-2z" />
  </svg>
);

export const Briefcase = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
    <path d="M3 12h18" />
  </svg>
);

export const Home = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 11l8-6 8 6" />
    <path d="M6 10v10h12V10" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const Tree = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7z" />
    <path d="M12 16v5" />
  </svg>
);

export const Wc = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
    <path d="M5.5 8h3l1 6H8v6H6v-6H4.5l1-6z" />
    <path d="M16 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
    <path d="M14 20v-4h-1l1.5-6h3L20 16h-1v4h-2v-4h-1v4z" />
  </svg>
);

export const Warehouse = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 21V8l9-4 9 4v13" />
    <path d="M7 21v-7h10v7" />
    <path d="M7 17h10" />
  </svg>
);

export const Sparkle = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </svg>
);

/* —— Иконки статистики —— */

export const Cube = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
    <path d="M4 7.5l8 4.5 8-4.5" />
    <path d="M12 12v9" />
  </svg>
);

export const Calendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 9h16M8 3v4M16 3v4" />
  </svg>
);

export const User = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0114 0" />
  </svg>
);

export const Target = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </svg>
);

export const Box = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const REGISTRY = {
  crane: Crane,
  briefcase: Briefcase,
  home: Home,
  tree: Tree,
  wc: Wc,
  warehouse: Warehouse,
  sparkle: Sparkle,
  cube: Cube,
  calendar: Calendar,
  user: User,
  target: Target,
} as const;

export type IconName = keyof typeof REGISTRY;

export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const Cmp = REGISTRY[name];
  return <Cmp {...props} />;
}
