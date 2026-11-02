import React, { useState, useEffect, useRef } from 'react';

interface Option {
    fir_kod: string;
    naz_skr: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    isLoading?: boolean;
    onOpen?: () => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select company...",
    required = false,
    isLoading = false,
    onOpen
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState && onOpen) {
            onOpen();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.fir_kod === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.fir_kod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.naz_skr.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-violet-50 from-white to-gray-50 shadow-sm focus-within:shadow-md focus-within:border-violet-400 outline-none transition-all cursor-pointer font-medium text-gray-700 flex justify-between items-center ${isOpen ? 'ring-2 ring-violet-100 border-violet-400' : ''}`}
                onClick={handleToggle}
            >
                <div className="flex-1 truncate">
                    {selectedOption ? (
                        <span className="text-gray-900">{selectedOption.label}</span>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent"></div>
                    )}
                    {value && !isLoading && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="relative z-100 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 min-w-[300px]">
                    <div className="p-2 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                autoFocus
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all bg-white"
                                placeholder="Search by code or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {isLoading ? (
                            <div className="px-4 py-8 text-sm text-gray-400 text-center flex flex-col items-center gap-2 font-bold uppercase tracking-wide animate-pulse">
                                Loading...
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.fir_kod}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-all hover:bg-violet-50 hover:from-violet-50 hover:to-white flex flex-col gap-0.5 ${opt.fir_kod === value ? "bg-violet-50 border-l-4 border-violet-500 pl-3" : "border-l-4 border-transparent"}`}
                                    onClick={() => {
                                        onChange(opt.fir_kod);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    <div className={`font-bold ${opt.fir_kod === value ? "text-violet-700" : "text-gray-900"}`}>
                                        {opt.fir_kod}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {opt.naz_skr}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-sm text-gray-400 text-center flex flex-col items-center gap-2">
                                <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>No company found</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {required && (
                <input
                    type="text"
                    required
                    value={value}
                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0, padding: 0, border: 0, top: '50%' }}
                    readOnly
                    tabIndex={-1}
                />
            )}
        </div>
    );
};

export default SearchableSelect;
