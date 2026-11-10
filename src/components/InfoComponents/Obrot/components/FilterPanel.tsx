import React from "react";

type Tag = { value: string; label: string };

type FilterColumnProps = {
    title: string;
    tags: Tag[];
    items: Tag[];
    searchValue: string;
    onSearchChange: (val: string) => void;
    onToggle: (val: string) => void;
    onClear: () => void;
    placeholder?: string;
};

export const FilterColumn = ({
    title,
    tags,
    items,
    searchValue,
    onSearchChange,
    onToggle,
    onClear,
    placeholder = "Search...",
}: FilterColumnProps) => {
    return (
        <div className="w-full space-y-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">{title}</div>

            {/* Tag input box */}
            <div className="relative mb-2 border rounded-xl px-2 py-1 flex flex-wrap gap-1 min-h-[42px] bg-white shadow-inner">
                {tags.map((tag) => (
                    <div
                        key={tag.value}
                        className="bg-green-50 border border-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                        {tag.label}
                        <button
                            className="ml-1 text-red-500 hover:text-red-700"
                            onClick={() => onToggle(tag.value)}
                            aria-label={`Remove ${tag.label}`}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <input
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 outline-none bg-transparent text-sm py-1 px-1 min-w-[100px]"
                />
            </div>

            {/* Dropdown list */}
            <div className="max-h-40 overflow-y-auto scrollbar-hide rounded-xl border border-gray-100 shadow-sm bg-white">
                {items.length === 0 ? (
                    <div className="py-4 text-center text-[10px] font-semibold text-gray-300 uppercase tracking-wide">
                        No results
                    </div>
                ) : (
                    items.map((item) => {
                        const isSelected = tags.some((t) => t.value === item.value);
                        return (
                            <button
                                key={item.value}
                                onClick={() => onToggle(item.value)}
                                className={`w-full text-left px-3 py-2 text-xs font-bold transition-all border-b border-gray-50 last:border-0 ${isSelected
                                    ? "bg-green-50 text-green-700"
                                    : "hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                {item.label}
                            </button>
                        );
                    })
                )}
            </div>

            {/* Clear button */}
            {tags.length > 0 && (
                <button
                    onClick={onClear}
                    className="text-[10px] font-semibold text-red-400 hover:text-red-600 uppercase tracking-wide flex items-center gap-1 px-1 transition-colors"
                >
                    ✕ Clear
                </button>
            )}
        </div>
    );
};

type FilterPanelProps = {
    children: React.ReactNode;
};

export const FilterPanel = ({ children }: FilterPanelProps) => {
    return (
        <div className="w-full max-w-6xl mt-4 animate-in fade-in slide-in-from-top-4 duration-300 mb-8">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200">
                {children}
            </div>
        </div>
    );
};
