'use client';

import { ToggleButtonGroup } from './ui/ToggleButtonGroup';
import { SubSection } from './ui/SectionCard';

interface MeetingPreferencesSectionProps {
    preferredMeetingDuration: number;
    bufferTimeBetweenMeetings: number;
    onDurationChange: (duration: number) => void;
    onBufferChange: (buffer: number) => void;
}

const DURATION_OPTIONS: { value: number; label: string }[] = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "60 min" },
    { value: 90, label: "90 min" },
];

const BUFFER_OPTIONS: { value: number; label: string }[] = [
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
        <div className="space-y-0">
            <SubSection title="Preferred Meeting Duration">
                <ToggleButtonGroup
                    options={DURATION_OPTIONS}
                    value={preferredMeetingDuration}
                    onChange={onDurationChange}
                    ariaLabel="Select preferred meeting duration"
                />
            </SubSection>

            <SubSection title="Buffer Time Between Meetings">
                <ToggleButtonGroup
                    options={BUFFER_OPTIONS}
                    value={bufferTimeBetweenMeetings}
                    onChange={onBufferChange}
                    ariaLabel="Select buffer time between meetings"
                />
            </SubSection>
        </div>
    );
}
