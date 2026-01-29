import { Day, Schedule } from "../types/types";
import { DaysPicker } from "./DaysPicker";
import { DaySchedulerEditor } from "./DayScheduleEditor";
import { SubSection } from "./ui/SectionCard";

interface SchedulePreferenceSectionProps {
    label: string;
    subtitle?: string;
    value: Schedule;
    onChange: (schedule: Schedule) => void;
}

export function SchedulePreferenceSection({
    label,
    subtitle,
    value,
    onChange
}: SchedulePreferenceSectionProps) {
    const selectedDays = Object.keys(value) as Day[];

    return (
        <SubSection title={label} description={subtitle}>
            <DaysPicker
                value={value}
                onChange={onChange}
                ariaLabel={`Select days for ${label}`}
            />
            {selectedDays.length > 0 && (
                <div className="mt-4 space-y-4">
                    {selectedDays.map(day => (
                        <DaySchedulerEditor
                            key={day}
                            day={day}
                            intervals={value[day]!}
                            onChange={(intervals) =>
                                onChange({ ...value, [day]: intervals })
                            }
                        />
                    ))}
                </div>
            )}
        </SubSection>
    );
}
