'use client';

interface MeetingPreferencesSectionProps {
    preferredMeetingDuration: number;
    bufferTimeBetweenMeetings: number;
    onDurationChange: (duration: number) => void;
    onBufferChange: (buffer: number) => void;
}

const DURATION_OPTIONS = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "60 min" },
    { value: 90, label: "90 min" },
];

const BUFFER_OPTIONS = [
    { value: 0, label: "None" },
    { value: 5, label: "5 min" },
    { value: 10, label: "10 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
];

export function MeetingPreferencesSection({
    preferredMeetingDuration,
    bufferTimeBetweenMeetings,
    onDurationChange,
    onBufferChange,
}: MeetingPreferencesSectionProps) {
    return (
        <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Meeting Preferences</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Configure default meeting duration and buffer times between meetings.
                Garbi will use these preferences when scheduling new meetings.
            </p>

            {/* Preferred Meeting Duration */}
            <div className="py-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#3034FF] mb-4">
                    Preferred Meeting Duration
                </h3>
                <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onDurationChange(option.value)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                                ${preferredMeetingDuration === option.value
                                    ? "bg-[#3034FF] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Buffer Time Between Meetings */}
            <div className="py-5">
                <h3 className="text-base font-semibold text-[#3034FF] mb-4">
                    Buffer Time Between Meetings
                </h3>
                <div className="flex flex-wrap gap-2">
                    {BUFFER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onBufferChange(option.value)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                                ${bufferTimeBetweenMeetings === option.value
                                    ? "bg-[#3034FF] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
