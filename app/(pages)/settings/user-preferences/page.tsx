'use client';

import { SchedulePreferenceSection } from "@/app/components/SchedulePreferenceSection";
import { CategoryColorSection } from "@/app/components/CategoryColorSection";
import { RulesSection } from "@/app/components/RulesSection";
import { MeetingPreferencesSection } from "@/app/components/MeetingPreferencesSection";
import { FocusTimeSection } from "@/app/components/FocusTimeSection";
import { useState } from "react";
import { Schedule, CategoryColor, UserRule, FocusTimePreference } from "@/app/types/types";

export default function UserPreferencesPage() {

    const [workingHours, setWorkingHours] = useState<Schedule>({});
    const [personelHours, setPersonelHours] = useState<Schedule>({});
    const [meetingHours, setMeetingHours] = useState<Schedule>({});
    const [categoryColors, setCategoryColors] = useState<CategoryColor[]>([]);
    const [rules, setRules] = useState<UserRule[]>([]);
    const [preferredMeetingDuration, setPreferredMeetingDuration] = useState<number>(30);
    const [bufferTimeBetweenMeetings, setBufferTimeBetweenMeetings] = useState<number>(10);
    const [focusTimePreferences, setFocusTimePreferences] = useState<FocusTimePreference>({
        preferredBlocks: [{ start: "09:00", end: "12:00" }],
        minimumDuration: 60,
        maximumDuration: 120,
        chronoType: "morning",
        interruptionSensitivity: "medium",
    });

    return (
        <div className="min-h-screen p-8 bg-white">
            <div className="max-w-3xl mx-auto">
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
                        onChange={setWorkingHours}
                    />
                    <SchedulePreferenceSection
                        label="Meeting Hours"
                        subtitle="Default for Smart Meetings & Scheduling Link meetings"
                        value={meetingHours}
                        onChange={setMeetingHours}
                    />
                    <SchedulePreferenceSection
                        label="Personal Hours"
                        subtitle="Default for personal Tasks & Habits"
                        value={personelHours}
                        onChange={setPersonelHours}
                    />
                </div>

                {/* Meeting Preferences Section */}
                <MeetingPreferencesSection
                    preferredMeetingDuration={preferredMeetingDuration}
                    bufferTimeBetweenMeetings={bufferTimeBetweenMeetings}
                    onDurationChange={setPreferredMeetingDuration}
                    onBufferChange={setBufferTimeBetweenMeetings}
                />

                {/* Focus Time Section */}
                <FocusTimeSection
                    focusTimePreference={focusTimePreferences}
                    onChange={setFocusTimePreferences}
                />

                {/* Rules Section */}
                <RulesSection
                    rules={rules}
                    onChange={setRules}
                />

                {/* Category Colors Section */}
                <CategoryColorSection
                    categoryColors={categoryColors}
                    onChange={setCategoryColors}
                />
            </div>
        </div>
    )
}
