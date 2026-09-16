import { Clock } from "lucide-react";
import type { NewsArticle } from "@/types";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badges";

const catTone: Record<NewsArticle["category"], "green" | "amber" | "blue" | "gray"> = {
  Agriculture: "green",
  Procurement: "blue",
  Weather: "blue",
  Government: "amber",
  Markets: "amber",
  Technology: "green",
  "Crop Advisory": "green",
};

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Card hover className="flex h-full flex-col overflow-hidden">
      <div className="relative">
        <img src={article.image} alt={article.title} className="aspect-[16/8] w-full object-cover" />
        <span className="absolute left-3 top-3">
          <StatusBadge tone={catTone[article.category]} label={article.category} className="!bg-white/95" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold text-ink-400">
          {article.date} · {article.source}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-bold leading-snug text-ink-900">{article.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">{article.summary}</p>
        <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-400">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {article.readTime} min read
          </span>
          <button className="text-sm font-bold text-primary-700 hover:text-primary-800" type="button">
            Read More →
          </button>
        </div>
      </div>
    </Card>
  );
}
