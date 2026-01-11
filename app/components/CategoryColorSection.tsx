'use client';

import { Category, CategoryColor } from "../types/types";
import { CategoryColorCard } from "./CategoryColorCard";

interface CategoryColorSectionProps {
    categoryColors: CategoryColor[];
    onChange: (colors: CategoryColor[]) => void;
}

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
    "Team Meeting": "Meetings with 2+ people within your organization",
    "Work": "Solo work, including Focus Time and work Habits & Tasks",
    "Personal": "Personal time, including personal Habits & Tasks",
    "Travel & Breaks": "Flights, travel, and Buffer Time",
    "External Meeting": "Meetings with people outside your organization",
    "Other": "Events that don't fit into other categories"
};

const DEFAULT_COLORS: Record<Category, string> = {
    "Team Meeting": "3",  // purple
    "Work": "2",          // green
    "Personal": "4",      // light red
    "Travel & Breaks": "6", // orange
    "External Meeting": "9", // deep blue
    "Other": "1"          // blue
};

export function CategoryColorSection({
    categoryColors,
    onChange
}: CategoryColorSectionProps) {
    const categories: Category[] = [
        "Team Meeting",
        "Work",
        "Personal",
        "Travel & Breaks",
        "External Meeting",
        "Other"
    ];

    const getColorForCategory = (category: Category): string => {
        const found = categoryColors.find(c => c.category === category);
        return found?.color || DEFAULT_COLORS[category];
    };

    const handleColorChange = (category: Category, colorId: string) => {
        const existing = categoryColors.find(c => c.category === category);
        if (existing) {
            onChange(categoryColors.map(c =>
                c.category === category ? { ...c, color: colorId } : c
            ));
        } else {
            onChange([...categoryColors, { category, color: colorId }]);
        }
    };

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Category Colors</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Customize how Garbi colors your calendar events. Each category represents a different
                    type of event that Garbi creates or recognizes. Tap on a category to change its color.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map(category => (
                    <CategoryColorCard
                        key={category}
                        category={category}
                        colorId={getColorForCategory(category)}
                        description={CATEGORY_DESCRIPTIONS[category]}
                        onChange={(colorId) => handleColorChange(category, colorId)}
                    />
                ))}
            </div>
        </div>
    );
}
