import PropTypes from "prop-types";
import Card from "./Card.jsx";
import { cn } from "./cn.js";

// Dashboard metric tile: label + big value + hint, with an accent icon chip.
// Replaces the repeated, theme-ternary-heavy stat markup in dashboards.
const ACCENTS = {
  brand: "text-brand-500 bg-brand-100 dark:bg-brand-900/40",
  green: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40",
  amber: "text-amber-500 bg-amber-100 dark:bg-amber-900/40",
  fuchsia: "text-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900/40",
};

const StatCard = ({ label, value, hint, icon: Icon, accent = "brand", labelIcon: LabelIcon }) => (
  <Card hover className="p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          {LabelIcon && <LabelIcon className="h-4 w-4" />}
          {label}
        </p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {hint && (
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
        )}
      </div>
      {Icon && (
        <div className={cn("rounded-xl p-3", ACCENTS[accent])}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  </Card>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
  hint: PropTypes.node,
  icon: PropTypes.elementType,
  labelIcon: PropTypes.elementType,
  accent: PropTypes.oneOf(["brand", "green", "amber", "fuchsia"]),
};

export default StatCard;
