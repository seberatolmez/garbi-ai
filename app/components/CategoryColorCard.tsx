'use client';

import { useState } from "react";
import { COLORS } from "../types/colors";

type Category =
    | "Team Meeting"
    | "Work"
    | "Personal"
    | "External Meeting"
    | "Travel & Breaks"
    | "Other";

interface CategoryColorCardProps {
    category: Category;
    colorId: string;
    description: string;
    onChange: (colorId: string) => void;
}

// Get color IDs as number keys
const colorIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
type ColorId = (typeof colorIds)[number];

export function CategoryColorCard({
    category,
    colorId,
    description,
    onChange
}: CategoryColorCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const numericColorId = parseInt(colorId) as ColorId;
    const currentColor = COLORS[numericColorId]?.hex || COLORS[1].hex;

    return (
        <div
            className="relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Color Picker Popup */}
            <div className={`
                absolute top-0 left-0 z-50 bg-white rounded-lg p-3 shadow-lg border border-gray-200 min-w-[200px]
                transition-all duration-200
                ${isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'}
            `}>
                <div className="flex items-center gap-2.5 mb-3">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: currentColor }}
                    />
                    <span className="text-sm text-gray-600">Calendar color</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {colorIds.map((id) => (
                        <button
                            key={id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(String(id));
                            }}
                            className={`
                                w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer
                                ${colorId === String(id) ? 'ring-2 ring-gray-700 ring-offset-1' : ''}
                            `}
                            style={{ backgroundColor: COLORS[id].hex }}
                        />
                    ))}
                </div>
            </div>

            {/* Color Block */}
            <div
                className="w-full h-28 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: currentColor }}
            />

            {/* Category Info */}
            <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-1">{category}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
    );
}
