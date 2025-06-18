import { cn } from '@/lib/utils/utils';

interface FooterDividerProps {
    color?: string;
    vertical?: boolean;
}

export function FooterDivider({ color = 'lychee', vertical = true }: FooterDividerProps) {
    return (
        <div 
            className={cn(
                vertical ? "h-4 sm:h-4.5 w-[1.5px]" : "h-[1.5px] w-4 sm:w-4.5",
                "mx-3 sm:mx-4",
                color === 'lychee' ? "bg-lychee-400/40 dark:bg-lychee-300/40" : `bg-${color}-400/40 dark:bg-${color}-300/40`
            )} 
        />
    )
} 