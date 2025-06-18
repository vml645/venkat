"use client"

import { monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import BaseContainer from '@/components/layout/container/base-container'
import { Navbar } from '@/components/ui/navbar/Navbar'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'


export default function ResumePage() {
  return (
    <>
      <BaseContainer size="md" paddingX="md" paddingY="lg">
        <div className="flex justify-between items-center mb-8">
          <Navbar />
          <ThemeToggle />
        </div>
        <section className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-10">
        <TextHeading as="h1" className="text-3xl sm:text-4xl font-extrabold mb-2">
          Venkat Lakshman
        </TextHeading>
        <Text className="text-lychee-600 dark:text-lychee-300 font-medium">
          Data engineer with a background in statistics &amp; CS
        </Text>
        <div className={cn('mt-4 flex flex-col gap-1', monoFont.className)}>
          <a href="mailto:venkat@example.com" className="hover:text-lychee-600">venkat@example.com</a>
          <a href="https://datafruit.dev" target="_blank" rel="noopener noreferrer" className="hover:text-lychee-600">datafruit.dev</a>
          <a href="https://github.com/venkat" target="_blank" rel="noopener noreferrer" className="hover:text-lychee-600">github.com/venkat</a>
        </div>
      </header>

      <StackVertical gap="lg">
        {/* Education */}
        <section>
          <TextHeading as="h2" className="text-lychee-600 font-semibold mb-2">Education</TextHeading>
          <ul className="space-y-4">
            <li>
              <Text className="font-semibold">B.A. in Computer Science, University of California, Berkeley</Text>
              <Text className="text-muted-foreground">Aug 2020 – May 2024 (on leave)</Text>
            </li>
          </ul>
        </section>

        {/* Experience */}
        <section>
          <TextHeading as="h2" className="text-lychee-600 font-semibold mb-2">Experience</TextHeading>
          <ul className="space-y-6">
            <li>
              <Text className="font-semibold">Co-Founder, Datafruit – San Francisco, CA</Text>
              <Text className="text-muted-foreground">Jan 2021 – Present</Text>
              <ul className="list-disc pl-5 space-y-1">
                <li><Text>Building declarative data infrastructure to make data pipelines more reliable and accessible, backed by Y&nbsp;Combinator.</Text></li>
                <li><Text>Led development of core platform architecture and data orchestration systems serving 100+ TB of processed data.</Text></li>
                <li><Text>Established engineering best practices and built a high-performing remote engineering team.</Text></li>
              </ul>
            </li>
            <li>
              <Text className="font-semibold">Software Engineering Intern, CareHealth.ai – Remote</Text>
              <Text className="text-muted-foreground">Jan 2023 – May 2023</Text>
              <ul className="list-disc pl-5 space-y-1">
                <li><Text>Developed multiple RESTful APIs, improving patient data collection and storage efficiency by ≈30% within CareHealth’s API server.</Text></li>
                <li><Text>Implemented a HIPAA-compliant data pipeline with Apache Spark to process 100 000+ patient records daily.</Text></li>
                <li><Text>Designed database schema and optimized SQL queries for faster data retrieval and processing.</Text></li>
              </ul>
            </li>
            <li>
              <Text className="font-semibold">Data Science Intern, Carpl.ai – Remote</Text>
              <Text className="text-muted-foreground">May 2022 – Aug 2022</Text>
              <ul className="list-disc pl-5 space-y-1">
                <li><Text>Deployed AI-driven workflows across 50+ hospitals, significantly reducing patient wait times.</Text></li>
                <li><Text>Built Python data-processing systems to analyze 100 000+ medical images, implementing efficient large-scale storage and retrieval.</Text></li>
                <li><Text>Utilized proprietary AI testing & monitoring platform to perform deep clinical and statistical analysis.</Text></li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Skills */}
        <section>
          <TextHeading as="h2" className="text-lychee-600 font-semibold mb-2">Technical Skills</TextHeading>
          <div className="space-y-2">
            <Text>
              <span className="font-semibold">Languages: </span>
              Java, Python, Ruby, Rails, SQL, Swift, C++, JavaScript, HTML, CSS
            </Text>
            <Text>
              <span className="font-semibold">Frameworks & Libraries: </span>
              React, Node, Flask, NumPy, Scikit-Learn, Pandas, PyTorch, Matplotlib, REST
            </Text>
            <Text>
              <span className="font-semibold">Tools: </span>
              git, Spark, Terraform, Docker, AWS (Lambda, DynamoDB, S3), NoSQL, bash, unix
            </Text>
          </div>
        </section>
      </StackVertical>
        </section>
      </BaseContainer>
    </>
  )
}
