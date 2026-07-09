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
