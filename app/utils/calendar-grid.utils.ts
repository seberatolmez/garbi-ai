import { EventPosition,CalendarEvent, PositionedEvent } from "../types/types";

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
  
  export {calculateOverlappingPositions,parseTimeToMinutes,calculateEventPosition,eventsOverlap};