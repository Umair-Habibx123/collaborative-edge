import PropTypes from "prop-types";
import { cn } from "./cn.js";

// Vibrant, theme-aware button. Variants: primary (gradient), secondary, outline, ghost, danger.
const VARIANTS = {
  primary:
    "bg-gradient-brand text-white shadow-glow hover:brightness-110 active:brightness-95 border-transparent",
  secondary:
    "bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:hover:bg-brand-900/60 border-transparent",
  outline:
    "bg-transparent text-brand-700 border-brand-300 hover:bg-brand-50 dark:text-brand-200 dark:border-brand-700 dark:hover:bg-brand-900/30",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border-transparent",
  danger:
    "bg-red-500 text-white hover:bg-red-600 border-transparent",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3 text-base gap-2.5",
};

const Button = ({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => (
  <Comp
    className={cn(
      "inline-flex items-center justify-center rounded-xl border font-semibold cursor-pointer",
      "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100",
      VARIANTS[variant],
      SIZES[size],
      className
    )}
    {...props}
  >
    {children}
  </Comp>
);

Button.propTypes = {
  as: PropTypes.elementType,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "ghost", "danger"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Button;
