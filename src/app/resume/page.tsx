import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"

export default function ResumePage() {
  return (
    <SidebarLayout>
      <h1 className="text-lg font-medium mb-2">Resume</h1>
      <div className="space-y-6 text-[15px]">
        {/* Education */}
        <section>
          <h2 className="text-base font-semibold mb-2 border-b border-border pb-1">Education</h2>
          <div>
            <div className="flex justify-between">
              <p className="font-medium">University of California, Berkeley</p>
              <p className="text-muted-foreground">Berkeley, CA</p>
            </div>
            <div className="flex justify-between">
              <p>B.A. in <em>Statistics & Computer Science</em></p>
              <p className="text-muted-foreground text-sm">May 2027</p>
            </div>
            <ul className="list-disc pl-5 mt-2 text-muted-foreground">
              <li>Relevant Coursework: CS169: Software Engineering, CS188: Artificial Intelligence, CS61B: Data Structures, DATA 100: Techniques of Data Science, STAT134: Probability, CS70: Discrete Math & Probability Theory, MATH 54: Linear Algebra & Differential Equations</li>
            </ul>
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-base font-semibold mb-2 border-b border-border pb-1">Experience</h2>
          <ul className="space-y-5">
            <li>
              <div className="flex justify-between">
                <p className="font-medium">Cofounder & CEO</p>
                <p className="text-muted-foreground text-sm">May 2024 – Present</p>
              </div>
              <p>Datafruit (YC S25)</p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
                <li>Built production AI agents for DevOps workflows (incident response, infra provisioning) grounded in logs, runbooks, and infra state.</li>
                <li>Designed ingestion pipelines for runbooks/tickets/telemetry along with evals and guardrails to improve correctness and reduce hallucinated changes.</li>
                <li>Developed customer-facing product surfaces (CLI / API / web) and integrated with common infrastructure tools (Terraform/Kubernetes/logging) to deploy into real environments.</li>
                <li>Backed by Y Combinator and top SV firms, 120k ARR</li>
              </ul>
            </li>
            <li>
              <div className="flex justify-between">
                <p className="font-medium">Software Engineering Intern</p>
                <p className="text-muted-foreground text-sm">Jan 2023 – May 2023</p>
              </div>
              <p>CareHealth.ai</p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
                <li>Developed multiple RESTful APIs, resulting in a ≈30% improvement in patient data collection and storage efficiency.</li>
                <li>Worked on implementation of a HIPAA-compliant data pipeline using Apache Spark.</li>
                <li>Implemented database schema designs and optimized SQL queries to improve data retrieval and processing.</li>
              </ul>
            </li>
            <li>
              <div className="flex justify-between">
                <p className="font-medium">Data Science Intern</p>
                <p className="text-muted-foreground text-sm">May 2022 – Aug 2022</p>
              </div>
              <p>Carpl.ai</p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
                <li>Deployed AI-driven workflows across 50+ hospitals, reducing wait times greatly.</li>
                <li>Built data processing systems using Python to analyze datasets of 100,000+ medical images, implementing efficient database operations for storing and retrieving large-scale data.</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-base font-semibold mb-2 border-b border-border pb-1">Projects</h2>
          <ul className="space-y-5">
            <li>
              <p><span className="font-medium">Lychee</span> | <em>Typescript, Rust</em></p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
                <li>Built a multi-agent AI coding system that lets users orchestrate multiple Claude Code instances using isolated Git worktrees to plan, modify, and validate code changes in parallel.</li>
                <li>Shipped an agent that explains AI-generated code diffs to users, improving review speed and confidence in automated changes.</li>
                <li>Designed and built the UI/UX for multi-agent code workflows, making complex parallel edits, diff explanations, and validation steps easy for users to review and approve.</li>
              </ul>
            </li>
            <li>
              <p><span className="font-medium">Achilles</span> | <em>Python, C++</em></p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
                <li>Created a Python optimization tool that uses profiling and LLM's to identify and prioritize the slowest code segments, and generate high-performance C++ patches.</li>
                <li>Awarded finalist status at the PearVC x Anthropic Hackathon.</li>
                <li>Agents use multiple optimization strategies, benchmark performance, and select the most effective optimizations.</li>
                <li>Optimized LLM suggestions using JSON-schema-defined constraints and integrated unit tests, reducing erroneous code recommendations and improving reliability.</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-base font-semibold mb-2 border-b border-border pb-1">Technical Skills</h2>
          <div className="space-y-1 text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Languages: </span>
              Java, Python, Ruby, Rails, SQL, Swift, Go, JavaScript, HTML, CSS
            </p>
            <p>
              <span className="text-foreground font-medium">Frameworks & Libraries: </span>
              React, Flask, NumPy, Scikit-Learn, Pandas, PyTorch, Seaborn, Matplotlib, REST
            </p>
            <p>
              <span className="text-foreground font-medium">Tools: </span>
              git, Spark, Terraform, Docker, Kubernetes, NoSQL, bash, unix
            </p>
          </div>
        </section>
      </div>
    </SidebarLayout>
  )
}
