'use client';

import { useState } from "react";
import { UserRule, PriorityLevel } from "../types/types";
import { Trash2 } from "lucide-react";

interface RulesSectionProps {
    rules: UserRule[];
    onChange: (rules: UserRule[]) => void;
}

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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newRuleText.trim()) {
            handleAddRule();
        }
    };

    return (
        <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Rules</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Define custom rules for Garbi to follow when scheduling your events.
                Hard rules are strictly enforced, while soft rules are preferred but flexible.
            </p>

            {/* Add Rule Input */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="text"
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a new rule..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#3034FF] focus:ring-2 focus:ring-[#3034FF]/10"
                />

                {/* Priority Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setNewRulePriority("hard")}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                            ${newRulePriority === "hard"
                                ? "bg-red-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Hard
                    </button>
                    <button
                        onClick={() => setNewRulePriority("soft")}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                            ${newRulePriority === "soft"
                                ? "bg-amber-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Soft
                    </button>
                </div>

                <button
                    onClick={handleAddRule}
                    disabled={!newRuleText.trim()}
                    className="px-5 py-2.5 bg-[#3034FF] text-white rounded-lg text-sm font-medium hover:bg-[#2528cc] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Rule
                </button>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
                {rules.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No rules defined yet. Add your first rule above.
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div
                            key={rule.id}
                            className="group flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                            {/* Priority Badge */}
                            <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                    ${rule.priority === "hard"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-amber-100 text-amber-600"
                                    }`}
                            >
                                {rule.priority}
                            </span>

                            {/* Rule Text */}
                            <span className="flex-1 text-sm text-gray-700">{rule.text}</span>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition cursor-pointer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
