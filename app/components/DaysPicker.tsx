
import { Day, Schedule } from "../types/types";

const DAYS: {key: Day; label: string}[] = [

    {key: "MONDAY", label:"Mo"},
    {key: "TUESDAY",label:"Tu"},
    {key: "WEDNESDAY",label:"We"},
    {key: "THURSDAY",label:"Th"},
    {key: "FRIDAY",label:"Fr"},
    {key: "SATURDAY",label:"Sa"},
    {key: "SUNDAY",label:"Su"},

];

export function DaysPicker({
    value,
    onChange
}:
{value: Schedule, onChange: (next:Schedule) => void }

){

    function toggleDay(day: Day){  // 
        const next = {...value};

        if(next[day]){
            delete next[day];
        } else {
            next[day] =  [{start : "09:00",end: "18:00"}];
        }

        onChange(next);
    }


    return (

        <div className="flex gap-2">
                {DAYS.map((d) =>  {
                    const active = Boolean(value[d.key]);

                    return (
                        <button
                        key={d.key}
                        onClick={()=> toggleDay(d.key)}
                        className={`px-3 py-1 rounded-md text-sm transition
                            ${
                                active ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {d.label} {/* EX:  "Mo", "Tu" */}
                        </button> 
                    )
                }
                )}
           
        </div>

    )

}