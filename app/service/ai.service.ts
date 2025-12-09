// ai service to parsing and crud operations for calendar events

import { FunctionDeclaration, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import *as calendarService from "./calendar.service";
import { COLORS } from "../types/colors";


const calendarTools: FunctionDeclaration[] = [   // all calendar functions 
        {
            name: 'listEvents',
            description: 'list upcoming events from user primary google calendar',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    maxResults: {
                        type: SchemaType.INTEGER,
                        description: 'maximum number of events to retrieve'
                    },
                    timeMin: {
                        type: SchemaType.STRING,
                        description: 'RFC3339 timestamp to list events starting from (inclusive)'
                    },
                    timeMax: {
                        type: SchemaType.STRING,
                        description: 'RFC3339 timestamp to list events up to (inclusive)'
                    } 
                },
                // no required if not specified, default '10'
            }
        },
        {
            name: 'createEvent',
            description: 'create a new event in user primary google calendar',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    summary: {
                        type: SchemaType.STRING,
                        description: 'Event title/summary'
                    },
                    description: {
                        type: SchemaType.STRING,
                        description: 'Event description'
                    },

                    colorId: {
                      type: SchemaType.STRING,
                      description: 'Color ID for the event (optional, Google Calendar color IDs range from "1" to "11")'
                    },

                    location: {
                        type: SchemaType.STRING,
                        description: 'Event location'
                    },
                    startDateTime: {
                        type: SchemaType.STRING,
                        description: 'Start date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    endDateTime: {
                        type: SchemaType.STRING,
                        description: 'End date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    timeZone: {
                        type: SchemaType.STRING,
                        description: 'IANA time zone identifier (e.g., America/New_York, Europe/London)'
                    }
                },
                required: ['summary', 'startDateTime', 'endDateTime', 'timeZone']
            }
        },
        {
            name: 'updateEvent',
            description: 'update an existing event in user primary google calendar',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    eventId: {
                        type: SchemaType.STRING,
                        description: 'ID of the event to update'
                    },
                    q: {
                        type: SchemaType.STRING,
                        description: 'free-text search to find the event when ID is unknown (summary, description, location, attendees)'
                    },
                    date: {
                        type: SchemaType.STRING,
                        description: 'date of the event (YYYY-MM-DD) to narrow the search'
                    },
                    summary: {
                        type: SchemaType.STRING,
                        description: 'Updated event title/summary'
                    },
                    description: {
                        type: SchemaType.STRING,
                        description: 'Updated event description'
                    },
                    location: {
                        type: SchemaType.STRING,
                        description: 'Updated event location'
                    },
                    startDateTime: {
                        type: SchemaType.STRING,
                        description: 'Updated start date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    endDateTime: {
                        type: SchemaType.STRING,
                        description: 'Updated end date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    timeZone: {
                        type: SchemaType.STRING,
                        description: 'IANA time zone identifier (e.g., America/New_York, Europe/London)'
                    }
                }
            }
        },
        {
            name: 'deleteEvent',
            description: 'delete an event from user primary google calendar',
            parameters:  {
              type: SchemaType.OBJECT,
              properties: {
                eventId: {
                  type: SchemaType.STRING,
                  description: 'ID of the event to delete'
                },
                q: {
                  type: SchemaType.STRING,
                  description: 'free-text search to find the event when ID is unknown (summary, description, location, attendees)'
                },
                date: {
                  type: SchemaType.STRING,
                  description: 'date of the event (YYYY-MM-DD) to narrow the search'
                }
              }
            }
        }
     ];

const tools = [
    {
      functionDeclarations: calendarTools
    },
]

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const colors = COLORS;

export async function handleUserPrompt(prompt: string, accessToken: string, userTimeZone?: string) {
  try {
    // Use provided timezone or default to UTC
    const timeZone = userTimeZone || 'UTC';
    console.log('User timezone:', timeZone);
    
    const now = new Date();
    
    // Get current date and time in user's timezone
    const currentDateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    
    const currentTimeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find(p => p.type === type)?.value || '';
    
    const currentYear = getPart(currentDateParts, 'year');
    const currentMonth = getPart(currentDateParts, 'month');
    const currentDay = getPart(currentDateParts, 'day');
    const currentHour = getPart(currentTimeParts, 'hour');
    const currentMinute = getPart(currentTimeParts, 'minute');
    
    const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    const currentTime = `${currentHour}:${currentMinute}`;
    const currentDateTime = `${currentDate}T${currentTime}:00`;
    
    // Calculate tomorrow's date
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(tomorrow);
    const tomorrowDate = `${getPart(tomorrowDateParts, 'year')}-${getPart(tomorrowDateParts, 'month')}-${getPart(tomorrowDateParts, 'day')}`;

    const systemInstruction = 
`You are Garbi, an AI assistant for Google Calendar management.

TOOLS: listEvents, createEvent, updateEvent, deleteEvent

RULES:
- list/show/get/list events → listEvents
- add/schedule/create → createEvent  
- move/reschedule/change → updateEvent
- cancel/remove/delete → deleteEvent
- greetings/small talk → plain text response

DATE CONTEXT:
- Today: ${currentDate}
- Current time: ${currentDateTime}
- Tomorrow: ${tomorrowDate}
- Timezone: ${timeZone}

EVENT STRUCTURE:
- summary (required for create), description, location (optional)
- colorId: 1-11 (optional)
- startDateTime/endDateTime: YYYY-MM-DDTHH:mm:ss (required)
- timeZone: IANA identifier (required)

CRITICAL:
- Use timezone "${timeZone}" for all times
- "today" = ${currentDate}, "tomorrow" = ${tomorrowDate}
- Never use UTC or "Z" unless requested
- For search, use 'q' and 'date' params instead of assuming IDs`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: tools,
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });



    const functionCalls = result.response.functionCalls();

    console.log('Function calls received:', JSON.stringify(functionCalls, null, 2));

    if (!functionCalls || functionCalls.length === 0) {
      const text = result.response.text();
      console.log('No function calls, returning text response:', text);
      return { type: "text", message: text };
    }
    
    // Process all function calls in parallel and collect results
    const results = await Promise.all(
      functionCalls.map(async (functionCall) => { 
        const {name,args} = functionCall;
        const argsTyped = args as any; 
        console.log(`Calling function: ${name}`, 'with args:', JSON.stringify(argsTyped, null, 2));

        switch (name) {
          case "listEvents": {
            const maxResults = argsTyped.maxResults || 10;
            const timeMin = argsTyped.timeMin as string | undefined;
            const timeMax = argsTyped.timeMax as string | undefined;
            const events = await calendarService.listEvents(accessToken, maxResults, timeMax, timeMin);
            return { type: "events", events };
          }
          case "createEvent": {
            try {
              // Use user's timezone if AI didn't provide one
              const eventTimeZone = argsTyped.timeZone || userTimeZone || 'UTC';
              
              // Build event object from function arguments
              const eventData = {
                summary: argsTyped.summary || 'Untitled Event',
                description: argsTyped.description || '',
                location: argsTyped.location || '',
                colorId: argsTyped.colorId,
                start: {
                  dateTime: argsTyped.startDateTime,
                  timeZone: eventTimeZone
                },
                end: {
                  dateTime: argsTyped.endDateTime,
                  timeZone: eventTimeZone
                }
              };

              console.log('Creating event with data:', JSON.stringify(eventData, null, 2));

              if (!eventData.start.dateTime || !eventData.end.dateTime) {
                throw new Error('Missing required fields: startDateTime and endDateTime are required');
              }

              const result = await calendarService.createEvent(accessToken, eventData);
              console.log('Event created successfully:', result.event?.id);
              return { type: "event", event: result.event, message: result.message };
            } catch (error) {
              console.error('Error in createEvent case:', error);
              throw error;
            }
          }
          case "updateEvent": {
            try {
              let eventId = (argsTyped.eventId as string | undefined)?.trim();
              
              if (!eventId) {
                const q = (argsTyped.q as string | undefined)?.trim();
                const date = (argsTyped.date as string | undefined)?.trim();
                
                if (!q && !date) {
                  throw new Error('Either eventId or search criteria (q/date) must be provided');
                }

                const candidates = await calendarService.findEventsByQuery(accessToken, {
                  q,
                  date,
                  maxLookAheadDays: 30
                });

                if (candidates.length === 0) {
                  return {
                    type: "text",
                    message: "No events found matching the criteria to update."
                  };
                }
                
                if (candidates.length > 1) {
                  return {
                    type: "disambiguation",
                    message: "Multiple matching events found. Please choose which to update.",
                    candidates: candidates.map(event => ({
                      id: event.id,
                      summary: event.summary,
                      start: event.start?.dateTime,
                      end: event.end?.dateTime,
                    }))
                  };
                }

                eventId = candidates[0].id!;
              }

              if (!eventId) {
                throw new Error('Event ID is required to update event');
              }

              // Fetch existing event to merge changes
              const existingEvent = await calendarService.getEventById(accessToken, eventId);
              
              // Build updated event data from function arguments
              const updatedEventData: any = {};
              
              if (argsTyped.summary !== undefined) updatedEventData.summary = argsTyped.summary;
              if (argsTyped.description !== undefined) updatedEventData.description = argsTyped.description;
              if (argsTyped.location !== undefined) updatedEventData.location = argsTyped.location;
              if (argsTyped.startDateTime) {
                updatedEventData.start = {
                  dateTime: argsTyped.startDateTime,
                  timeZone: argsTyped.timeZone || userTimeZone || existingEvent.start?.timeZone || 'UTC'
                };
              }
              if (argsTyped.endDateTime) {
                updatedEventData.end = {
                  dateTime: argsTyped.endDateTime,
                  timeZone: argsTyped.timeZone || userTimeZone || existingEvent.end?.timeZone || 'UTC'
                };
              }
              
              // Merge: updatedEventData overrides existingEvent fields
              const mergedEvent = {
                ...existingEvent,
                ...updatedEventData,
                id: existingEvent.id,
                etag: existingEvent.etag,
              };

              console.log('Updating event with data:', JSON.stringify(mergedEvent, null, 2));

              const result = await calendarService.updateEvent(accessToken, eventId, mergedEvent);
              console.log('Event updated successfully:', result.event?.id);
              return { type: "event", event: result.event, message: result.message };
            } catch (error) {
              console.error('Error in updateEvent case:', error);
              throw error;
            }
          }
          case "deleteEvent": {
            const eventId = (argsTyped.eventId as string | undefined)?.trim();
            if(eventId) {
              const result = await calendarService.deleteEvent(accessToken, argsTyped.eventId);
              return { type: "success", message: result.message };
            }

            const q = (argsTyped.q as string | undefined)?.trim();
            const date = (argsTyped.date as string | undefined)?.trim();

            const candidates = await calendarService.findEventsByQuery(accessToken,
               {q,date, maxLookAheadDays: 30}
            );

            if(candidates.length === 0) {
              return {
                type: "text",
                message: "No events found matching the criteria to delete."
              };

            }
            // if only one candidate
            if(candidates.length === 1) {
              const deletedEventId = candidates[0].id!;
              const result = await calendarService.deleteEvent(accessToken,deletedEventId);
              return { type: "success", message: result.message, deletedEventId: deletedEventId };
            }

            // if multiple candidates, for now delete just one
            return {
              type: "disambiguation",
              message: "Multiple matching events found. Please choose which to delete.",
              candidates: candidates.map(event => ({ // mapping these 4 fields
                id: event.id,
                summary: event.summary,
                start: event.start?.dateTime,
                end: event.end?.dateTime,
              }))
            }

          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      })
    );

    // Return single result if only one operation, array if multiple
    if (results.length === 1) {
      return results[0];
    }
    
    return results;
    
    
  
  } catch (error) {
    console.error('Error handling user prompt:', error);
    throw error;
  }
}


//TODO: avoid duplicate code, add reusable types and functions as needed 
