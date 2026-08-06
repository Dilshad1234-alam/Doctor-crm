import Link from "next/link";
import { cn } from "@/frontend/utils/cn";

export default function Button({ children, href, className, variant = "primary", ...props }) {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0";
  
  const variants = {
    primary: "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20 hover:shadow-teal-500/40 focus:ring-teal-500 border border-transparent",
    secondary: "bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-500 border border-transparent",
    outline: "border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:border-gray-300 focus:ring-teal-500",
  };

  const classes = cn(baseStyles, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
