import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "soft" | "ghost" | "danger";
  loading?: boolean;
}

const variants = {
  primary: "bg-neutral-950 text-white hover:bg-neutral-800",
  soft: "bg-white/80 text-neutral-900 shadow-sm ring-1 ring-neutral-200 hover:bg-white",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

export const Button = ({
  children,
  className = "",
  disabled,
  loading,
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonProps>) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
  >
    {loading ? "Loading..." : children}
  </button>
);
