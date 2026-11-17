import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#3C22BB] text-white hover:bg-[#2E1994] shadow-xs active:bg-[#2E1994]",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-xs",
        outline: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 shadow-xs",
        secondary: "bg-[#065F46] text-white hover:bg-[#044a36] shadow-xs",
        accent: "bg-[#D97706] text-white hover:bg-[#b45309] shadow-xs",
        soft: "bg-[#3C22BB]/10 text-[#3C22BB] border border-[#3C22BB]/20 hover:bg-[#3C22BB]/20",
        ghost: "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900",
        link: "text-[#3C22BB] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariant = VariantProps<typeof buttonVariants>

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariant {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
