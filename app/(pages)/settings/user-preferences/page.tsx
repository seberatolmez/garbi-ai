'use client';

import { SchedulePreferenceSection } from "@/app/components/SchedulePreferenceSection";
import { CategoryColorSection } from "@/app/components/CategoryColorSection";
import { RulesSection } from "@/app/components/RulesSection";
import { MeetingPreferencesSection } from "@/app/components/MeetingPreferencesSection";
import { FocusTimeSection } from "@/app/components/FocusTimeSection";
import { useUserPreferences } from "@/app/hooks/useUserPreferences";
import { Schedule, CategoryColor, UserRule, FocusTimePreference } from "@/app/types/types";
import { Loader } from "@/components/ui/shadcn-io/ai/loader";

export default function UserPreferencesPage() {
    const {
        preferences,
        isLoading,
        error,
        updatePreference
    } = useUserPreferences();

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader size={24} />
                    <p className="text-gray-500">Loading your preferences...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-red-500 mb-2">Failed to load preferences</p>
                    <p className="text-gray-500 text-sm">Please refresh the page to try again</p>
                </div>
            </div>
        );
    }

    // Default values with fallbacks
    const workingHours: Schedule = preferences?.workingHours || {};
    const personalHours: Schedule = preferences?.personalHours || {};
    const meetingHours: Schedule = preferences?.meetingHours || {};
    const categoryColors: CategoryColor[] = preferences?.categoryColors || [];
    const rules: UserRule[] = preferences?.rules || [];
    const preferredMeetingDuration: number = preferences?.preferredMeetingDuration || 30;
    const bufferTimeBetweenMeetings: number = preferences?.bufferTimeBetweenMeetings || 10;
    const focusTimePreferences: FocusTimePreference = preferences?.focusTimePreferences || {
        preferredBlocks: [{ start: "09:00", end: "12:00" }],
        minimumDuration: 60,
        maximumDuration: 120,
        chronoType: "morning",
        interruptionSensitivity: "medium",
    };

    return (
        <div className="min-h-screen p-8 bg-white">
            <div className="max-w-3xl mx-auto">
                {/* Auto-save indicator */}
                <div className="mb-4 text-right">
                    <span className="text-xs text-gray-400">
                        ✓ Changes are saved automatically
                    </span>
                </div>

                {/* Hours Section */}
                <div className="mb-10">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Hours</h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        Set your default hours for Garbi's smart calendar scheduling. Unlike regular calendars,
                        Garbi uses these time windows to intelligently schedule your tasks, meetings, and focus
                        time within your preferred hours. Your hours are in <strong>GMT+03:00</strong>.
                    </p>

                    <SchedulePreferenceSection
                        label="Working Hours"
                        subtitle="Default for work Tasks & Habits"
                        value={workingHours}
                        onChange={(value) => updatePreference('workingHours', value)}
                    />
                    <SchedulePreferenceSection
                        label="Meeting Hours"
                        subtitle="Default for Smart Meetings & Scheduling Link meetings"
                        value={meetingHours}
                        onChange={(value) => updatePreference('meetingHours', value)}
                    />
                    <SchedulePreferenceSection
                        label="Personal Hours"
                        subtitle="Default for personal Tasks & Habits"
                        value={personalHours}
                        onChange={(value) => updatePreference('personalHours', value)}
                    />
                </div>

                {/* Meeting Preferences Section */}
                <MeetingPreferencesSection
                    preferredMeetingDuration={preferredMeetingDuration}
                    bufferTimeBetweenMeetings={bufferTimeBetweenMeetings}
                    onDurationChange={(value) => updatePreference('preferredMeetingDuration', value)}
                    onBufferChange={(value) => updatePreference('bufferTimeBetweenMeetings', value)}
                />

                {/* Focus Time Section */}
                <FocusTimeSection
                    focusTimePreference={focusTimePreferences}
                    onChange={(value) => updatePreference('focusTimePreferences', value)}
                />

                {/* Rules Section */}
                <RulesSection
                    rules={rules}
                    onChange={(value) => updatePreference('rules', value)}
                />

                {/* Category Colors Section */}
                <CategoryColorSection
                    categoryColors={categoryColors}
                    onChange={(value) => updatePreference('categoryColors', value)}
                />
            </div>
        </div>
    )
}
