'use client'

import React from 'react'
import { MDXComponents } from 'mdx/types'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { List, ListItem } from '@/components/ui/list/list'
import Ruler from '@/components/ui/ruler/ruler'
import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'

export const mdxComponents: MDXComponents = {
    // Headings
    h1: ({ children }) => (
        <TextHeading as="h1" weight="bold" className="mt-8 mb-4">
            {children}
        </TextHeading>
    ),
    h2: ({ children }) => (
        <TextHeading as="h2" weight="bold" className="mt-6 mb-3">
            {children}
        </TextHeading>
    ),
    h3: ({ children }) => (
        <TextHeading as="h3" weight="medium" className="mt-4 mb-2">
            {children}
        </TextHeading>
    ),
    h4: ({ children }) => (
        <TextHeading as="h4" weight="medium" className="mt-3 mb-2">
            {children}
        </TextHeading>
    ),

    // Paragraph
    p: ({ children }) => (
        <Text className="mb-4 text-foreground dark:text-foreground">
            {children}
        </Text>
    ),

    // Lists
    ul: ({ children }) => (
        <List className="mb-4">
            {children}
        </List>
    ),
    ol: ({ children }) => (
        <List type="ordered" className="mb-4">
            {children}
        </List>
    ),
    li: ({ children }) => (
        <ListItem>
            {children}
        </ListItem>
    ),

    // Inline text styling
    strong: ({ children }) => (
        <span className="font-bold text-foreground dark:text-foreground">
            {children}
        </span>
    ),
    em: ({ children }) => (
        <span className="italic text-muted-foreground dark:text-muted-foreground">
            {children}
        </span>
    ),
    code: ({ children, className }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';

        if (!language) {
            // Inline code
            return (
                <code className={cn(
                    monoFont.className,
                    "relative px-[0.4em] mx-[0.1em]",
                    "text-[0.9em]",
                    "bg-clip-text",
                    "text-transparent",
                    "bg-gradient-to-b from-lychee-600 via-lychee-700 to-lychee-600",
                    "dark:from-lychee-200 dark:via-lychee-300 dark:to-lychee-200",
                    "before:absolute before:-inset-[0.5px]",
                    "before:bg-gradient-to-b",
                    "before:from-lychee-100/50 before:via-lychee-100/30 before:to-transparent",
                    "dark:before:from-lychee-800/30 dark:before:via-lychee-800/20 dark:before:to-transparent",
                    "before:backdrop-blur-[0.25px]",
                    "before:-z-10",
                    "after:absolute after:inset-y-[0.15em]",
                    "after:left-0 after:w-[1.5px]",
                    "after:bg-gradient-to-b after:from-lychee-400 after:via-lychee-500/50 after:to-lychee-400",
                    "dark:after:from-lychee-300 dark:after:via-lychee-400/40 dark:after:to-lychee-300",
                    "after:opacity-30 dark:after:opacity-20",
                    "shadow-[0_0_8px_-4px_rgba(147,51,234,0.1)]",
                    "dark:shadow-[0_0_8px_-4px_rgba(216,180,254,0.1)]",
                    "inline-block leading-tight"
                )}>
                    {children}
                </code>
            );
        }

        // Code block
        return (
            <pre className={cn(
                'p-4 rounded-md bg-gray-100 dark:bg-gray-800 overflow-x-auto',
                monoFont.className,
                className
            )}>
                <code className={`language-${language}`}>
                    {children}
                </code>
            </pre>
        );
    },

    // Block elements
    blockquote: ({ children }) => (
        <blockquote className={cn(
            "pl-4 border-l-2 border-lychee-500/50",
            "my-4 italic",
            "text-muted-foreground/90 dark:text-muted-foreground/90"
        )}>
            {children}
        </blockquote>
    ),
    hr: () => <Ruler color="gray" marginTop="md" marginBottom="md" />,

    // Links
    a: ({ href, children }) => (
        <a 
            href={href} 
            className={cn(
                "text-lychee-600 dark:text-lychee-300",
                "hover:text-lychee-700 dark:hover:text-lychee-200",
                "transition-colors duration-200",
                "decoration-lychee-300/50 dark:decoration-lychee-500/50",
                "hover:decoration-lychee-400 dark:hover:decoration-lychee-400"
            )}
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
            {children}
        </a>
    ),
}
