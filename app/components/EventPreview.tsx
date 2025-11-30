// structure event preview component
import Image from "next/image";

 const EventPreviewTypes =  {
    EVENT: 'event', // create/update
    EVENTS: 'events', // listing 
    SUCCESS:'success', // delete
    TEXT:'text', // issue or suggestion
    DISAMBIGUATION:'disambiguation' // more than on operations
}

function IdentifyInfoBar({data= {}}:any) {
    if(!data) {
        return null;
    }
    
    const event = data.event || data;
    const start = event.start?.dateTime;
    const end = event.end?.dateTime;
    const date = toBasicIsoFormat(start,end);

     const operationType = data?.type; 
      switch(operationType){

        case EventPreviewTypes.EVENT: { // title, date , message 

            const title = event.summary || event.title || 'Untitled Event';
            
            return <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-900">{title}</span>
                    <span className="text-sm text-gray-600">{date}</span>
                   </div>
        }
        case EventPreviewTypes.EVENTS: { // title, date but list format, message 
            const events = data.events || [];
            return (
                    <div className="flex flex-col gap-2">
                        {events.map((event: any, i: number) => (
                        <div className="flex flex-col" key={i}>
                            <span className="text-lg font-semibold text-gray-900">{event.title}</span>
                            <span className="text-sm text-gray-600">{event.message}</span>
                        </div>
                        ))}
                    </div>
                );
        }

        case EventPreviewTypes.TEXT:
        case EventPreviewTypes.SUCCESS:
        case EventPreviewTypes.DISAMBIGUATION: // return message
        {
            return <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{data.message}</span>
            </div>
        }

      } 
}

function toBasicIsoFormat(startTime: string|Date, endTime: string|Date) { 
    // Convert RC3339 complex date format to basic date format. 2025-11-09T09:00:00Z -> Ex: "Fri, 19 Oct 2025 * 09.00-14.00"
    // Handle both string dates and Date objects directly
    const start = startTime instanceof Date ? startTime : (startTime ? new Date(startTime) : null);
    const end = endTime instanceof Date ? endTime : (endTime ? new Date(endTime) : null);
    
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid Google Calendar date:", { startTime, endTime });
        return "-";
    }
    
    const sMonth= start.getMonth();
    const sDay= start.getDate();
    const sHour= start.getHours();
    const sMinutes=start.getMinutes();
    const refStartMinutes = sMinutes<10 ? '0'+sMinutes : sMinutes; 

    
    const endHour=end.getHours();
    const endMinutes=end.getMinutes();
    const refEndMinutes=endMinutes<10? '0'+endMinutes : endMinutes // ex:  9 -> 09

    const months= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const monthLabel= months[sMonth]

    //check if today 
    const now = new Date();
    const isToday=
        sDay === now.getDate() &&
        sMonth === now.getMonth() &&
        start.getFullYear() === now.getFullYear()

    //check if tomorrow 
    const isTomorrow= 
        sDay === now.getDate()+1 &&
        sMonth === now.getMonth()    //: edge-case: last day of month

    const hourLabel = `${String(sHour).padStart(2, "0")}:${refStartMinutes}-${String(endHour).padStart(2, "0")}:${refEndMinutes}`; // TODO: do parsing it outside above 
    const dateLabel = `${sDay} ${monthLabel} • ${hourLabel}`

    if(isToday) {
        return `Today, ${hourLabel}`
    }
    else if(isTomorrow) {
        return `Tomorrow, ${hourLabel}`
    }
    else {
        return dateLabel;
    }

}

export function EventPreview({ data = {} }: any) { 

    const operationType = data?.type;
    if(!operationType) {
        return null;
    }

    return(
        <div className="border rounded-2xl shadow p-4 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Image
            src={"/google-calendar-logo.png"} 
            alt={"Google Calendar Logo"}
            width={40}
            height={40}
        />
        <span className="font-medium text-gray-800">Google Calendar</span>
      </div>

      {/* Info Bar */}
     <IdentifyInfoBar data={data}/>
        
    </div>
    );
     
    
}