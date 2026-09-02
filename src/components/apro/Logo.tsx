import { cn } from "@/lib/utils";

/**
 * Logo APRO Hygiène.
 * - `full` : logotype complet (ratio 937x514 préservé via width auto + hauteur fixe)
 * - `mark` : pastille icône, pour la sidebar réduite / les petites tailles
 * Aucune déformation : on ne contraint qu'une seule dimension à la fois.
 */
export function AproLogo({ className, height = 34 }: { className?: string; height?: number }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)} style={{ height }}>
      <img
        src="/apro-logo.png"
        alt="APRO Hygiène"
        style={{ height, width: "auto" }}
        className="block max-w-full object-contain dark:hidden"
      />
      <img
        src="/apro-logo-dark.png"
        alt=""
        aria-hidden
        style={{ height, width: "auto" }}
        className="hidden max-w-full object-contain dark:block"
      />
    </span>
  );
}

export function AproMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-[3px] shadow-[0_6px_18px_-8px_color-mix(in_oklab,var(--accent)_80%,transparent)] dark:bg-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/apro-icon.png"
        alt="APRO Hygiène"
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
