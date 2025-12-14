import {useState, useEffect} from "react";

export function CurrentTimeIndicator({containerHeight}: {containerHeight: number}) {

    const [position, setPosition] = useState(0);

    // update the position every minure
    useEffect(()=> {

        const updatePosition = () => {
            const now = new Date();
            const minutes= now.getHours()*60 + now.getMinutes();  // total minutes in a day = 1440
            const pixelPosition = (minutes / 1440) * containerHeight;
            setPosition(pixelPosition);
        };

        updatePosition(); 

        const interval= setInterval(updatePosition, 60000); // update every minute
        return () => clearInterval(interval); 
    }, [containerHeight]); 

    return (
        <div className="flex flex-row">
         <div // left red dot
            className="absolute left-0 -ml-1.5 w-3 h-3 bg-[var(--color-red)] rounded-full z-[50]"
            style={{ top: `${position-6}px` }} // -6 center the dot
        />   
        <div
            className="absolute left-0 right-0 bg-[var(--color-red)]  z-[70] h-0.5"
            style={{ top: `${position}px` }}
        />
        </div>
        
    )
}