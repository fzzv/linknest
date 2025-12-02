import { cn } from "@linknest/utils/lib";
import { Tooltip } from "@linknest/ui";
import { useState, type MouseEventHandler } from "react";
import { API_BASE_URL } from "@/lib/env";

export type LinkCardData = {
  id?: number;
  title: string;
  description?: string | undefined;
  icon?: string | undefined;
  url?: string;
};

type LinkCardProps = {
  link: LinkCardData;
  className?: string;
  onContextMenu?: MouseEventHandler<HTMLElement>;
};

function buildIconSrc(icon?: string | undefined) {
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

const LinkCard = ({ link, className, onContextMenu }: LinkCardProps) => {
  const fallbackInitial = (link.title || "?").trim().charAt(0).toUpperCase();
  const iconSrc = buildIconSrc(link.icon);
  // 便于图片加载错误处理
  const [finalIconSrc, setFinalIconSrc] = useState(iconSrc);

  const Wrapper: React.ElementType = link.url ? "a" : "div";

  return (
    <Wrapper
      href={link.url}
      target={link.url ? "_blank" : undefined}
      rel={link.url ? "noopener noreferrer" : undefined}
      className={cn(
        "card card-side bg-base-100 shadow-sm",
        className,
      )}
      onContextMenu={onContextMenu}
    >
      <figure className="shrink-0 basis-24">
        {iconSrc ? (
          <img
            src={finalIconSrc}
            alt={link.title}
            loading="lazy"
            className="h-24 w-24 rounded-lg object-cover"
            onError={() => setFinalIconSrc('/ghost.svg')}
          />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center text-2xl font-semibold text-white/90 shadow-sm">
            {fallbackInitial}
          </span>
        )}
      </figure>
      <div className="card-body">
        <Tooltip content={link.title} className="block w-full" variant="primary">
          <h3 className="text-base font-semibold leading-tight text-white group-hover:text-white line-clamp-1">
            {link.title}
          </h3>
        </Tooltip>
        <Tooltip content={link.description} className="block w-full">
          <p className="text-sm leading-relaxed text-white/60 line-clamp-1">
            {link.description}
          </p>
        </Tooltip>
      </div>
    </Wrapper>
  );
};

export default LinkCard;
