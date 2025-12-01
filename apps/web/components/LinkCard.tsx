import { cn } from "@linknest/utils/lib";
import { API_BASE_URL } from "@/lib/env";

export type LinkCardData = {
  id?: number;
  title: string;
  description?: string | null;
  icon?: string | null;
  url?: string;
};

type LinkCardProps = {
  link: LinkCardData;
};

function buildIconSrc(icon?: string | null) {
  if (!icon) return '';
  const trimmed = icon.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

const LinkCard = ({ link }: LinkCardProps) => {
  const fallbackInitial = (link.title || "?").trim().charAt(0).toUpperCase();
  const iconSrc = buildIconSrc(link.icon);

  const Wrapper: React.ElementType = link.url ? "a" : "div";

  return (
    <Wrapper
      href={link.url}
      target={link.url ? "_blank" : undefined}
      rel={link.url ? "noopener noreferrer" : undefined}
      className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-white/3 px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/6"
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br",
          "border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.35)]",
        )}
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={link.title}
            loading="lazy"
            className="h-7 w-7 rounded-lg object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
          />
        ) : (
          <span className="text-base font-semibold text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
            {fallbackInitial}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold leading-tight text-white group-hover:text-white">
          {link.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/60 line-clamp-2">
          {link.description}
        </p>
      </div>
    </Wrapper>
  );
};

export default LinkCard;
