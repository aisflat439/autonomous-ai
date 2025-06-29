import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

type TypographyFontSize =
  | "xs"
  | "sm"
  | "base"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl";

type TypographyFontWeight = "thin" | "normal" | "bold";
type TypographyColor =
  | "default"
  | "muted"
  | "primary"
  | "secondary"
  | "destructive";

// extend type of props to include html attributes for the element
interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
  variant?: `${TypographyFontSize}/${TypographyFontWeight}`;
  color?: TypographyColor;
}

const typographyVariants = cva("font-normal", {
  variants: {
    variant: {
      // xs
      "xs/thin": "text-xs font-light",
      "xs/normal": "text-xs font-normal",
      "xs/bold": "text-xs font-bold",

      // sm
      "sm/thin": "text-xs font-light sm:text-sm",
      "sm/normal": "text-xs font-normal sm:text-sm",
      "sm/bold": "text-xs font-bold sm:text-sm",

      // base
      "base/thin": "text-sm font-light sm:text-md",
      "base/normal": "text-sm font-normal sm:text-md",
      "base/bold": "text-sm font-bold sm:text-md",

      // md
      "md/thin": "text-sm font-light md:text-md",
      "md/normal": "text-sm font-normal md:text-md",
      "md/bold": "text-sm font-bold md:text-md",

      // lg
      "lg/thin": "text-md font-light md:text-lg",
      "lg/normal": "text-md font-normal md:text-lg",
      "lg/bold": "text-md font-bold md:text-lg",

      // xl
      "xl/thin": "text-lg font-light md:text-xl",
      "xl/normal": "text-lg font-normal md:text-xl",
      "xl/bold": "text-lg font-bold md:text-xl",

      // 2xl
      "2xl/thin": "text-lg font-light sm:text-xl md:text-2xl",
      "2xl/normal": "text-lg font-normal sm:text-xl md:text-2xl",
      "2xl/bold": "text-lg font-bold sm:text-xl md:text-2xl",

      // 3xl
      "3xl/thin": "text-xl font-light sm:text-2xl md:text-3xl",
      "3xl/normal": "text-xl font-normal sm:text-2xl md:text-3xl",
      "3xl/bold": "text-xl font-bold sm:text-2xl md:text-3xl",

      // 4xl
      "4xl/thin": "text-2xl font-light sm:text-3xl md:text-4xl",
      "4xl/normal": "text-2xl font-normal sm:text-3xl md:text-4xl",
      "4xl/bold": "text-2xl font-bold sm:text-3xl md:text-4xl",

      // 5xl
      "5xl/thin": "text-3xl font-light sm:text-4xl md:text-5xl",
      "5xl/normal": "text-3xl font-normal sm:text-4xl md:text-5xl",
      "5xl/bold": "text-3xl font-bold sm:text-4xl md:text-5xl",

      // 6xl
      "6xl/thin": "text-4xl font-light sm:text-5xl md:text-6xl",
      "6xl/normal": "text-4xl font-normal sm:text-5xl md:text-6xl",
      "6xl/bold": "text-4xl font-bold sm:text-5xl md:text-6xl",

      // 7xl
      "7xl/thin": "text-5xl font-light sm:text-6xl md:text-7xl",
      "7xl/normal": "text-5xl font-normal sm:text-6xl md:text-7xl",
      "7xl/bold": "text-5xl font-bold sm:text-6xl md:text-7xl",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "md/normal",
    color: "default",
  },
});

function Typography({
  as = "p",
  variant = "base/normal",
  color = "default",
  className,
  ...props
}: TypographyProps) {
  const Comp = as;

  return (
    <Comp
      className={cn(
        "text-balance",
        typographyVariants({ variant, color }),
        className
      )}
      {...props}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Typography, type TypographyProps, typographyVariants };
