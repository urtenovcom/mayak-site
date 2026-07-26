import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function iconSize(className = "") {
  const exact = className.match(/h-\[(\d+)px\]/);
  if (exact) return `${exact[1]}px`;
  const scale = className.match(/(?:^|\s)h-(\d+(?:\.5)?)(?:\s|$)/);
  return scale ? `${Number(scale[1]) * 4}px` : "24px";
}

function uicon(name: string) {
  function UIcon({ className = "", style, "aria-label": ariaLabel }: IconProps) {
    return (
      <i
        className={`fi fi-rr-${name} inline-flex shrink-0 items-center justify-center leading-none ${className}`}
        style={{ fontSize: iconSize(className), ...style }}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
      />
    );
  }
  UIcon.displayName = `UIcon(${name})`;
  return UIcon;
}

export const ArrowRight = uicon("arrow-right");
export const ChevronLeft = uicon("angle-small-left");
export const ChevronRight = uicon("angle-small-right");
export const Close = uicon("cross");
export const Check = uicon("check");
export const Menu = uicon("menu-burger");
export const Copy = uicon("copy");
export const Phone = uicon("phone-call");
export const Send = uicon("paper-plane");
export const Message = uicon("comment");
export const Sun = uicon("brightness");
export const Snowflake = uicon("snowflake");
export const Mail = uicon("envelope");
export const MapPin = uicon("marker");
export const Diamond = uicon("diamond");

/* Предметные иконки — единое семейство Flaticon UIcons Rounded Regular. */
export const Crane = uicon("building");
export const Briefcase = uicon("briefcase");
export const Home = uicon("home");
export const Tree = uicon("tree");
export const Wc = uicon("restroom-simple");
export const Warehouse = uicon("warehouse-alt");
export const Sparkle = uicon("sparkles");
export const Cube = uicon("cube");
export const Calendar = uicon("calendar");
export const User = uicon("user");
export const Target = uicon("target");
export const Box = uicon("square");

/* Фирменные знаки сохраняем оригинальными. */
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
  const Component = REGISTRY[name];
  return <Component {...props} />;
}
