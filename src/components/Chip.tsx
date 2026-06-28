import Link from "next/link";

type Intent = "solid" | "outline" | "soft" | "gold";
type Size = "sm" | "md";

const INTENT: Record<Intent, string> = {
  solid: "bg-emerald-600 text-white border border-emerald-600",
  outline:
    "bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
  soft: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  gold: "bg-gold-400/15 text-gold-600 border border-gold-400/40",
};

const SIZE: Record<Size, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

type ChipProps = {
  children: React.ReactNode;
  intent?: Intent;
  size?: Size;
  href?: string;
  count?: number;
  className?: string;
  active?: boolean;
  onClick?: () => void;
};

/** Shared pill/badge used for topics, tags, filters and category labels. */
export default function Chip({
  children,
  intent = "outline",
  size = "md",
  href,
  count,
  className = "",
  active = false,
  onClick,
}: ChipProps) {
  const cls = `inline-flex items-center gap-1.5 rounded-full font-medium transition-colors ${
    SIZE[size]
  } ${active ? INTENT.solid : INTENT[intent]} ${className}`;

  const inner = (
    <>
      {children}
      {typeof count === "number" && (
        <span
          className={`ml-0.5 rounded-full px-1.5 text-[0.7em] ${
            active ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {count}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return <span className={cls}>{inner}</span>;
}
