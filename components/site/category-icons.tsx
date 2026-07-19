import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

const InteractionIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 11.5 4 4l7.5 5L13 4l2 6.5L21 12l-6 2 1.5 6-4.5-4L7 20l2-8.5Z" />
  </svg>
);
const CarouselsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="7" y="6" width="10" height="12" rx="1.5" />
    <path d="M3 8v8M21 8v8" />
  </svg>
);
const TypographyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 6V4h14v2M12 4v16M9 20h6" />
  </svg>
);
const BackgroundsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 15c3-4 6 2 9-2s6 0 9-3" />
  </svg>
);
const ButtonsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="8" width="18" height="8" rx="4" />
    <path d="m14 12 5 5m0-3.5V17h-3.5" strokeWidth={1.4} />
  </svg>
);
const SectionsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
  </svg>
);
const LayoutIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 10h18M10 10v11" />
  </svg>
);
const UtilitiesIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14.5 6.5a4 4 0 0 0-5.6 4.9L4 16.3V20h3.7l4.9-4.9a4 4 0 0 0 4.9-5.6l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
  </svg>
);
const DataIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
  </svg>
);
const NavigationIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m3 11 18-7-7 18-2.5-8.5L3 11Z" />
  </svg>
);
const FormsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 9h6M7 13h10" />
  </svg>
);
const CmsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </svg>
);
const EmbedsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m8 8-5 4 5 4M16 8l5 4-5 4M13 5l-2 14" />
  </svg>
);

export const CATEGORY_ICONS: Record<string, ComponentType<IconProps>> = {
  interaction: InteractionIcon,
  carousels: CarouselsIcon,
  typography: TypographyIcon,
  backgrounds: BackgroundsIcon,
  buttons: ButtonsIcon,
  sections: SectionsIcon,
  layout: LayoutIcon,
  utilities: UtilitiesIcon,
  data: DataIcon,
  navigation: NavigationIcon,
  forms: FormsIcon,
  cms: CmsIcon,
  embeds: EmbedsIcon,
};
