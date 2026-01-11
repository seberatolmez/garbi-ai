import { Day, Schedule } from "../types/types";
import { DaysPicker } from "./DaysPicker";
import { DaySchedulerEditor } from "./DayScheduleEditor";

export function SchedulePreferenceSection({
    label,
    value,
    onChange
}: {
    label: string;
    value: Schedule;
    onChange: (schedule: Schedule) => void
}) {
    const selectedDays = Object.keys(value) as Day[]

    return (
        <div className="space-y-4 border p-4 rounder-lg">
            <h3 className="font-semibold">{label}</h3>

            <DaysPicker value={value} onChange={onChange} />
            {selectedDays.length > 0 && (
                selectedDays.map(day => (
                    <DaySchedulerEditor
                        key={day}
                        day={day}
                        intervals={value[day]!}
                        onChange={(intervals) =>
                            onChange({ ...value, [day]: intervals })
                        }
                    />
                ))
            )}
        </div>
    )
}