import { Day, TimeInterval } from "../types/types";
import { TimeRangeInput } from "./ui/TimeRangeInput";

interface DaySchedulerEditorProps {
    day: Day;
    intervals: TimeInterval[];
    onChange: (intervals: TimeInterval[]) => void;
}

export function DaySchedulerEditor({
    day,
    intervals,
    onChange
}: DaySchedulerEditorProps) {
    // Capitalize day name
    const formatDayName = (d: Day) => {
        return d.charAt(0) + d.slice(1).toLowerCase();
    };

    return (
        <div className="mt-4">
            <TimeRangeInput
                intervals={intervals}
                onChange={onChange}
                label={formatDayName(day)}
                ariaLabel={`Time ranges for ${formatDayName(day)}`}
            />
        </div>
    );
}
