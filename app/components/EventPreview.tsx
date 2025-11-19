// structure event preview component

 const EventPreviewTypes =  {
    EVENT: 'event', // create/update
    EVENTS: 'events', // listing 
    SUCCESS:'success', // delete
    TEXT:'text', // issue
    DISAMBIGUATION:'disambiguation' // more than on operations
}
export function EventPreview({ data = {} }: any) { 

    if(!data) {
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

      const operationType = data?.type; 
      switch(operationType){

        case EventPreviewTypes.EVENT: { // title, date , message 

            break;
        }
        case EventPreviewTypes.EVENTS: { // title, date but list format, message 

            break;
        }

        case EventPreviewTypes.TEXT:
        case EventPreviewTypes.SUCCESS:
        case EventPreviewTypes.DISAMBIGUATION:
        {

            break;
        }

      } 
    
}