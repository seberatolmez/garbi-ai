import { X, Trash2, Bell, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { EventDetailsPopoverProps } from "../types/types";
import { COLORS } from "../types/colors";

export const EventDetailsPopover = ({
  event,
  position,
  onClose,
  onDelete,
}: EventDetailsPopoverProps) => {
  const colorId = parseInt(event.colorId, 10);
  const colorHex = COLORS[colorId]?.hex || COLORS[1].hex;

  const formatDateTime = () => {
    if (!event.date) return `${event.startTime} - ${event.endTime}`;

    try {
      const eventDate = parseISO(event.date + "T00:00:00");
      const dayName = format(eventDate, "EEEE");
      const monthDay = format(eventDate, "MMMM d");
      const timeRange = `${event.startTime} – ${event.endTime}`;
      return `${dayName}, ${monthDay} ⋅ ${timeRange}`;
    } catch {
      return `${event.date} ⋅ ${event.startTime} - ${event.endTime}`;
    }
  };

  const formatReminder = (minutes: number) => {
    if (minutes === 0) return "At time of event";
    if (minutes < 60) return `${minutes} minutes before`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} ${hours === 1 ? "hour" : "hours"} before`;
    return `${hours}h ${mins}m before`;
  };

  const hasReminders =
    event.reminders?.overrides && event.reminders.overrides.length > 0;
  const hasOrganizer = event.organizer?.displayName || event.organizer?.email;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div
        className="fixed bg-white rounded-lg shadow-2xl z-[100] overflow-hidden"
        style={{
          top: position.y,
          left: position.x,
          width: "400px",
          maxHeight: "600px",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: colorHex }}
        />

        <div className="pl-6 pr-4 py-5">
          <div className="absolute top-4 right-4 flex gap-1">
            <button
              onClick={onDelete}
              title="Delete"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Trash2 size={18} className="text-gray-600" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          <h1 className="text-[22px] font-normal text-gray-900 mb-3 pr-20 leading-tight">
            {event.title}
          </h1>

          <div className="text-sm text-gray-600 mb-6 leading-relaxed">
            {formatDateTime()}
          </div>

          {hasReminders && (
            <div className="flex items-start gap-3 mb-4">
              <div className="pt-0.5">
                <Bell size={18} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <ol className="space-y-1">
                  {event.reminders!.overrides!.map((reminder, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {formatReminder(reminder.minutes)}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {hasOrganizer && event.organizer && (
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Calendar size={18} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-700 font-medium">
                  Organizer: {event.organizer.displayName || "Unknown"}
                </div>
                {event.organizer.email && (
                  <div className="text-sm text-gray-600 mt-0.5">
                    {event.organizer.email}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
