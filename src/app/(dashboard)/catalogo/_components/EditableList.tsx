"use client";

import { Plus, X } from "lucide-react";

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  inputType?: "text" | "url";
  addLabel?: string;
}

export function EditableList({
  items,
  onChange,
  placeholder = "",
  inputType = "text",
  addLabel = "+ Añadir",
}: EditableListProps) {
  const handleChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...items, ""]);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type={inputType}
            value={item}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]"
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="rounded-lg p-1.5 text-[#8A8580] hover:bg-[#E8E4DE]/50 transition-colors"
            aria-label={`Eliminar item ${i + 1}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1 text-xs font-medium text-[#E87B5A] hover:text-[#D56E4F] transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
