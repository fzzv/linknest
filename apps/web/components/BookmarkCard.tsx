import Image from "next/image";
import { cn } from "@linknest/utils/lib";

export interface BookmarkCardData {
  title: string;
  description: string;
  image: string;
  gradient: string;
}

interface BookmarkCardProps {
  card: BookmarkCardData;
}

const BookmarkCard = ({ card }: BookmarkCardProps) => {
  return (
    <article className="rounded-3xl border border-white/5 bg-white/2 p-5 text-white transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/4">
      <div className={cn("relative mb-5 aspect-4/3 overflow-hidden rounded-[26px] bg-linear-to-br", card.gradient)}>
        <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-white/15 bg-black/10 backdrop-blur">
          <Image
            src={card.image}
            alt={card.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-contain p-8 mix-blend-screen"
          />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-white">{card.title}</p>
        <p className="text-sm leading-relaxed text-white/65">{card.description}</p>
      </div>
    </article>
  );
};

export default BookmarkCard;

