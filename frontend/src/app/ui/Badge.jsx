import PropTypes from "prop-types";
import { cn } from "./cn.js";

const TONES = {
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const Badge = ({ tone = "brand", className, children, ...props }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium",
      TONES[tone],
      className
    )}
    {...props}
  >
    {children}
  </span>
);

Badge.propTypes = {
  tone: PropTypes.oneOf(["brand", "success", "warning", "danger", "neutral"]),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Badge;
