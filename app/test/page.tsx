
//  testing small piece of logic 
export default async function testPage() {

    const start = new Date("2025-11-26T02:20:00")    
    console.log("RAW start: ",start, typeof start);
    const end = new Date("2025-11-26T02:40:00")
    console.log("RAW start: ",end, typeof end);
     
    try {
    const response = await fetch("/api/calendar/list?maxResults=50", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        console.log(data);
    } catch(error) {
        console.log("error occured: "+error)
    }
    
    
    return <div>
        Upcoming events test:
    </div>
}