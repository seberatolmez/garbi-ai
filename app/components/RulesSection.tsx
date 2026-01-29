'use client';

import { useState } from "react";
import { UserRule, PriorityLevel } from "../types/types";
import { Trash2, ListTodo } from "lucide-react";
import { ToggleButtonGroup } from "./ui/ToggleButtonGroup";

interface RulesSectionProps {
    rules: UserRule[];
    onChange: (rules: UserRule[]) => void;
}

const PRIORITY_OPTIONS = [
    { value: "hard" as const, label: "Hard" },
    { value: "soft" as const, label: "Soft" },
];

export function RulesSection({ rules, onChange }: RulesSectionProps) {
    const [newRuleText, setNewRuleText] = useState("");
    const [newRulePriority, setNewRulePriority] = useState<PriorityLevel>("soft");

    const handleAddRule = () => {
        if (!newRuleText.trim()) return;

        const newRule: UserRule = {
            id: crypto.randomUUID(),
            text: newRuleText.trim(),
            priority: newRulePriority,
        };

        onChange([...rules, newRule]);
        setNewRuleText("");
    };

    const handleDeleteRule = (id: string) => {
        onChange(rules.filter(rule => rule.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newRuleText.trim()) {
            e.preventDefault();
            handleAddRule();
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Rule Input */}
            <div className="flex flex-col gap-3">
                <label htmlFor="new-rule-input" className="sr-only">
                    Enter a new rule
                </label>
                <input
                    id="new-rule-input"
                    type="text"
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a new rule..."
                    className="
                        w-full px-4 py-2.5 min-h-[44px]
                        border border-gray-200 rounded-lg
                        text-sm text-gray-700 bg-white
                        focus:outline-none focus:border-[var(--color-blue)]
                        focus:ring-2 focus:ring-[var(--color-blue)]/10
                        transition-all duration-200
                    "
                />

                <div className="flex flex-wrap items-center gap-3">
                    <ToggleButtonGroup
                        options={PRIORITY_OPTIONS}
                        value={newRulePriority}
                        onChange={setNewRulePriority}
                        ariaLabel="Select rule priority"
                        variant={newRulePriority === "hard" ? "danger" : "warning"}
                        size="sm"
                    />

                    <button
                        type="button"
                        onClick={handleAddRule}
                        disabled={!newRuleText.trim()}
                        className="
                            px-5 py-2.5 min-h-[44px]
                            bg-[var(--color-blue)] text-white
                            rounded-lg text-sm font-medium
                            hover:bg-[var(--color-blue)]/90
                            focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/50 focus:ring-offset-2
                            transition-all duration-200 cursor-pointer
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        Add Rule
                    </button>
                </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3" role="list" aria-label="Your scheduling rules">
                {rules.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                        <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                            No rules defined yet.
                        </p>
                        <p className="text-gray-400 text-sm">
                            Add your first rule above to help Garbi schedule better.
                        </p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div
                            key={rule.id}
                            role="listitem"
                            className="
                                group flex items-center gap-3 p-4
                                bg-gray-50 rounded-xl
                                hover:bg-gray-100 transition-all duration-200
                            "
                        >
                            {/* Priority Badge */}
                            <span
                                className={`
                                    px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                    ${rule.priority === "hard"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-amber-100 text-amber-600"
                                    }
                                `}
                            >
                                {rule.priority}
                            </span>

                            {/* Rule Text */}
                            <span className="flex-1 text-sm text-gray-700">{rule.text}</span>

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={() => handleDeleteRule(rule.id)}
                                aria-label={`Delete rule: ${rule.text}`}
                                className="
                                    opacity-0 group-hover:opacity-100
                                    p-2 min-w-[44px] min-h-[44px]
                                    text-gray-400 hover:text-red-500
                                    rounded-full hover:bg-red-50
                                    focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-red-500/50
                                    transition-all duration-200 cursor-pointer
                                    flex items-center justify-center
                                "
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
