import Image from "next/image";
import { cn } from "@linknest/utils/lib";

export type LinkCardData = {
  title: string;
  description: string;
  icon: string;
  iconBg?: string;
};

type LinkCardProps = {
  link: LinkCardData;
};

const LinkCard = ({ link }: LinkCardProps) => {
  return (
    <article className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-white/3 px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/6">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br",
          link.iconBg ?? "from-slate-800 to-slate-900",
          "border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.35)]",
        )}
      >
        <Image
          src={link.icon}
          alt={link.title}
          width={28}
          height={28}
          className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
        />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold leading-tight text-white group-hover:text-white">
          {link.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/60 line-clamp-2">{link.description}</p>
      </div>
    </article>
  );
};

export default LinkCard;
