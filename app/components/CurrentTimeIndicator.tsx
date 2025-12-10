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
        <div
            className="absolute left-25 right-0 bg-red-500 z-[999] h-0.75 rounded-r-xl"
            style={{ top: `${position}px` }}
        />
    )
}