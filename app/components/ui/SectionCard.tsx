'use client';

import { ReactNode } from 'react';

interface SectionCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function SectionCard({
    title,
    description,
    children,
    className = ''
}: SectionCardProps) {
    return (
        <section
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 ${className}`}
            aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <header className="mb-6">
                <h2
                    id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-lg font-semibold text-gray-900 mb-2"
                >
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {description}
                    </p>
                )}
            </header>
            <div className="space-y-6">
                {children}
            </div>
        </section>
    );
}

interface SubSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function SubSection({
    title,
    description,
    children,
    className = ''
}: SubSectionProps) {
    return (
        <div className={`py-5 border-b border-gray-100 last:border-b-0 last:pb-0 first:pt-0 ${className}`}>
            <div className="mb-4">
                <h3 className="text-base font-semibold text-[var(--color-blue)]">{title}</h3>
                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
            {children}
        </div>
    );
}
