

import { cn } from "@/lib/utils";
import { EventCardProps } from "../types/types";
import { COLORS } from "../types/colors";
import React from "react";



export default function EventCard({ event, onClick }: EventCardProps) {

  const colorId = parseInt(event.colorId,10);
  const colorHex = COLORS[colorId].hex || COLORS[1].hex;
  return (
    <div
      onClick={(e)=> onClick?.(event, e)}
      style={{backgroundColor: colorHex}}
      className="p-2 rounded-md border-l-4 border-blue-400 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md text-background h-full overflow-hidden"
    >
      <div className="font-medium text-sm truncate">{event.title}</div>
      <div className="text-xs opacity-75 mt-1">
        {event.startTime} - {event.endTime}
      </div>
    </div>
  );
}
