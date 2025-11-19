// structure event preview component

 const EventPreviewTypes =  {
    EVENT: 'event', // create/update
    EVENTS: 'events', // listing 
    SUCCESS:'success', // delete
    TEXT:'text', // issue or suggestion
    DISAMBIGUATION:'disambiguation' // more than on operations
}

function identifyInfoBar({data= {}}:any) {
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
            const events = [data.events];
            return events.map(event => {
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-gray-900">{event.title}</span>
                            <span className="text-sm text-gray-600">{}</span> {/* place holder for date, for now*/}
                        </div>
            })
    
        }

        case EventPreviewTypes.TEXT:
        case EventPreviewTypes.SUCCESS:
        case EventPreviewTypes.DISAMBIGUATION: // return message
        {
            return <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-900">{data.message}</span>
            </div>

            break;
        }

      } 
}

function toBasicIsoFormat(date: Date) { 
    {/*convert RC3339 complex date format to basic date format. Ex: "Fri, 19 Oct 2025 * 09.00-14.00" */}
}
export function EventPreview({ data = {} }: any) { 

    const operationType = data?.type;
    if(!operationType) {
        return null;
    }
    /**
     * show title, date and time of the event for created/updated/listed events with different colors
     * show title and message for deleted events
     * show only one or more events in case of listing events
     * avoid duplicate code for each case
     * returning types: event,success,text,disambiguation
     * show message for all cases
     * */ 
    
    /*if(data?.type==EventPreviewTypes.EVENT) {

        return <div>
            <li>{data.message}</li>
            <li>{data.event?.summary}</li>
            <li>{data.event?.start?.dateTime}</li>
            <li>{data.event?.end?.dateTime}</li>
        </div>
    } */

        return (

            
        );
     
    
}