"use client";

interface SourceFilterProps {
  sources: string[];
  selected: string | null;
  onSelect: (source: string | null) => void;
}

export function SourceFilter({ sources, selected, onSelect }: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onSelect(null)}
        type="button"
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          selected === null
            ? "bg-coral-light text-coral"
            : "bg-muted text-text-secondary hover:bg-warm-muted"
        }`}
      >
        Todos
      </button>
      {sources.map((source) => (
        <button
          key={source}
          onClick={() => onSelect(source === selected ? null : source)}
          type="button"
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            source === selected
              ? "bg-coral-light text-coral"
              : "bg-muted text-text-secondary hover:bg-warm-muted"
          }`}
        >
          {source}
        </button>
      ))}
    </div>
  );
}
