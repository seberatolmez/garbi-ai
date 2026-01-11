'use client';

import { FocusTimePreference, TimeInterval, ChronoType } from "../types/types";
import { Sun, Sunrise, Sunset, Moon, Plus, Minus } from "lucide-react";

interface FocusTimeSectionProps {
    focusTimePreference: FocusTimePreference;
    onChange: (preference: FocusTimePreference) => void;
}

const CHRONO_TYPES: { value: ChronoType; label: string; icon: typeof Sun }[] = [
    { value: "morning", label: "Morning", icon: Sunrise },
    { value: "afternoon", label: "Afternoon", icon: Sun },
    { value: "evening", label: "Evening", icon: Sunset },
    { value: "night", label: "Night", icon: Moon },
];

const INTERRUPTION_LEVELS = [
    { value: "low" as const, label: "Low", description: "Prefer fewer interruptions" },
    { value: "medium" as const, label: "Medium", description: "Balanced approach" },
    { value: "high" as const, label: "High", description: "Okay with interruptions" },
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120, 180];

export function FocusTimeSection({
    focusTimePreference,
    onChange,
}: FocusTimeSectionProps) {
    const updatePreference = (updates: Partial<FocusTimePreference>) => {
        onChange({ ...focusTimePreference, ...updates });
    };

    const updateBlock = (index: number, field: "start" | "end", value: string) => {
        const newBlocks = focusTimePreference.preferredBlocks.map((block, i) =>
            i === index ? { ...block, [field]: value } : block
        );
        updatePreference({ preferredBlocks: newBlocks });
    };

    const addBlock = () => {
        updatePreference({
            preferredBlocks: [
                ...focusTimePreference.preferredBlocks,
                { start: "09:00", end: "12:00" },
            ],
        });
    };

    const removeBlock = (index: number) => {
        if (focusTimePreference.preferredBlocks.length <= 1) return;
        updatePreference({
            preferredBlocks: focusTimePreference.preferredBlocks.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Focus Time Preferences</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Customize how Garbi schedules your deep work sessions. Set your preferred focus blocks,
                duration limits, and when you're most productive.
            </p>

            {/* Preferred Focus Blocks */}
            <div className="py-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#3034FF] mb-4">
                    Preferred Focus Blocks
                </h3>
                <div className="space-y-3">
                    {focusTimePreference.preferredBlocks.map((block, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="time"
                                value={block.start}
                                onChange={(e) => updateBlock(index, "start", e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#3034FF] focus:ring-2 focus:ring-[#3034FF]/10 min-w-[110px]"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <input
                                type="time"
                                value={block.end}
                                onChange={(e) => updateBlock(index, "end", e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#3034FF] focus:ring-2 focus:ring-[#3034FF]/10 min-w-[110px]"
                            />
                            <div className="flex gap-2 ml-2">
                                <button
                                    onClick={addBlock}
                                    className="w-8 h-8 rounded-full bg-[#3034FF] text-white flex items-center justify-center hover:bg-[#2528cc] transition cursor-pointer"
                                >
                                    <Plus size={16} />
                                </button>
                                <button
                                    onClick={() => removeBlock(index)}
                                    disabled={focusTimePreference.preferredBlocks.length <= 1}
                                    className="w-8 h-8 rounded-full bg-[#3034FF] text-white flex items-center justify-center hover:bg-[#2528cc] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Minus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Focus Session Duration */}
            <div className="py-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#3034FF] mb-4">
                    Focus Session Duration
                </h3>
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                        <label className="text-sm text-gray-600 mb-2 block">Minimum Duration</label>
                        <select
                            value={focusTimePreference.minimumDuration}
                            onChange={(e) => updatePreference({ minimumDuration: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#3034FF] focus:ring-2 focus:ring-[#3034FF]/10 cursor-pointer"
                        >
                            {DURATION_OPTIONS.map((duration) => (
                                <option key={duration} value={duration}>
                                    {duration} min
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-sm text-gray-600 mb-2 block">Maximum Duration</label>
                        <select
                            value={focusTimePreference.maximumDuration}
                            onChange={(e) => updatePreference({ maximumDuration: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#3034FF] focus:ring-2 focus:ring-[#3034FF]/10 cursor-pointer"
                        >
                            {DURATION_OPTIONS.map((duration) => (
                                <option key={duration} value={duration}>
                                    {duration} min
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Chrono Type */}
            <div className="py-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#3034FF] mb-4">
                    Your Chrono Type
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    When are you most productive for deep work?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CHRONO_TYPES.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => updatePreference({ chronoType: value })}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition cursor-pointer
                                ${focusTimePreference.chronoType === value
                                    ? "border-[#3034FF] bg-[#3034FF]/5"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <Icon
                                size={24}
                                className={focusTimePreference.chronoType === value
                                    ? "text-[#3034FF]"
                                    : "text-gray-500"
                                }
                            />
                            <span
                                className={`text-sm font-medium
                                    ${focusTimePreference.chronoType === value
                                        ? "text-[#3034FF]"
                                        : "text-gray-600"
                                    }`}
                            >
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Interruption Sensitivity */}
            <div className="py-5">
                <h3 className="text-base font-semibold text-[#3034FF] mb-4">
                    Interruption Sensitivity
                </h3>
                <div className="flex flex-wrap gap-2">
                    {INTERRUPTION_LEVELS.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => updatePreference({ interruptionSensitivity: level.value })}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                                ${focusTimePreference.interruptionSensitivity === level.value
                                    ? "bg-[#3034FF] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {level.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
