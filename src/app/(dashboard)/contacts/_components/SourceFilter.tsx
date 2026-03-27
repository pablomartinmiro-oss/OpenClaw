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
            ? "bg-blue-50 text-coral"
            : "bg-muted text-slate-500 hover:bg-slate-100"
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
              ? "bg-blue-50 text-coral"
              : "bg-muted text-slate-500 hover:bg-slate-100"
          }`}
        >
          {source}
        </button>
      ))}
    </div>
  );
}
