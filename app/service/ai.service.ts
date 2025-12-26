// ai service to parsing and crud operations for calendar events
import { Groq } from "groq-sdk"
import *as calendarService from "./calendar.service";
import { COLORS } from "../types/colors";
import { ChatCompletionTool } from "groq-sdk/resources/chat/completions.mjs";

const tools : Array<ChatCompletionTool> = [   // all calendar functions 
           {
              type: "function",
              function: {
                name: "listEvents",
                description: "list upcoming events from user primary google calendar",
                parameters: {
                  type: "object",
                  properties: {
                    maxResults: {
                      type: "number",
                      description: "maximum number of events to retrieve",
                    },
                    timeMin: {
                      type: "string",
                      description: "RFC3339 datetime in UTC. Format: YYYY-MM-DDTHH:mm:ssZ (must end with Z)",
                    },
                    timeMax: {
                      type: "string",
                      description: "RFC3339 datetime in UTC. Format: YYYY-MM-DDTHH:mm:ssZ (must end with Z)",
                    },
                  },
                },
              },
            },
            {
              type: "function",
              function: {
                name: "createEvent",
                description: "create a new event in user primary google calendar",
                parameters: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    description: { type: "string" },
                    colorId: { type: "string" },
                    location: { type: "string" },
                    startDateTime: { 
                      type: "string",
                      description: "Local datetime WITHOUT timezone. Format: YYYY-MM-DDTHH:mm:ss" },
                    endDateTime: { 
                      type: "string",
                      description: "Local datetime WITHOUT timezone. Format: YYYY-MM-DDTHH:mm:ss" },
                    timeZone: {
                       type: "string",
                       description: "IANA time zone identifier, e.g., 'America/New_York'"},
                  },
                  required: ["summary", "startDateTime", "endDateTime", "timeZone"],
                },
              },
            },
            {
              type: "function",
              function: {
                name: "updateEvent",
                description: "update an existing event in user primary google calendar",
                parameters: {
                  type: "object",
                  properties: {
                    eventId: { 
                      type: "string",
                      description: "Update an existing event. eventId MUST come from findEventsByQuery results. Do NOT call this without calling findEventsByQuery first."
                    },
                    date: { type: "string" },
                    summary: { type: "string" },
                    description: { type: "string" },
                    location: { type: "string" },
                    startDateTime: { 
                      type: "string",
                      description: "Local datetime WITHOUT timezone. Format: YYYY-MM-DDTHH:mm:ss"
                    },
                    endDateTime: { 
                      type: "string" ,
                      description: "Local datetime WITHOUT timezone. Format: YYYY-MM-DDTHH:mm:ss"
                    },
                    timeZone: { 
                      type: "string", 
                      description: "IANA time zone identifier, e.g., 'America/New_York'"
                    },
                  },
                  required: ["eventId"]
                },
              },
            },
            {
              type: "function",
              function: {
                name: "deleteEvent",
                description: "Delete an event. eventId MUST come from findEventsByQuery results. Do NOT call this without calling findEventsByQuery first.",
                parameters: {
                  type: "object",
                  properties: {
                    eventId: { 
                      type: "string",
                      description: "Event ID obtanined from findEventsByQuery.REQUIRED."
                    },
                  },
                  required: ["eventId"]
                },
              },
            },
            {
              type: "function", // may be useful for searching events before update/delete, not exposed directly yet
              function: {
                name: "findEventsByQuery",
                description: "REQUIRED before update/delete. Search events by title and optional date filter. Returns list of matching events with IDs.",
                parameters: {
                  type: "object",
                  properties: {
                    q: { 
                      type: "string" , 
                      description: "Event title ONLY. Do NOT include dates, times, or timezones. Examples: 'test event', 'meeting', 'dentist'" 
                    },
                    date: { 
                      type: "string" , 
                      description: "Optional date filter. Format: YYYY-MM-DD. Use when user mentions specific day." 
                    },
                    maxLookAheadDays: { 
                      type: "number", 
                      description: "maximum number of days ahead from today to search. Default is 30. Use 7 for 'this week', 1 for 'today only'."}
                  },
                  required: ["q"],
                }
              }
            }
     ];

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

    const systemInstruction = `You are Garbi, a Google Calendar AI assistant.

<context>
Current: ${currentDateTime} (${timeZone})
Tomorrow: ${tomorrowDate}
</context>

<tool_rules>
CRITICAL - UPDATE/DELETE WORKFLOW:
Step 1: findEventsByQuery({q: "title_only", date?: "YYYY-MM-DD"})
Step 2: updateEvent/deleteEvent({eventId: "from_step_1"})

NEVER update/delete without findEventsByQuery first.

findEventsByQuery:
- q: 2-4 word title ONLY. NO dates, times, or extra text
  ✓ "meeting" "test" "dentist"
  ✗ "meeting on monday" "test event 2025-12-14"
- date: YYYY-MM-DD (optional, use when user specifies a day)
- maxLookAheadDays: search window (default: 30)

createEvent requirements:
- summary, startDateTime, endDateTime, timeZone (required)
- colorId: 1-11 ${Object.entries(colors).map(([id, name]) => `${id}=${name}`).join(', ')}
- location, description (optional)

ListEvents DateTime format: YYYY-MM-DDTHH:mm:ssZ with 'Z'
DateTime format: YYYY-MM-DDTHH:mm:ss (NO timezone suffix, NO 'Z') (except in listEvents timeMin/timeMax)
Timezone: Always use "${timeZone}" unless user specifies otherwise
If event ends after midnight, endDateTime MUST use NEXT DAY's date.
</tool_rules>

<intent_mapping>
list/show/upcoming/what's → listEvents
add/create/schedule/book → createEvent
move/change/reschedule/update → findEventsByQuery → updateEvent
cancel/delete/remove → findEventsByQuery → deleteEvent
casual chat → respond naturally, no tools
</intent_mapping>

<examples>
"21.27'deki test eventi sil" → findEventsByQuery({q:"test", date:"${currentDate}"}) → deleteEvent({eventId})
"yarın 15:00'e toplantı" → createEvent({summary:"toplantı", startDateTime:"${tomorrowDate}T15:00:00", ...})
"pazartesi meeting'i 16:00'e al" → findEventsByQuery({q:"meeting", date:"2025-12-16"}) → updateEvent({eventId, startDateTime:"..."})
</examples>`;

    const GROQ_API_KEY = process.env.GROQ_API_KEY!;

    const groq = new Groq({
      apiKey: GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {role: "system", content: systemInstruction},
        {role: "user", content: prompt}],
      tools: tools,  
    })

    const toolCalls = response.choices[0].message.tool_calls;
    console.log('Tool calls received:', JSON.stringify(toolCalls, null, 2));

    if (!toolCalls || toolCalls.length === 0) {
      const text = response.choices[0].message.content || "I'm sorry, I couldn't process your request.";
      console.log('No function calls, returning text response:', text);
      return { type: "text", message: text };
    }
    
    // Process all function calls sequentially and collect results
    let lastSearchEventId: string | null = null;
    const results: any[] = [];
    for (const call of toolCalls) {
      const { name, arguments: argsString } = call.function;
      const args = JSON.parse(argsString || '{}');
      console.log(`Calling function: ${name}`, 'with args:', JSON.stringify(args, null, 2));

        switch (name) {
          case "listEvents": {
            const maxResults = args.maxResults || 10;
            const timeMin = args.timeMin as string | undefined;
            const timeMax = args.timeMax as string | undefined;
            const events = await calendarService.listEvents(accessToken, maxResults, timeMax, timeMin);
            const result = { type: "events", events };
            results.push(result);
            continue;
          }
          
          case "findEventsByQuery": {
            const q = (args.q as string | undefined)?.trim();
            const date = (args.date as string | undefined)?.trim();
            const maxLookAheadDays = args.maxLookAheadDays || 30;

            const candidates = await calendarService.findEventsByQuery(accessToken,{
              q,
              date,
              maxLookAheadDays
            });

            if(candidates.length === 0) {
              const result = {
                type: "text",
                message: "No events found matching the criteria."
              };
              results.push(result);
              continue;
            }

            // Cache eventId if single result found
            if (candidates.length === 1) {
              lastSearchEventId = candidates[0].id!;
            }

            const result = {
              type: "searchResults",
              message: `Found ${candidates.length} event(s)`,
              events: candidates.map(event => ({
                id: event.id,
                summary: event.summary,
                start: event.start?.dateTime,
                end: event.end?.dateTime,
              }))
            };
            results.push(result);
            continue;
          }

          case "createEvent": {
            try {
              //user's timezone if AI didn't provide one
              const eventTimeZone = args.timeZone || userTimeZone || 'UTC';
              
              //event object from function arguments
              const eventData = {
                summary: args.summary || '(Untitled Event)',
                description: args.description || '',
                location: args.location || '',
                colorId: args.colorId,
                start: {
                  dateTime: args.startDateTime,
                  timeZone: eventTimeZone
                },
                end: {
                  dateTime: args.endDateTime,
                  timeZone: eventTimeZone
                }
              };

              console.log('Creating event with data:', JSON.stringify(eventData, null, 2));

              if (!eventData.start.dateTime || !eventData.end.dateTime) {
                throw new Error('Missing required fields: startDateTime and endDateTime are required');
              }

              const result = await calendarService.createEvent(accessToken, eventData);
              console.log('Event created successfully:', result.event?.id);
              const createResult = { type: "event", event: result.event, message: result.message };
              results.push(createResult);
              continue;
            } catch (error) {
              console.error('Error in createEvent case:', error);
              throw error;
            }
          }
          case "updateEvent": {
            try {
              let eventId = (args.eventId as string | undefined)?.trim() || lastSearchEventId;
              
              if (!eventId) {
                const result = {
                  type: "text",
                  message: "eventId is required. Use findEventsByQuery first."
                };
                results.push(result);
                continue;
              }

              // Fetch existing event
              const existingEvent = await calendarService.getEventById(accessToken, eventId);
              
              // Build updated event data from function arguments
              const updatedEventData: any = {};
              
              if (args.summary !== undefined) updatedEventData.summary = args.summary;
              if (args.description !== undefined) updatedEventData.description = args.description;
              if (args.location !== undefined) updatedEventData.location = args.location;
              if (args.startDateTime) {
                updatedEventData.start = {
                  dateTime: args.startDateTime,
                  timeZone: args.timeZone || userTimeZone || existingEvent.start?.timeZone || 'UTC'
                };
              }
              if (args.endDateTime) {
                updatedEventData.end = {
                  dateTime: args.endDateTime,
                  timeZone: args.timeZone || userTimeZone || existingEvent.end?.timeZone || 'UTC'
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
              const updateResult = { type: "event", event: result.event, message: result.message };
              results.push(updateResult);
              continue;
            } catch (error) {
              console.error('Error in updateEvent case:', error);
              throw error;
            }
          }
          case "deleteEvent": {
            let eventId = (args.eventId as string | undefined)?.trim() || lastSearchEventId;
            
            if (!eventId) {
              const result = {
                type: "text",
                message: "eventId is required. Use findEventsByQuery first."
              };
              results.push(result);
              continue;
            }
            
            const result = await calendarService.deleteEvent(accessToken, eventId);
            const deleteResult = { type: "success", message: result.message };
            results.push(deleteResult);
            continue;
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
    }

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

