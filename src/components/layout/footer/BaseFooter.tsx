'use client'

import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'
import { Github, Twitter, Mail } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface BaseFooterProps {
    color?: 'lychee' | 'blue' | 'green' | 'orange' | 'red' | 'yellow' | 'pink' | 'cyan' | 'gray' | 'white';
    navigationLinks?: React.ReactNode;
    className?: string;
    showToTop?: boolean;
    showSectionName?: boolean;
    showSocialLinks?: boolean;
    showCopyright?: boolean;
}

export function BaseFooter({ 
    color = 'lychee', 
    navigationLinks, 
    className,
    showToTop = true,
    showSectionName = true,
    showSocialLinks = true,
    showCopyright = true
}: BaseFooterProps) {
    const socialLinks = [
        { href: "mailto:venkat@datafruit.dev", icon: <Mail className="w-3 h-3 sm:w-4 sm:h-4" /> },
        { href: "https://github.com/vml645", icon: <Github className="w-3 h-3 sm:w-4 sm:h-4" /> },
        { href: "https://x.com/venkat9165", icon: <Twitter className="w-3 h-3 sm:w-4 sm:h-4" /> }
    ]

    return (
        <footer className={cn("relative mt-auto pt-12", className)}>
            {/* Gradient Line */}
            <div className="relative w-full mb-8">
                <div className={cn(
                    "absolute inset-0 w-full",
                    "h-[1px]",
                    "bg-gradient-to-r",
                    color === 'lychee' && [
                        "from-transparent via-lychee-500/30 to-transparent",
                        "dark:via-lychee-400/30"
                    ],
                    color === 'blue' && [
                        "from-transparent via-blue-500/30 to-transparent",
                        "dark:via-blue-400/30"
                    ],
                    color === 'green' && [
                        "from-transparent via-green-500/30 to-transparent",
                        "dark:via-green-400/30"
                    ]
                )} />
            </div>

            <div className={cn(
                monoFont.className,
                "w-full max-w-screen-md mx-auto px-4",
                "flex flex-col items-center gap-4 sm:gap-6",
                "text-sm text-muted-foreground/60"
            )}>
                {/* Navigation Links - First Row */}
                {navigationLinks && (showToTop || showSectionName) && (
                    <div className="flex flex-wrap items-center justify-center gap-x-3">
                        {navigationLinks}
                    </div>
                )}

                {/* Social Links and Copyright - Second Row */}
                {(showSocialLinks || showCopyright) && (
                    <div className="flex items-center justify-center gap-6 sm:gap-8">
                        {/* Social Links */}
                        {showSocialLinks && (
                            <div className="flex items-center gap-6">
                                {socialLinks.map((link, index) => (
                                    <motion.div
                                        key={link.href}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.2,
                                            delay: index * 0.1 
                                        }}
                                    >
                                        <Link
                                            href={link.href}
                                            target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                                            className={cn(
                                                "block text-lychee-500/80 hover:text-lychee-600 dark:text-lychee-400/80 dark:hover:text-lychee-300",
                                                "transition-colors duration-200",
                                                "hover:bg-lychee-400/10 rounded-md dark:hover:bg-lychee-500/10",
                                                "hover:shadow-md hover:shadow-lychee-500/5"
                                            )}
                                        >
                                            {link.icon}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Copyright */}
                        {showCopyright && (
                            <motion.span 
                                className="text-[10px] sm:text-xs text-lychee-500/80 dark:text-lychee-400/80"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                © {new Date().getFullYear()} venkatl.com
                            </motion.span>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom padding */}
            <div className="h-8" />
        </footer>
    )
} 