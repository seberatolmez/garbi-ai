'use client';

interface ToggleOption<T extends string | number> {
    value: T;
    label: string;
    description?: string;
}

interface ToggleButtonGroupProps<T extends string | number> {
    options: ToggleOption<T>[];
    value: T;
    onChange: (value: T) => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'danger' | 'warning';
    ariaLabel: string;
    className?: string;
}

export function ToggleButtonGroup<T extends string | number>({
    options,
    value,
    onChange,
    size = 'md',
    variant = 'default',
    ariaLabel,
    className = ''
}: ToggleButtonGroupProps<T>) {
    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base'
    };

    const getActiveClasses = (isActive: boolean) => {
        if (!isActive) {
            return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
        }

        switch (variant) {
            case 'danger':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-amber-500 text-white';
            default:
                return 'bg-[var(--color-blue)] text-white';
        }
    };

    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={`flex flex-wrap gap-2 ${className}`}
        >
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-pressed={isActive}
                        className={`
                            ${sizeClasses[size]}
                            ${getActiveClasses(isActive)}
                            rounded-lg font-medium transition-all duration-200
                            cursor-pointer min-h-[44px]
                            focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/50 focus:ring-offset-2
                        `}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
