import { useState } from 'react'

const SKILL_DEFINITIONS = {
  "data visualization": "Presenting data visually using charts, graphs, and dashboards to communicate insights clearly.",
  "power bi": "Microsoft's business intelligence tool for building interactive reports and dashboards.",
  "python": "A programming language widely used for data analysis, automation, and machine learning.",
  "facilitation": "Guiding group discussions or workshops to reach productive outcomes.",
  "campaign planning": "Designing end-to-end marketing campaigns including strategy, execution, and measurement.",
  "people analytics": "Using data and analysis to understand workforce trends and inform HR decisions.",
  "credit risk": "Assessing the likelihood that a borrower will default on a financial obligation.",
  "stakeholder management": "Building and maintaining relationships with key decision-makers and influencers.",
  "ux research": "Studying how users interact with products to improve design and experience.",
  "financial modeling": "Building spreadsheet-based models to project financial outcomes and support decisions.",
  "lean process": "A methodology for eliminating waste and improving efficiency in workflows.",
  "brand strategy": "Defining how a company presents itself and its products to the market.",
  "internal comms": "Managing communication within an organization to keep employees informed and engaged.",
  "data science": "Using statistical methods and programming to extract insights from large datasets.",
  "mentoring": "Supporting someone's professional growth through guidance, feedback, and shared experience.",
  "excel": "Microsoft's spreadsheet tool used for data analysis, reporting, and financial modeling.",
  "statistical modeling": "Building mathematical models to describe and predict real-world phenomena.",
  "consumer insights": "Research-based understanding of customer needs, behaviors, and motivations.",
  "copywriting": "Writing persuasive content for marketing, communications, or internal purposes.",
  "project management": "Planning, executing, and closing projects to meet goals within scope, time, and budget.",
  "operations": "Managing day-to-day business processes to keep an organization running efficiently.",
  "business partnering": "Working closely with business units to align finance or HR support with their goals.",
  "storytelling": "Communicating ideas through narrative to make information engaging and memorable.",
  "event planning": "Organizing and coordinating events from logistics to execution.",
  "public speaking": "Delivering presentations or speeches confidently to an audience.",
  "budgeting": "Planning and managing financial resources to meet organizational goals.",
  "hris": "Human Resource Information Systems — software for managing employee data and HR processes.",
  "customer experience": "The overall impression a customer has from all interactions with a company.",
  "journey mapping": "Visualizing the steps a customer takes when interacting with a product or service.",
  "documentation": "Creating written records of processes, decisions, or systems for reference and training.",
  "teaching": "Transferring knowledge or skills to others through instruction and demonstration.",
  "content creation": "Producing written, visual, or multimedia content for internal or external audiences.",
  "emcee": "Hosting and presenting at events, keeping the program flowing and the audience engaged.",
  "stakeholder reporting": "Communicating project or business updates to key stakeholders in a clear format.",
  "strategic planning": "Defining long-term goals and the actions needed to achieve them.",
  "data analysis": "Examining data sets to draw conclusions and support decision-making.",
}

export default function SkillChip({ skill, variant = 'default' }) {
  const [open, setOpen] = useState(false)
  const def = SKILL_DEFINITIONS[skill.toLowerCase()] || 'A specialized skill relevant to this opportunity.'
  const bg = variant === 'gap' ? '#FFF0F0' : '#F0F0FF'
  const color = variant === 'gap' ? '#C00000' : '#3730A3'

  return (
    <span className="relative inline-block">
      <span
        className="text-xs px-2 py-0.5 rounded-full cursor-help border border-dashed"
        style={{ backgroundColor: bg, color, borderColor: color }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
      >
        {skill}
      </span>
      {open && (
        <span className="absolute z-50 bottom-full left-0 mb-1 w-56 bg-brand-navy text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed">
          {def}
        </span>
      )}
    </span>
  )
}
