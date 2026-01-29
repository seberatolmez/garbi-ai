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
    "Team Meeting": "3",
    "Work": "2",
    "Personal": "4",
    "Travel & Breaks": "6",
    "External Meeting": "9",
    "Other": "1"
};

const CATEGORIES: Category[] = [
    "Team Meeting",
    "Work",
    "Personal",
    "Travel & Breaks",
    "External Meeting",
    "Other"
];

export function CategoryColorSection({
    categoryColors,
    onChange
}: CategoryColorSectionProps) {
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
        <div
            role="region"
            aria-label="Category colors configuration"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
            {CATEGORIES.map(category => (
                <CategoryColorCard
                    key={category}
                    category={category}
                    colorId={getColorForCategory(category)}
                    description={CATEGORY_DESCRIPTIONS[category]}
                    onChange={(colorId) => handleColorChange(category, colorId)}
                />
            ))}
        </div>
    );
}
