import { Day, Schedule } from "../types/types";
import { DaysPicker } from "./DaysPicker";
import { DaySchedulerEditor } from "./DayScheduleEditor";

export function SchedulePreferenceSection({
    label,
    value,
    onChange
}:{
    label: string;
    value: Schedule;
    onChange: (schedule: Schedule) => void
}) {

    const selectedDay = Object.keys(value)[0] as Day | undefined

    return(
        <div className="space-y-4 border p-4 rounder-lg">
            <h3 className="font-semibold">{label}</h3>

        <DaysPicker value={value} onChange={onChange}/>

        {selectedDay && (
           <DaySchedulerEditor
            day={selectedDay}
            intervals={value[selectedDay]!}
            onChange={(intervals) => 
                onChange({...value,[selectedDay]: intervals })
            }
           /> 
        )}
        </div>    
    )
}