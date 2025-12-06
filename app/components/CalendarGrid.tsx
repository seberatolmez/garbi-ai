
import { addDays, format, getDaysInMonth, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import EventCard from "./EventCard";
import { CalendarEvent, CalendarGridProps, EventPosition, PositionedEvent } from "../types/types";
import { cn } from "@/lib/utils";


const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => i);
const HOUR_ROW_HEIGHT = 60; // Height in pixels for each hour row

// Utility: Parse time string (HH:mm) to total minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}


function calculateEventPosition(event: CalendarEvent): EventPosition {
  const startMinutes = parseTimeToMinutes(event.startTime);
  const endMinutes = parseTimeToMinutes(event.endTime);
  const durationMinutes = endMinutes - startMinutes;
  
  // Calculate top position: (minutes / 60) * hourRowHeight
  const top = (startMinutes / 60) * HOUR_ROW_HEIGHT;
  // Calculate height: (duration in minutes / 60) * hourRowHeight
  const height = (durationMinutes / 60) * HOUR_ROW_HEIGHT;
  
  return { top, height, startMinutes, endMinutes };
}

// Utility: Check if two events overlap
function eventsOverlap(event1: EventPosition, event2: EventPosition): boolean {
  return !(event1.endMinutes <= event2.startMinutes || event2.endMinutes <= event1.startMinutes);
}


function calculateOverlappingPositions(events: CalendarEvent[]): PositionedEvent[] {
  if (events.length === 0) return [];
  
  // Calculate positions for all events
  const eventsWithPositions = events.map(event => ({
    event,
    position: calculateEventPosition(event)
  }));
  
  // Sort by start time, then by duration (longer first for better column assignment)
  eventsWithPositions.sort((a, b) => {
    if (a.position.startMinutes !== b.position.startMinutes) {
      return a.position.startMinutes - b.position.startMinutes;
    }
    return b.position.endMinutes - a.position.endMinutes;
  });
  
  // Assign columns using a greedy algorithm
  const columns: (typeof eventsWithPositions)[] = [];
  const eventToColumn = new Map<typeof eventsWithPositions[0], number>();
  
  for (const eventWithPos of eventsWithPositions) {
    // Find the first column where this event doesn't overlap with existing events
    let columnIndex = -1;
    for (let i = 0; i < columns.length; i++) {
      const columnEvents = columns[i];
      const noOverlap = columnEvents.every(existing =>
        !eventsOverlap(eventWithPos.position, existing.position)
      );
      if (noOverlap) {
        columnIndex = i;
        break;
      }
    }
    
    // If no suitable column found, create a new one
    if (columnIndex === -1) {
      columnIndex = columns.length;
      columns.push([]);
    }
    
    columns[columnIndex].push(eventWithPos);
    eventToColumn.set(eventWithPos, columnIndex);
  }
  
  // Calculate positions for each event
  const result: PositionedEvent[] = [];
  const gap = 1; // 1% gap between events
  
  for (const eventWithPos of eventsWithPositions) {
    const columnIndex = eventToColumn.get(eventWithPos)!;
    
    // Find all events that overlap with this event at any point
    const overlappingEvents = eventsWithPositions.filter(other =>
      eventsOverlap(eventWithPos.position, other.position)
    );
    
    // Find the maximum column index used by overlapping events
    const maxColumnIndex = Math.max(
      ...overlappingEvents.map(e => eventToColumn.get(e)!)
    );
    
    // Calculate how many columns are needed for this overlap group
    const numColumns = maxColumnIndex + 1;
    
    // Calculate width and left position
    const width = (100 / numColumns) - gap;
    const left = (columnIndex / numColumns) * 100 + (gap / 2);
    
    result.push({
      event: eventWithPos.event,
      position: eventWithPos.position,
      left,
      width
    });
  }
  
  return result;
}

export default function CalendarGrid({ currentDate, events, onEventClick, view }: CalendarGridProps) {
  const today = new Date();

  if (view === "day") {
    return <DayView currentDate={currentDate} events={events} onEventClick={onEventClick} today={today} />;
  }

  if (view === "month") {
    return <MonthView currentDate={currentDate} events={events} onEventClick={onEventClick} today={today} />;
  }

  return <WeekView currentDate={currentDate} events={events} onEventClick={onEventClick} today={today} />;
}

// Week View Component
function WeekView({ currentDate, events, onEventClick, today }: { currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void; today: Date }) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Get events for each day
  const getEventsForDay = (day: number) => {
    const targetDate = addDays(weekStart, day);
    return events.filter(event => {
      // If the event has a date field (ISO YYYY-MM-DD), compare it to the targetDate.
      if (event.date) {
        const eventDate = new Date(event.date + "T00:00:00");
        return isSameDay(eventDate, targetDate);
      }
      // Fallback: if no date provided, assume events belong to the currently selected date.
      return isSameDay(currentDate, targetDate);
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[800px]">
        {/* Days header */}
        <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
          <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
          {WEEK_DAYS.map((day) => {
            const date = addDays(weekStart, day);
            const isToday = isSameDay(date, today);
            return (
              <div
                key={day}
                className={cn(
                  "p-4 text-center border-l border-border",
                  isToday && "bg-blue-500/5"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {format(date, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-2xl font-semibold mt-1",
                    isToday
                      ? "text-blue-600"
                      : "text-foreground"
                  )}
                >
                  {format(date, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid with events container */}
        <div className="relative" style={{ height: `${24 * HOUR_ROW_HEIGHT}px` }}>
          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-border"
              style={{ height: `${HOUR_ROW_HEIGHT}px` }}
            >
              <div className="p-4 text-sm text-calendar-time font-medium">
                {format(new Date().setHours(hour, 0), "HH:mm")}
              </div>
              {WEEK_DAYS.map((day) => {
                const date = addDays(weekStart, day);
                const isToday = isSameDay(date, today);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={cn(
                      "border-l border-border transition-colors hover:bg-calendar-grid/50 relative",
                      isToday && "bg-blue-500/5"
                    )}
                  />
                );
              })}
            </div>
          ))}

          {/* Events containers for each day - absolutely positioned */}
          {WEEK_DAYS.map((day) => {
            const dayEvents = getEventsForDay(day);
            const positionedEvents = calculateOverlappingPositions(dayEvents);
            // Grid has 8 columns: 1 for time (12.5%), 7 for days (each 12.5%)
            // Day columns start at index 1, so left = (day + 1) / 8 * 100
            const leftOffset = ((day + 1) / 8) * 100;
            const dayWidth = (1 / 8) * 100; // Each day column is 1/8 of total width

            return (
              <div
                key={day}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${leftOffset}%`,
                  width: `${dayWidth}%`,
                }}
              >
                {positionedEvents.map(({ event, position, left, width }) => (
                  <div
                    key={event.id}
                    className="absolute px-1"
                    style={{
                      top: `${position.top}px`,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: `${Math.max(position.height, 20)}px`, // Minimum height of 20px
                    }}
                  >
                    <EventCard
                      event={event}
                      onClick={() => onEventClick?.(event)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Day View Component
function DayView({ currentDate, events, onEventClick, today }: { currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void; today: Date }) {
  const isToday = isSameDay(currentDate, today);

  // Filter events for the current day
  const dayEvents = events.filter(event => {
    if (event.date) {
      const eventDate = new Date(event.date + "T00:00:00");
      return isSameDay(eventDate, currentDate);
    }
    // Fallback: if no date provided, assume events belong to the currently selected date
    return true;
  });

  // Calculate positions for all events with overlap handling
  const positionedEvents = calculateOverlappingPositions(dayEvents);

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[600px] grid grid-cols-[150px_1fr]">
        {/* HEADER */}
        <div className="col-span-2 grid grid-cols-[100px_1fr] border-b border-border sticky top-0 bg-card z-10">
          <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
          <div className={cn(
            "p-4 text-center border-l border-border",
            isToday && "bg-blue-500/5"
          )}>
            <div className="text-sm font-medium text-muted-foreground">
              {format(currentDate, "EEEE")}
            </div>
            <div className={cn(
              "text-2xl font-semibold mt-1",
              isToday ? "text-primary" : "text-foreground"
            )}>
              {format(currentDate, "d")}
            </div>
          </div>
        </div>

        {/* Time grid with events container */}
        <div className="col-span-2 relative" style={{ height: `${24 * HOUR_ROW_HEIGHT}px` }}>
          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[100px_1fr] border-b border-border"
              style={{ height: `${HOUR_ROW_HEIGHT}px` }}
            >
              <div className="p-4 text-sm text-calendar-time font-medium">
                {format(new Date().setHours(hour, 0), "HH:mm")}
              </div>
              <div
                className={cn(
                  "border-l border-border transition-colors hover:bg-calendar-grid/50 relative",
                  isToday && "bg-blue-500/5"
                )}
              />
            </div>
          ))}

          {/* Events container - absolutely positioned */}
          <div className="absolute top-0 left-[100px] right-0 bottom-0">
            {positionedEvents.map(({ event, position, left, width }) => (
              <div
                key={event.id}
                className="absolute px-1"
                style={{
                  top: `${position.top}px`,
                  left: `${left}%`,
                  width: `${width}%`,
                  height: `${Math.max(position.height, 20)}px`, // Minimum height of 20px
                }}
              >
                <EventCard
                  event={event}
                  onClick={() => onEventClick?.(event)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Month View Component
function MonthView({currentDate,events,onEventClick, today}: 
    {currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void; today: Date}) {

   const monthStart = startOfMonth(currentDate);
   const daysInMonth = getDaysInMonth(monthStart);
   const startDay = monthStart.getDay(); 
   const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
   
   const totalCells = 42; // 6 weeks * 7 days
   const emptyDays = Array.from({ length: adjustedStartDay }, (_, i) => i);
   const monthDays = Array.from({ length: daysInMonth}, (_, i) => i + 1);
   const trailingDays = totalCells - emptyDays.length - monthDays.length;

   const getEventsForDay = (date: Date)=> {
     return events.filter(event => {
       if (event.date) {
      const eventDate = new Date(event.date + "T00:00:00");
      return isSameDay(eventDate, date);
       }
       // fallback: if no date set, only show on the currently selected date
       return isSameDay(date, currentDate);
     });
   };

   const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-sm font-semibold text-muted-foreground text-center p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="bg-muted/30 rounded-lg min-h-[120px]" />
          ))}
          {monthDays.map((day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = isSameDay(date, today);
            const dayEvents = getEventsForDay(date);
            
            return (
              <div
                key={day}
                className={cn(
                  "bg-card border border-border rounded-lg p-3 min-h-[120px] transition-colors hover:border-primary/50",
                  isToday && "border-primary bg-primary/5"
                )}
              >
                <div className={cn(
                  "text-sm font-semibold mb-2",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={cn(
                        "text-xs p-1 rounded cursor-pointer transition-all hover:scale-105",
                        `bg-calendar`,
                        "text-foreground font-medium truncate"
                      )}
                    >
                      {event.startTime} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {trailingDays > 0 && Array.from({ length: trailingDays }, (_, i) => (
            <div key={`trailing-${i}`} className="bg-muted/30 rounded-lg min-h-[120px]" />
          ))}
        </div>
      </div>
    </div>
  );


}
