'use client'

import { motion } from 'framer-motion'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import Link from 'next/link'

export function HomepageSocials() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
        >
            <div>
                <TextHeading as="h3" weight="semibold">let's talk!</TextHeading>
                <Text>
                    Feel free to email me at{' '}
                    <Link 
                        href="mailto:venkat@datafruit.dev" 
                        className="text-lychee-600 hover:underline dark:text-lychee-400"
                    >
                        venkat[at]datafruit[dot]dev
                    </Link>
                </Text>
            </div>
        </motion.div>
    )
}