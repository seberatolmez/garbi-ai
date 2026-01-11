import { Hash } from "lucide-react";
import nextAuth from "next-auth";
import { MouseEvent as ReactMouseEvent } from "react";

//auth types

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

export type CalendarView = "day" | "week" | "month";

export interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent, mouseEvent: ReactMouseEvent) => void;
  view: CalendarView;
}

export interface CalendarEvent {
  // move away and reuse in other places
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date?: string;
  colorId: string; // between 1-11
  description?: string;
  organizer?: {
    displayName?: string;
    email?: string;
  };
  reminders?: {
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
    useDefault?: boolean;
  };
}

export interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent, mouseEvent: ReactMouseEvent) => void;
}

// Calculate event position and dimensions
export interface EventPosition {
  top: number;
  height: number;
  startMinutes: number;
  endMinutes: number;
}

// Group overlapping events and calculate horizontal positions
export interface PositionedEvent {
  event: CalendarEvent;
  position: EventPosition;
  left: number;
  width: number;
}

export interface EventDetailsPopoverProps {
  event: CalendarEvent & { position: { x: number; y: number } };
  position: { x: number; y: number };
  onClose: () => void;
  onDelete: () => void;
}

// useVoiceInput hook interfaces

export interface UseVoiceInputOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'recording' | 'error') => void;
}

export interface UseVoiceInputReturn {
  isRecording: boolean;
  isConnecting: boolean;
  status: 'idle' | 'connecting' | 'recording' | 'error';
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

// user-preferences interfaces 

export type Day =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface TimeInterval {
  start: string, // "09:00"
  end: string   // "18:00"
}
export type Schedule = { // for working, meeting and personel hours 
  [key in Day]?: TimeInterval[]
};

export type Category =
  | "Team Meeting"
  | "Work"
  | "Personal"
  | "External Meeting"
  | "Travel & Breaks"
  | "Other";

export interface CategoryColor {
  category: Category;
  color: string; // Google Calendar color between 1-11
}

export type ChronoType = "morning" | "afternoon" | "evening" | "night";
export type PriorityLevel = "hard" | "soft";

export interface UserRule {
  id: string,
  text: string,
  priority: PriorityLevel,
}

export interface FocusTimePreference {
  preferredBlocks: TimeInterval[],
  minimumDuration: number,
  maximumDuration: number,
  chronoType: ChronoType,
  interruptionSensitivity?: "low" | "medium" | "high"
}

export interface UserPreferences {
  workingHours?: Schedule,
  personelHours?: Schedule,
  meetingHours?: Schedule,
  rules?: UserRule[],
  preferredMeetingDuration?: number,
  bufferTimeBetweenMeetings?: number,
  focusTimePreferences?: FocusTimePreference,
  preferredColors?: CategoryColor[]
}

