import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm [a&]:hover:bg-destructive/90",
        success:
          "bg-success text-success-foreground shadow-sm [a&]:hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground shadow-sm [a&]:hover:bg-warning/90",
        info:
          "bg-info text-info-foreground shadow-sm [a&]:hover:bg-info/90",
        outline:
          "border-2 border-border text-foreground bg-background [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        "outline-primary":
          "border-2 border-primary text-primary bg-primary-light [a&]:hover:bg-primary [a&]:hover:text-primary-foreground",
        "outline-success":
          "border-2 border-success text-success bg-success-light [a&]:hover:bg-success [a&]:hover:text-success-foreground",
        "outline-warning":
          "border-2 border-warning text-warning bg-warning-light [a&]:hover:bg-warning [a&]:hover:text-warning-foreground",
        "outline-destructive":
          "border-2 border-destructive text-destructive bg-destructive-light [a&]:hover:bg-destructive [a&]:hover:text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
