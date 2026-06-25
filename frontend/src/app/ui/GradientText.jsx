import PropTypes from "prop-types";
import { cn } from "./cn.js";

// Heading text painted with the signature brand gradient.
const GradientText = ({ as: Comp = "span", className, children, ...props }) => (
  <Comp className={cn("text-gradient-brand font-bold", className)} {...props}>
    {children}
  </Comp>
);

GradientText.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default GradientText;
