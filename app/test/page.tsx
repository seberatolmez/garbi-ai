
//  testing small piece of logic 
export default function testPage() {

    const start = new Date("2025-11-26T02:20:00")    
    console.log("RAW start: ",start, typeof start);
    const end = new Date("2025-11-26T02:40:00")
    console.log("RAW start: ",end, typeof end);
    return <div>
        <h1>Test Page</h1>
    </div>
}