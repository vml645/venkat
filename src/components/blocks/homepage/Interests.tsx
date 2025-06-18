import { motion } from 'framer-motion'
import { Code, Brain, Music, Rotate3D } from 'lucide-react'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Text from '@/components/ui/text/text'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Link from 'next/link'

interface WorkItemProps {
    icon: React.ReactNode;
    text: string;
    delay: number;
    hyperlink?: string;
    hyperlinkText?: string;
    endText?: string;
    secondHyperlink?: string;
    secondHyperlinkText?: string;
}

function InterestItem({ icon, text, delay, hyperlink, hyperlinkText, endText, secondHyperlink, secondHyperlinkText }: WorkItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex items-center gap-3"
        >
            <div className="text-lychee-600 dark:text-lychee-400">
                {icon}
            </div>
            <Text variant="muted" size="sm">
                {text}
                {hyperlink && hyperlinkText && (
                    <Link href={hyperlink} className="text-lychee-600 hover:underline dark:text-lychee-400">
                        {hyperlinkText}
                    </Link>
                )}
                {endText && (
                    <span>{endText}</span>
                )}
                {secondHyperlink && secondHyperlinkText && (
                    <Link href={secondHyperlink} className="text-lychee-600 hover:underline dark:text-lychee-400">
                        {secondHyperlinkText}
                    </Link>
                )}
            </Text>
        </motion.div>
    )
}

export function Interests() {
    const items = [
        {
            icon: <Brain className="w-4 h-4" />,
            text: "data engineering"
        },
        {
            icon: <Music className="w-4 h-4" />,
            text: "carnatic music: ",
            hyperlink: "https://en.wikipedia.org/wiki/Mridangam",
            hyperlinkText: "my instrument",
            endText: ", ",
            secondHyperlink: "https://en.wikipedia.org/wiki/K._P._Parameswaran",
            secondHyperlinkText: "my teacher"
        },
        {
            icon: <Code className="w-4 h-4" />,
            text: "programming language theory"
        },
        {
            icon: <Rotate3D className="w-4 h-4" />,
            text: "probability",
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
        >
            <StackVertical gap="none">
                <TextHeading as="h3" weight="semibold">interests</TextHeading>
                <StackVertical gap="md">
                    {items.map((item, index) => (
                        <InterestItem 
                            key={index}
                            icon={item.icon}
                            text={item.text}
                            delay={1.2 + index * 0.1}
                            hyperlink={item.hyperlink}
                            hyperlinkText={item.hyperlinkText}
                            endText={item.endText}
                            secondHyperlink={item.secondHyperlink}
                            secondHyperlinkText={item.secondHyperlinkText}
                        />
                    ))}
                </StackVertical>
            </StackVertical>
        </motion.div>
    )
} 