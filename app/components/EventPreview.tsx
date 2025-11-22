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

     const operationType = data?.type; 
      switch(operationType){

        case EventPreviewTypes.EVENT: { // title, date , message 
            return <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-900">{data.title}</span>
                    <span className="text-sm text-gray-600">{data.message}</span> {/*place holder for date, for now*/}
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
                    <span className="text-lg font-semibold text-gray-900">{data.message}</span>
            </div>
        }

      } 
}

function toBasicIsoFormat(startTime: Date,endTime: Date) { 
    {/*convert RC3339 complex date format to basic date format. 2025-11-09T09:00:00Z -> Ex: "Fri, 19 Oct 2025 * 09.00-14.00" */}
    const start= new Date(startTime);  // 19 Nov • 09.00 - 14.00 for now. 
    const sMonth= start.getMonth();
    const sDay= start.getDay();
    const sHour= start.getHours();

    const end= new Date(endTime);
    const endHour=end.getHours();

    const months= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const monthLabel= months[sMonth]

    //check if today 
    const now = new Date();
    const isToday=
        start.getDate() === now.getDate() &&
        sMonth === now.getMonth() &&
        start.getFullYear() === now.getFullYear()

    //check if tomorrow 
    const isTomorrow= 
        start.getDate() === now.getDate()+1 &&
        sMonth === now.getMonth()    //: edge-case: last day of month
    const hourLabel= `${sHour}-${endHour}`
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
        <div className="w-full max-w-md border rounded-2xl shadow p-4 bg-white">
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