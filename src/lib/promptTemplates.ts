import type { PromptInput } from '../api/prompts'

export type PromptTemplate = PromptInput & {
  id: string
  label: string
  description: string
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'coding-review',
    label: 'Code review',
    description: 'Find risks, regressions, and missing tests.',
    title: 'Code review checklist',
    aiTarget: 'ChatGPT',
    category: 'Coding',
    content:
      'Review the following code for correctness, regressions, security risks, performance issues, accessibility gaps, and missing tests. Prioritize concrete findings with file and line references.\n\n#coding #review',
  },
  {
    id: 'research-brief',
    label: 'Research brief',
    description: 'Turn a topic into structured research notes.',
    title: 'Research brief generator',
    aiTarget: 'ChatGPT',
    category: 'Research',
    content:
      'Create a concise research brief about [topic]. Include background, key facts, competing viewpoints, open questions, and recommended next steps. Cite sources when possible.\n\n#research',
  },
  {
    id: 'writing-editor',
    label: 'Writing editor',
    description: 'Improve clarity without changing intent.',
    title: 'Clarity editing prompt',
    aiTarget: 'Claude',
    category: 'Writing',
    content:
      'Edit the text below for clarity, structure, tone, and flow. Preserve the original meaning and avoid making it sound generic. Return the improved version and a short list of meaningful changes.\n\n#writing #editing',
  },
  {
    id: 'image-direction',
    label: 'Image direction',
    description: 'Create detailed image generation guidance.',
    title: 'Image generation art direction',
    aiTarget: 'ChatGPT',
    category: 'Image',
    content:
      'Generate a detailed image prompt for [subject]. Include composition, lighting, camera perspective, materials, color palette, mood, and negative constraints.\n\n#image #creative',
  },
  {
    id: 'marketing-campaign',
    label: 'Campaign plan',
    description: 'Draft positioning and campaign assets.',
    title: 'Marketing campaign planner',
    aiTarget: 'ChatGPT',
    category: 'Marketing',
    content:
      'Build a marketing campaign plan for [product]. Include audience, positioning, core message, channels, launch sequence, sample copy, and success metrics.\n\n#marketing',
  },
  {
    id: 'automation-workflow',
    label: 'Automation flow',
    description: 'Design a repeatable workflow.',
    title: 'Automation workflow designer',
    aiTarget: 'ChatGPT',
    category: 'Automation',
    content:
      'Design an automation workflow for [process]. Include trigger, required inputs, steps, decision branches, failure handling, and final outputs.\n\n#automation',
  },
]
