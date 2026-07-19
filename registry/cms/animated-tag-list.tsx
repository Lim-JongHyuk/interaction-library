"use client";

// deps: motion
import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface CmsPost {
  title: string;
  tag: string;
}

export interface AnimatedTagListProps {
  posts?: CmsPost[];
}

const DEFAULT_POSTS: CmsPost[] = [
  { title: "Designing motion specs", tag: "Engineering" },
  { title: "Why we chose Tailwind v4", tag: "Engineering" },
  { title: "A new visual language", tag: "Design" },
  { title: "Shipping the catalog page", tag: "Product" },
  { title: "Accessible by default", tag: "Design" },
  { title: "Our Q3 roadmap", tag: "Product" },
];

export function AnimatedTagList({ posts = DEFAULT_POSTS }: AnimatedTagListProps) {
  const reducedMotion = useReducedMotion();
  const layoutId = useId();
  const tags = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.tag)))], [posts]);
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? posts : posts.filter((p) => p.tag === active);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActive(tag)}
            className="relative rounded-full px-3 py-1.5 text-xs font-medium"
          >
            {active === tag && (
              <motion.span
                layoutId={`tag-pill-${layoutId}`}
                className="absolute inset-0 rounded-full bg-accent"
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className={"relative z-10 " + (active === tag ? "text-accent-foreground" : "text-muted-foreground")}>
              {tag}
            </span>
          </button>
        ))}
      </div>

      <motion.ul layout className="flex flex-col gap-1.5">
        {filtered.map((post) => (
          <motion.li
            key={post.title}
            layout
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm"
          >
            <span>{post.title}</span>
            <span className="text-xs text-muted-foreground">{post.tag}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
