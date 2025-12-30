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

    function removeInterval(index: number) {
        if(intervals.length === 1 ) return;
        onChange(intervals.filter( (_,i) => i!== index));
    }



}