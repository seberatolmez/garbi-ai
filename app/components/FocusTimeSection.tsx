'use client';

import { FocusTimePreference, ChronoType } from "../types/types";
import { Sun, Sunrise, Sunset, Moon, LucideIcon } from "lucide-react";
import { ToggleButtonGroup } from "./ui/ToggleButtonGroup";
import { TimeRangeInput } from "./ui/TimeRangeInput";
import { SubSection } from "./ui/SectionCard";

interface FocusTimeSectionProps {
    focusTimePreference: FocusTimePreference;
    onChange: (preference: FocusTimePreference) => void;
}

const CHRONO_TYPES: { value: ChronoType; label: string; icon: LucideIcon }[] = [
    { value: "morning", label: "Morning", icon: Sunrise },
    { value: "afternoon", label: "Afternoon", icon: Sun },
    { value: "evening", label: "Evening", icon: Sunset },
    { value: "night", label: "Night", icon: Moon },
];

const INTERRUPTION_OPTIONS = [
    { value: "low" as const, label: "Low" },
    { value: "medium" as const, label: "Medium" },
    { value: "high" as const, label: "High" },
];

const DURATION_OPTIONS = [
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "60 min" },
    { value: 90, label: "90 min" },
    { value: 120, label: "120 min" },
    { value: 180, label: "180 min" },
];

export function FocusTimeSection({
    focusTimePreference,
    onChange,
}: FocusTimeSectionProps) {
    const updatePreference = (updates: Partial<FocusTimePreference>) => {
        onChange({ ...focusTimePreference, ...updates });
    };

    return (
        <div className="space-y-0">
            {/* Preferred Focus Blocks */}
            <SubSection title="Preferred Focus Blocks">
                <TimeRangeInput
                    intervals={focusTimePreference.preferredBlocks}
                    onChange={(blocks) => updatePreference({ preferredBlocks: blocks })}
                    ariaLabel="Preferred focus time blocks"
                />
            </SubSection>

            {/* Focus Session Duration */}
            <SubSection title="Focus Session Duration">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                        <label
                            htmlFor="min-duration"
                            className="text-sm text-gray-600 mb-2 block"
                        >
                            Minimum Duration
                        </label>
                        <select
                            id="min-duration"
                            value={focusTimePreference.minimumDuration}
                            onChange={(e) => updatePreference({ minimumDuration: Number(e.target.value) })}
                            className="
                                w-full px-4 py-2.5 min-h-[44px]
                                border border-gray-200 rounded-lg
                                text-sm text-gray-700 bg-white
                                focus:outline-none focus:border-[var(--color-blue)]
                                focus:ring-2 focus:ring-[var(--color-blue)]/10
                                cursor-pointer transition-all duration-200
                            "
                        >
                            {DURATION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label
                            htmlFor="max-duration"
                            className="text-sm text-gray-600 mb-2 block"
                        >
                            Maximum Duration
                        </label>
                        <select
                            id="max-duration"
                            value={focusTimePreference.maximumDuration}
                            onChange={(e) => updatePreference({ maximumDuration: Number(e.target.value) })}
                            className="
                                w-full px-4 py-2.5 min-h-[44px]
                                border border-gray-200 rounded-lg
                                text-sm text-gray-700 bg-white
                                focus:outline-none focus:border-[var(--color-blue)]
                                focus:ring-2 focus:ring-[var(--color-blue)]/10
                                cursor-pointer transition-all duration-200
                            "
                        >
                            {DURATION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </SubSection>

            {/* Chrono Type */}
            <SubSection
                title="Your Chrono Type"
                description="When are you most productive for deep work?"
            >
                <div
                    role="radiogroup"
                    aria-label="Select your chrono type"
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                    {CHRONO_TYPES.map(({ value, label, icon: Icon }) => {
                        const isActive = focusTimePreference.chronoType === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => updatePreference({ chronoType: value })}
                                className={`
                                    flex flex-col items-center gap-2 p-4 min-h-[88px]
                                    rounded-xl border-2 transition-all duration-200 cursor-pointer
                                    focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/50 focus:ring-offset-2
                                    ${isActive
                                        ? "border-[var(--color-blue)] bg-[var(--color-blue)]/5"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }
                                `}
                            >
                                <Icon
                                    size={24}
                                    className={isActive ? "text-[var(--color-blue)]" : "text-gray-500"}
                                />
                                <span
                                    className={`text-sm font-medium ${isActive ? "text-[var(--color-blue)]" : "text-gray-600"}`}
                                >
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </SubSection>

            {/* Interruption Sensitivity */}
            <SubSection title="Interruption Sensitivity">
                <ToggleButtonGroup
                    options={INTERRUPTION_OPTIONS}
                    value={focusTimePreference.interruptionSensitivity ?? "medium"}
                    onChange={(value) => updatePreference({ interruptionSensitivity: value })}
                    ariaLabel="Select interruption sensitivity level"
                />
            </SubSection>
        </div>
    );
}
