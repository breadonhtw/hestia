import { useMemo } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Creator } from "@/types/creator";

interface Props {
  creators: Creator[];
  renderCard: (creator: Creator, index: number) => JSX.Element;
  onEndReached?: () => void;
}

function useColumnCount() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;
  if (width >= 1024) return 3; // lg
  if (width >= 768) return 2; // md
  return 1; // sm
}

export function VirtualizedCreatorGrid({ creators, renderCard, onEndReached }: Props) {
  const colCount = useColumnCount();
  const rows = useMemo(() => {
    const r: Creator[][] = [];
    for (let i = 0; i < creators.length; i += colCount) {
      r.push(creators.slice(i, i + colCount));
    }
    return r;
  }, [creators, colCount]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    // Dynamic height estimate: card (~420px) + gap (32px) + buffer (20px) = 472px
    // Buffer accounts for badges, longer names, and content variations
    estimateSize: () => 472,
    overscan: 6,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Trigger end reached when near the end
  if (onEndReached && virtualItems.length) {
    const last = virtualItems[virtualItems.length - 1]?.index ?? 0;
    if (last >= rows.length - 3) {
      onEndReached();
    }
  }

  return (
    <div style={{ position: "relative", height: rowVirtualizer.getTotalSize() }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        {virtualItems.map((vi) => {
          const row = rows[vi.index] || [];
          return (
            <div
              key={vi.key}
              style={{ transform: `translateY(${vi.start}px)`, position: "absolute", width: "100%" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {row.map((creator, i) => renderCard(creator, vi.index * colCount + i))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

