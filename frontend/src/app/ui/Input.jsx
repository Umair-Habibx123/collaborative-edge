import PropTypes from "prop-types";
import { cn } from "./cn.js";

// Labelled input with consistent focus ring + dark mode. Forwards all native props.
const Input = ({ label, id, error, className, ...props }) => (
  <div className="w-full">
    {label && (
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
    )}
    <input
      id={id}
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400",
        "border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none",
        "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:ring-brand-900",
        error && "border-red-400 focus:border-red-500 focus:ring-red-200",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
