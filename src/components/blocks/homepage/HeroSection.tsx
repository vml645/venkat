'use client'

import { motion } from 'framer-motion'
import { monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Ruler from '@/components/ui/ruler/ruler'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from "next-themes"

export function HeroSection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
        >
            <div className="relative">
                <StackVertical gap="xs">
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                        }}
                        transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={cn("text-2xl sm:text-3xl md:text-4xl", monoFont.className)}
                    >
                        🍎🐘
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <TextHeading as="h2" className="font-semibold text-xl sm:text-1xl md:text-2xl lg:text-3xl">
                            venkat lakshman
                        </TextHeading>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Text >
                            Hi, I'm Venkat. co-founder at<span className="inline-flex items-baseline">
                                <Image 
                                    src="/dflogo.svg" 
                                    alt="df" 
                                    width={30} 
                                    height={30}
                                    className="inline-block translate-y-[9px]"

                                />
                                <Link href="https://datafruit.dev" target="_blank" rel="noopener noreferrer" className="text-lychee-600 dark:text-lychee-300 hover:underline -ml-1">
                                    datafruit
                                </Link>
                            </span>
                        </Text>

                        <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text>
                                I was doing my undergrad at <span className="inline-flex items-baseline">
                                    <Image
                                        src="/callight.svg"
                                        alt="Cal"
                                        width={90}
                                        height={20}
                                        className="inline-block translate-y-[8px] dark:hidden"
                                    />
                                    <Image
                                        src="/cal.svg"
                                        alt="Cal"
                                        width={90}
                                        height={20}
                                        className="hidden translate-y-[8px] dark:inline-block"
                                    />
                                </span>, where I was majoring in Statistics and Computer Science.
                                At Cal I spent a lot of time at the carnatic music club Laya and various restaurants on campus!
                                In my second year I started working on a startup and left school to pursue it full time. <br/><br/>
                            </Text>
                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                                <Text>
                                That startup is<span className="inline-flex items-baseline">
                                    <Image 
                                        src="/dflogo.svg" 
                                        alt="df" 
                                        width={30} 
                                        height={30}
                                        className="inline-block translate-y-[9px]"
                                    />
                                    <Link href="https://datafruit.dev" target="_blank" rel="noopener noreferrer" className="text-lychee-600 dark:text-lychee-300 hover:underline -ml-1">
                                        datafruit
                                    </Link>
                                </span>, which is redefining data engineering to be declarative, idiomatic,
                                and accessible to ai agents. We are backed by <span className="inline-flex items-baseline">
                                    <Image
                                        src="/ycombinator-tile.svg"
                                        alt="Y Combinator"
                                        width={16}
                                        height={16}
                                        className="inline-block mr-1 translate-y-[2px]"
                                    />
                                    <span> Combinator</span>
                                </span> and currently in the S25 batch.
                                </Text>

                        </motion.div>
                    </motion.div>
                </StackVertical>
            </div>
        </motion.div>
    )
} 
