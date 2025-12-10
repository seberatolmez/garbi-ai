import { EventPosition, CalendarEvent, PositionedEvent } from "../types/types";

export const HOUR_ROW_HEIGHT = 60; // Height in pixels for each hour row

// Utility: Parse time string (HH:mm) to total minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

export function calculateEventPosition(event: CalendarEvent): EventPosition {
  const startMinutes = parseTimeToMinutes(event.startTime);
  const endMinutes = parseTimeToMinutes(event.endTime);
  const durationMinutes = endMinutes - startMinutes;
  
  const top = (startMinutes / 60) * HOUR_ROW_HEIGHT;

  const height = (durationMinutes / 60) * HOUR_ROW_HEIGHT;
  
  return { top, height, startMinutes, endMinutes };
}

/**
 * Check if two events overlap in time
 */
export function eventsOverlap(event1: EventPosition, event2: EventPosition): boolean {
  return !(event1.endMinutes <= event2.startMinutes || event2.endMinutes <= event1.startMinutes);
}

/**
 * Detect overlapping event groups
 * Groups events that intersect with each other at any point
 */
export function detectOverlappingEvents(events: CalendarEvent[]): Array<CalendarEvent[]> {
  if (events.length === 0) return [];
  
  const eventsWithPositions = events.map(event => ({
    event,
    position: calculateEventPosition(event)
  }));
  
  const groups: Array<CalendarEvent[]> = [];
  const processed = new Set<CalendarEvent>();
  
  for (const { event, position } of eventsWithPositions) {
    if (processed.has(event)) continue;
    
    // Find all events that overlap with this event (directly or indirectly)
    const group: CalendarEvent[] = [event];
    processed.add(event);
    
    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      for (const { event: otherEvent, position: otherPosition } of eventsWithPositions) {
        if (processed.has(otherEvent)) continue;
        
        // Check if this event overlaps with any event in the current group
        const overlapsWithGroup = group.some(e => {
          const ePos = calculateEventPosition(e);
          return eventsOverlap(ePos, otherPosition);
        });
        
        if (overlapsWithGroup) {
          group.push(otherEvent);
          processed.add(otherEvent);
          foundNew = true;
        }
      }
    }
    
    groups.push(group);
  }
  
  return groups;
}

/**
 * Calculate layout for overlapping events within a group
 * Assigns column indices and calculates width/left positions
 */
export function calculateEventLayout(eventGroup: CalendarEvent[]): Array<{ event: CalendarEvent; left: number; width: number; columnIndex: number }> {
  if (eventGroup.length === 0) return [];
  
  const eventsWithPositions = eventGroup.map(event => ({
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
  
  // Assign columns using greedy algorithm
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
  
  // Calculate width and left positions
  const totalColumns = columns.length;
  const gap = 1; // 1% gap between events
  const padding = 0.5; // 0.5% padding on each side
  
  const result: Array<{ event: CalendarEvent; left: number; width: number; columnIndex: number }> = [];
  
  for (const eventWithPos of eventsWithPositions) {
    const columnIndex = eventToColumn.get(eventWithPos)!;
    
    // Width: (100% - total padding) / totalColumns
    const width = (100 - (padding * 2)) / totalColumns - gap;
    
    // Left: columnIndex * (width + gap) + padding
    const left = (columnIndex * ((100 - (padding * 2)) / totalColumns)) + padding + (columnIndex * gap);
    
    result.push({
      event: eventWithPos.event,
      left,
      width,
      columnIndex
    });
  }
  
  return result;
}

/**
 * Calculate overlapping positions for all events
 * Main function that combines event positioning and overlap handling
 */
export function calculateOverlappingPositions(events: CalendarEvent[]): PositionedEvent[] {
  if (events.length === 0) return [];
  
  // Calculate positions for all events
  const eventsWithPositions = events.map(event => ({
    event,
    position: calculateEventPosition(event)
  }));
  
  // Detect overlapping groups
  const overlapGroups = detectOverlappingEvents(events);
  
  // Process each group separately
  const result: PositionedEvent[] = [];
  
  for (const group of overlapGroups) {
    if (group.length === 1) {
      // Single event - no overlap, use full width
      const event = group[0];
      const position = calculateEventPosition(event);
      result.push({
        event,
        position,
        left: 1, // 1% padding
        width: 98 // 98% width (1% padding on each side)
      });
    } else {
      // Multiple overlapping events - calculate layout
      const layouts = calculateEventLayout(group);
      for (const { event, left, width } of layouts) {
        const position = calculateEventPosition(event);
        result.push({
          event,
          position,
          left,
          width
        });
      }
    }
  }
  
  return result;
}