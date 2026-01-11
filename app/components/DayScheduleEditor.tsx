import { Day, TimeInterval } from "../types/types";

export function DaySchedulerEditor({
    day,
    intervals,
    onChange
}: {
    day: Day,
    intervals: TimeInterval[],
    onChange: (intervals: TimeInterval[]) => void;

}) {
    function updateInterval(
        index: number,
        field: "start" | "end",
        value: string
    ) {
        onChange(
            intervals.map((i, idx) =>
                idx === index ? { ...i, [field]: value } : i

            )
        );
    }

    function addInterval() {
        onChange([...intervals, { start: "09:00", end: "17:00" }]);
    }

    function removeInterval(index: number) {
        if (intervals.length === 1) return;
        onChange(intervals.filter((_, i) => i !== index));
    }

    // Capitalize day name
    const formatDayName = (d: Day) => {
        return d.charAt(0) + d.slice(1).toLowerCase();
    };

    return (
        <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-gray-700">{formatDayName(day)}</h4>

            {intervals.map((interval, i) => (
                <div key={i} className="flex items-center gap-3">
                    <input
                        type="time"
                        value={interval.start}
                        onChange={(e) =>
                            updateInterval(i, "start", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#3034FF] focus:ring-2 focus:ring-[#3034FF]/10 min-w-[110px]"
                    />

                    <span className="text-sm text-gray-500">to</span>

                    <input
                        type="time"
                        value={interval.end}
                        onChange={(e) =>
                            updateInterval(i, "end", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#3034FF] focus:ring-2 focus:ring-[#3034FF]/10 min-w-[110px]"
                    />

                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={addInterval}
                            className="w-8 h-8 rounded-full bg-[#3034FF] text-white flex items-center justify-center text-lg font-light hover:bg-[#2528cc] transition cursor-pointer"
                        >
                            +
                        </button>
                        <button
                            onClick={() => removeInterval(i)}
                            className="w-8 h-8 rounded-full bg-[#3034FF] text-white flex items-center justify-center text-lg font-light hover:bg-[#2528cc] transition cursor-pointer"
                        >
                            −
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
