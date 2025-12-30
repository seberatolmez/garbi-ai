import { Day, TimeInterval } from "../types/types";

export function DaySchedulerEditor({
    day,
    intervals,
    onChange
    }:{
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
            intervals.map((i,idx) => 
            idx === index ? {...i,[field]:value} : i
            
            )
        );
    }

    function addInterval() {
     onChange([...intervals, { start: "09:00", end: "17:00" }]);
    }

    function removeInterval(index: number) {
        if(intervals.length === 1 ) return;
        onChange(intervals.filter( (_,i) => i!== index));
    }

    return (
        <div className="space y-3">
            <h4 className="font-medium">{day}</h4>

        {intervals.map((interval,i) => (
            <div key={i} className="flex items-center gap-2">
                <input
                type="time"
                value={interval.start}
                onChange={(e)=>
                    updateInterval(i,"start",e.target.value)
                }
                />

                <span>to</span>

                <input 
                type="time"
                value={interval.end}
                onChange={(e) => 
                    updateInterval(i,"end",e.target.value)
                }
                />

                <button onClick={addInterval}>+</button>
                <button onClick={() => removeInterval(i)}>-</button>
            </div>
        ))}
        </div>
    )



}