'use client';

import { Plus, Minus } from 'lucide-react';
import { TimeInterval } from '@/app/types/types';

interface TimeRangeInputProps {
    intervals: TimeInterval[];
    onChange: (intervals: TimeInterval[]) => void;
    label?: string;
    ariaLabel: string;
    className?: string;
}

export function TimeRangeInput({
    intervals,
    onChange,
    label,
    ariaLabel,
    className = ''
}: TimeRangeInputProps) {
    const updateInterval = (index: number, field: 'start' | 'end', value: string) => {
        onChange(
            intervals.map((interval, i) =>
                i === index ? { ...interval, [field]: value } : interval
            )
        );
    };

    const addInterval = () => {
        onChange([...intervals, { start: '09:00', end: '17:00' }]);
    };

    const removeInterval = (index: number) => {
        if (intervals.length <= 1) return;
        onChange(intervals.filter((_, i) => i !== index));
    };

    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={`space-y-3 ${className}`}
        >
            {label && (
                <span className="text-sm font-medium text-gray-700 block">{label}</span>
            )}

            {intervals.map((interval, index) => (
                <div key={index} className="flex items-center gap-3 flex-wrap">
                    <label className="sr-only" htmlFor={`time-start-${index}`}>
                        Start time
                    </label>
                    <input
                        id={`time-start-${index}`}
                        type="time"
                        value={interval.start}
                        onChange={(e) => updateInterval(index, 'start', e.target.value)}
                        className="
                            px-3 py-2.5 min-h-[44px] min-w-[120px]
                            border border-gray-200 rounded-lg
                            text-sm text-gray-700 bg-white
                            focus:outline-none focus:border-[var(--color-blue)]
                            focus:ring-2 focus:ring-[var(--color-blue)]/10
                            transition-all duration-200
                        "
                    />

                    <span className="text-sm text-gray-500" aria-hidden="true">to</span>

                    <label className="sr-only" htmlFor={`time-end-${index}`}>
                        End time
                    </label>
                    <input
                        id={`time-end-${index}`}
                        type="time"
                        value={interval.end}
                        onChange={(e) => updateInterval(index, 'end', e.target.value)}
                        className="
                            px-3 py-2.5 min-h-[44px] min-w-[120px]
                            border border-gray-200 rounded-lg
                            text-sm text-gray-700 bg-white
                            focus:outline-none focus:border-[var(--color-blue)]
                            focus:ring-2 focus:ring-[var(--color-blue)]/10
                            transition-all duration-200
                        "
                    />

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={addInterval}
                            aria-label="Add time range"
                            className="
                                w-7 h-7 rounded-md
                                text-gray-400 bg-transparent
                                flex items-center justify-center
                                hover:text-[var(--color-blue)] hover:bg-[var(--color-blue)]/10
                                focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/30
                                transition-all duration-150 cursor-pointer
                            "
                        >
                            <Plus size={16} strokeWidth={2} />
                        </button>
                        <button
                            type="button"
                            onClick={() => removeInterval(index)}
                            disabled={intervals.length <= 1}
                            aria-label="Remove time range"
                            className="
                                w-7 h-7 rounded-md
                                text-gray-400 bg-transparent
                                flex items-center justify-center
                                hover:text-red-500 hover:bg-red-50
                                focus:outline-none focus:ring-2 focus:ring-red-300/30
                                transition-all duration-150 cursor-pointer
                                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent
                            "
                        >
                            <Minus size={16} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
