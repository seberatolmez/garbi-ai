import { Day, Schedule } from "../types/types";

const DAYS: { key: Day; label: string; fullName: string }[] = [
    { key: "MONDAY", label: "Mo", fullName: "Monday" },
    { key: "TUESDAY", label: "Tu", fullName: "Tuesday" },
    { key: "WEDNESDAY", label: "We", fullName: "Wednesday" },
    { key: "THURSDAY", label: "Th", fullName: "Thursday" },
    { key: "FRIDAY", label: "Fr", fullName: "Friday" },
    { key: "SATURDAY", label: "Sa", fullName: "Saturday" },
    { key: "SUNDAY", label: "Su", fullName: "Sunday" },
];

interface DaysPickerProps {
    value: Schedule;
    onChange: (next: Schedule) => void;
    ariaLabel?: string;
}

export function DaysPicker({
    value,
    onChange,
    ariaLabel = "Select days of the week"
}: DaysPickerProps) {
    function toggleDay(day: Day) {
        const next = { ...value };

        if (next[day]) {
            delete next[day];
        } else {
            next[day] = [{ start: "09:00", end: "18:00" }];
        }

        onChange(next);
    }

    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className="flex flex-wrap gap-2"
        >
            {DAYS.map((d) => {
                const active = Boolean(value[d.key]);

                return (
                    <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDay(d.key)}
                        aria-pressed={active}
                        aria-label={d.fullName}
                        className={`
                            w-11 h-11 rounded-full text-sm font-medium
                            transition-all duration-200 cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/50 focus:ring-offset-2
                            ${active
                                ? "bg-[var(--color-blue)] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }
                        `}
                    >
                        {d.label}
                    </button>
                );
            })}
        </div>
    );
}