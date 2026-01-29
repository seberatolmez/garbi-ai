'use client';

import { SchedulePreferenceSection } from "@/app/components/SchedulePreferenceSection";
import { CategoryColorSection } from "@/app/components/CategoryColorSection";
import { RulesSection } from "@/app/components/RulesSection";
import { MeetingPreferencesSection } from "@/app/components/MeetingPreferencesSection";
import { FocusTimeSection } from "@/app/components/FocusTimeSection";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { useUserPreferences } from "@/app/hooks/useUserPreferences";
import { Schedule, CategoryColor, UserRule, FocusTimePreference } from "@/app/types/types";
import { UserPreferencesData } from "@/lib/supabase-client";
import { AlertCircle } from "lucide-react";

interface UserPreferencesClientPageProps {
    initialData: UserPreferencesData;
}

export function UserPreferencesClientPage({ initialData }: UserPreferencesClientPageProps) {
    const {
        preferences,
        error,
        updatePreference
    } = useUserPreferences({ fallbackData: initialData });

    // Error state
    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Failed to load preferences
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">
                        We couldn't load your preferences. Please try refreshing the page.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="
                            px-5 py-2.5 min-h-[44px]
                            bg-[var(--color-blue)] text-white
                            rounded-lg text-sm font-medium
                            hover:bg-[var(--color-blue)]/90
                            focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/50 focus:ring-offset-2
                            transition-all duration-200 cursor-pointer
                        "
                    >
                        Refresh Page
                    </button>
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
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-3xl mx-auto">
                {/* Page Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                User Preferences
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Customize how Garbi schedules your calendar
                            </p>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
                            Auto-saving enabled
                        </span>
                    </div>
                </header>

                {/* Hours Section */}
                <SectionCard
                    title="Hours"
                    description="Set your default hours for Garbi's smart calendar scheduling. Unlike regular calendars, Garbi uses these time windows to intelligently schedule your tasks, meetings, and focus time within your preferred hours."
                >
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
                </SectionCard>

                {/* Meeting Preferences Section */}
                <SectionCard
                    title="Meeting Preferences"
                    description="Configure default meeting duration and buffer times between meetings. Garbi will use these preferences when scheduling new meetings."
                >
                    <MeetingPreferencesSection
                        preferredMeetingDuration={preferredMeetingDuration}
                        bufferTimeBetweenMeetings={bufferTimeBetweenMeetings}
                        onDurationChange={(value) => updatePreference('preferredMeetingDuration', value)}
                        onBufferChange={(value) => updatePreference('bufferTimeBetweenMeetings', value)}
                    />
                </SectionCard>

                {/* Focus Time Section */}
                <SectionCard
                    title="Focus Time Preferences"
                    description="Customize how Garbi schedules your deep work sessions. Set your preferred focus blocks, duration limits, and when you're most productive."
                >
                    <FocusTimeSection
                        focusTimePreference={focusTimePreferences}
                        onChange={(value) => updatePreference('focusTimePreferences', value)}
                    />
                </SectionCard>

                {/* Rules Section */}
                <SectionCard
                    title="Rules"
                    description="Define custom rules for Garbi to follow when scheduling your events. Hard rules are strictly enforced, while soft rules are preferred but flexible."
                >
                    <RulesSection
                        rules={rules}
                        onChange={(value) => updatePreference('rules', value)}
                    />
                </SectionCard>

                {/* Category Colors Section */}
                <SectionCard
                    title="Category Colors"
                    description="Customize how Garbi colors your calendar events. Each category represents a different type of event that Garbi creates or recognizes."
                >
                    <CategoryColorSection
                        categoryColors={categoryColors}
                        onChange={(value) => updatePreference('categoryColors', value)}
                    />
                </SectionCard>
            </div>
        </div>
    );
}
