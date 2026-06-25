import PropTypes from "prop-types";
import { cn } from "./cn.js";

// Surface container with consistent radius/border/shadow across light & dark.
const Card = ({ className, hover = false, children, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border bg-white border-slate-200 shadow-sm",
      "dark:bg-slate-900 dark:border-slate-800",
      hover && "transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Card.propTypes = {
  className: PropTypes.string,
  hover: PropTypes.bool,
  children: PropTypes.node,
};

export default Card;
