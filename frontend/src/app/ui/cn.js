// Tiny classnames joiner — filters falsy values so conditional classes stay readable.
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
