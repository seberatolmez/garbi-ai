'use client';

import { useState } from "react";
import { Category } from "../types/types";
import { COLORS, COLOR_IDS, ColorId } from "../types/colors";

interface CategoryColorCardProps {
    category: Category;
    colorId: string;
    description: string;
    onChange: (colorId: string) => void;
}

export function CategoryColorCard({
    category,
    colorId,
    description,
    onChange
}: CategoryColorCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const numericColorId = parseInt(colorId) as ColorId;
    const currentColor = COLORS[numericColorId]?.hex || COLORS[1].hex;
    const currentColorName = COLORS[numericColorId]?.name || "Default";

    return (
        <div
            className="relative"
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Color Picker Popup */}
            <div
                role="dialog"
                aria-label={`Select color for ${category}`}
                className={`
                    absolute top-0 left-0 z-50
                    bg-white rounded-xl p-4 shadow-xl
                    border border-gray-100 min-w-[220px]
                    transition-all duration-200
                    ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}
                `}
            >
                <div className="flex items-center gap-2.5 mb-4">
                    <div
                        className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: currentColor }}
                        aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        {currentColorName}
                    </span>
                </div>
                <div
                    role="radiogroup"
                    aria-label="Available colors"
                    className="grid grid-cols-6 gap-2"
                >
                    {COLOR_IDS.map((id) => {
                        const isSelected = colorId === String(id);
                        return (
                            <button
                                key={id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={COLORS[id].name}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(String(id));
                                }}
                                className={`
                                    w-8 h-8 rounded-full
                                    transition-all duration-200
                                    hover:scale-110 cursor-pointer
                                    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                                    ${isSelected ? 'ring-2 ring-gray-800 ring-offset-2 scale-110' : ''}
                                `}
                                style={{ backgroundColor: COLORS[id].hex }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Main Card */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={`${category}: ${currentColorName}. Click to change color`}
                className="
                    w-full text-left cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/50 focus:ring-offset-2
                    rounded-xl
                "
            >
                {/* Color Block */}
                <div
                    className="
                        w-full h-28 rounded-xl
                        transition-all duration-200
                        hover:-translate-y-0.5 hover:shadow-lg
                        shadow-sm
                    "
                    style={{ backgroundColor: currentColor }}
                    aria-hidden="true"
                />

                {/* Category Info */}
                <h4 className="text-sm font-semibold text-gray-800 mt-3 mb-1">
                    {category}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                    {description}
                </p>
            </button>
        </div>
    );
}
