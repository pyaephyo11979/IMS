import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ReactNode } from 'react';

// Variants reflect semantic intent for dashboard KPI cards.
export type SectionCardVariant = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'gradient';

interface SectionCardProps {
    title: string;
    description?: string | ReactNode; // small helper / subtitle
    value?: string | number | ReactNode; // prominent metric
    valuePrefix?: string; // e.g. $
    valueSuffix?: string; // e.g. % or unit
    change?: number; // positive/negative change; determines arrow + color
    changeLabel?: string; // textual explanation (vs last week)
    icon?: ReactNode; // main icon
    footer?: ReactNode; // bottom subtle area (e.g. mini legend)
    sparkline?: number[]; // simple inline tiny trend (0..n numbers)
    href?: string; // clickable card
    className?: string;
    variant?: SectionCardVariant;
    loading?: boolean;
    compact?: boolean; // reduced padding and font sizing
    actions?: ReactNode; // top-right custom actions
}

const variantBase: Record<SectionCardVariant, string> = {
    neutral: 'bg-card border border-border/60',
    primary: 'bg-primary/10 border border-primary/30 dark:bg-primary/15',
    success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    danger: 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300',
    warning: 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300',
    gradient: 'bg-gradient-to-br from-primary/90 via-primary to-primary/70 text-primary-foreground shadow-lg border border-primary/20',
};

export function SectionCard({
    title,
    description,
    value,
    valuePrefix,
    valueSuffix,
    change,
    changeLabel,
    icon,
    footer,
    sparkline,
    href,
    className,
    variant = 'neutral',
    loading = false,
    compact = false,
    actions,
}: SectionCardProps) {
    const Wrapper = href ? Link : ('div' as const);
    const wrapperProps = href ? { href, 'aria-label': title } : { 'aria-label': undefined };

    // Derive display value: If no explicit value but description is a primitive number-ish, treat it as value.
    let derivedValue = value;
    let derivedDescription = description;
    if (derivedValue == null && typeof description === 'string' && description.trim().match(/^\d[\d,_.]*$/)) {
        derivedValue = description;
        derivedDescription = undefined;
    }

    const positive = typeof change === 'number' ? change > 0 : undefined;
    const negative = typeof change === 'number' ? change < 0 : undefined;

    // Normalize sparkline values 0..1 for relative heights
    const normalizedSpark =
        sparkline && sparkline.length > 1
            ? (() => {
                  const min = Math.min(...sparkline);
                  const max = Math.max(...sparkline);
                  const range = max - min || 1;
                  return sparkline.map((v) => (v - min) / range);
              })()
            : undefined;

    return (
        <Wrapper
            {...(wrapperProps as Record<string, unknown>)}
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-xl p-4 transition-all focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none',
                href && 'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
                variantBase[variant],
                loading && 'pointer-events-none opacity-70',
                compact && 'p-3',
                className,
            )}
        >
            {variant === 'gradient' && (
                <div className="pointer-events-none absolute inset-0 opacity-25">
                    <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
                    <div className="absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                </div>
            )}

            <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                    <span
                        className={cn(
                            'text-xs font-medium tracking-wide text-muted-foreground uppercase',
                            variant === 'gradient' && 'text-primary-foreground/80',
                        )}
                    >
                        {title}
                    </span>
                    {derivedDescription && (
                        <span
                            className={cn(
                                'mt-0.5 line-clamp-2 text-xs text-muted-foreground',
                                variant === 'gradient' && 'text-primary-foreground/70',
                            )}
                        >
                            {derivedDescription}
                        </span>
                    )}
                </div>
                <div className="flex items-start gap-2">
                    {actions}
                    {icon && (
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg border bg-background/70 text-foreground shadow-sm backdrop-blur-sm',
                                variant === 'gradient' && 'border-white/30 bg-white/10 text-primary-foreground',
                            )}
                        >
                            {icon}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-10 mt-4 flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col">
                    <div className={cn('leading-none font-semibold tracking-tight tabular-nums', compact ? 'text-2xl' : 'text-3xl md:text-4xl')}>
                        {loading ? (
                            <span className="inline-block h-7 w-28 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                {valuePrefix && <span className="pr-1 font-normal opacity-70">{valuePrefix}</span>}
                                {derivedValue}
                                {valueSuffix && <span className="pl-1 font-normal opacity-70">{valueSuffix}</span>}
                            </>
                        )}
                    </div>
                    {typeof change === 'number' && !loading && (
                        <div
                            className={cn(
                                'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                                positive && 'bg-emerald-500/10 text-emerald-600 ring-emerald-600/30 dark:text-emerald-400',
                                negative && 'bg-rose-500/10 text-rose-600 ring-rose-600/30 dark:text-rose-400',
                                positive === false && negative === false && 'bg-muted text-foreground/70',
                            )}
                        >
                            {positive && <ArrowUpRight className="h-3.5 w-3.5" />}
                            {negative && <ArrowDownRight className="h-3.5 w-3.5" />}
                            <span>
                                {Math.abs(change)}
                                {valueSuffix || '%'}
                            </span>
                            {changeLabel && <span className="pl-1 opacity-70">{changeLabel}</span>}
                        </div>
                    )}
                </div>
                {normalizedSpark && (
                    <div className="ml-auto flex h-12 w-28 items-end gap-1">
                        {normalizedSpark.map((h, i) => (
                            <span
                                key={i}
                                style={{ height: `${Math.max(8, h * 48)}px` }}
                                className={cn(
                                    'flex-1 rounded-sm bg-primary/50 transition-colors group-hover:bg-primary/70',
                                    negative && 'bg-rose-500/50 group-hover:bg-rose-500/70',
                                    positive && 'bg-emerald-500/50 group-hover:bg-emerald-500/70',
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {footer && (
                <div
                    className={cn(
                        'relative z-10 mt-4 flex items-center justify-between text-xs text-muted-foreground',
                        variant === 'gradient' && 'text-primary-foreground/70',
                    )}
                >
                    {footer}
                </div>
            )}

            {href && (
                <span className="pointer-events-none absolute inset-0 rounded-xl ring-transparent ring-inset group-focus-visible:ring-2 group-focus-visible:ring-primary/60" />
            )}
        </Wrapper>
    );
}
