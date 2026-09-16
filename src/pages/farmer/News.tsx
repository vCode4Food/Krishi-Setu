import { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { news, newsCategories } from "@/data/news";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chip } from "@/components/common/Badges";
import { NewsCard } from "@/components/farmer/NewsCard";
import { Carousel } from "@/components/common/Carousel";
import { EmptyState } from "@/components/common/Card";

export default function News() {
  const [cat, setCat] = useState<string>("All");
  const featured = news.filter((n) => n.featured);

  const filtered = useMemo(
    () => (cat === "All" ? news : news.filter((n) => n.category === cat)),
    [cat],
  );

  return (
    <div>
      <PageHeader
        title="Farmer News & Advisories"
        description="Procurement updates, weather alerts, MSP changes and crop advisories — curated for your district."
      />

      {cat === "All" && featured.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-400">Featured this week</h2>
          <Carousel ariaLabel="Featured news" itemClassName="w-[85%] sm:w-[47%] lg:w-[31.5%]">
            {featured.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </Carousel>
        </section>
      )}

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        <Chip active={cat === "All"} onClick={() => setCat("All")}>All</Chip>
        {newsCategories.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Newspaper className="h-7 w-7" aria-hidden />} title="No articles in this category" body="Try another category — new stories are added daily in this demo." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
