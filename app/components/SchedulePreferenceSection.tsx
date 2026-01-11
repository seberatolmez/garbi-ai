import { Day, Schedule } from "../types/types";
import { DaysPicker } from "./DaysPicker";
import { DaySchedulerEditor } from "./DayScheduleEditor";

export function SchedulePreferenceSection({
    label,
    subtitle,
    value,
    onChange
}: {
    label: string;
    subtitle?: string;
    value: Schedule;
    onChange: (schedule: Schedule) => void
}) {
    const selectedDays = Object.keys(value) as Day[]

    return (
        <div className="py-5 border-b border-gray-100 last:border-b-0">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-[#3034FF]">{label}</h3>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>

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
