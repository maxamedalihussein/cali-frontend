import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg shadow text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-gray-100 hover:text-blue-700",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-gray-100 hover:text-blue-700",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-white",
        outline:
          "border border-input bg-background hover:bg-gray-100 hover:text-blue-700",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-blue-700",
        ghost: "hover:bg-gray-100 hover:text-blue-700",
        link: "text-primary underline-offset-4 hover:underline hover:text-blue-700",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:text-white",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg shadow",
        sm: "h-9 rounded-lg shadow px-3",
        lg: "h-11 rounded-lg shadow px-8",
        icon: "h-10 w-10 rounded-lg shadow",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
