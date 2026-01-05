import { SchedulePreferenceSection } from "@/app/components/SchedulePreferenceSection";
import { useState } from "react";
import { Schedule } from "@/app/types/types";

export default function UserPreferencesPage() {

    const [workingHours, setWorkingHours] = useState<Schedule>({});
    const [personelHours, setPersonelHours] = useState<Schedule>({});
    const [meetingHours, setMeetingHours] = useState<Schedule>({});

    return (
        <div className="min-h-screen p-8 bg-background">
            <h1 className="text-2xl font-bold mb-6">User Preferences</h1>
            <SchedulePreferenceSection
                label="Working Hours"
                value={workingHours}
                onChange={setWorkingHours}
            />
            <SchedulePreferenceSection
                label="Personal Hours"
                value={personelHours}
                onChange={setPersonelHours}
            />
            <SchedulePreferenceSection
                label="Meeting Hours"
                value={meetingHours}
                onChange={setMeetingHours}
            />
        </div>
    )

}