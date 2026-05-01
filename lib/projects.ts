export type Project = {
  slug: string
  title: string
  track: 'freelance' | 'engineering' | 'research' | 'branding'
  tags: string[]
  shortDesc: string
  creativeDesc?: string   // UX/design angle shown in creative mode
  gradient: string
  textLight?: boolean
  span: 1 | 2
  role: string
  creativeRole?: string   // role label shown in creative mode
  year: string
  fullDesc: string
  highlights: string[]
  link?: string
  mockup?: string
  preview?: string        // slug for custom interactive preview component
  slides?: string[]       // ordered slide images for research cards
  stat?: string           // headline figure for research cards (fallback when no slides)
  statLabel?: string
}

export const projects: Project[] = [
  // ── Freelance ───────────────────────────────────────────────────────────────
  {
    slug: 'intension',
    title: 'Intension Band Website',
    track: 'freelance',
    tags: ['Next.js', 'Sanity CMS', 'Stripe', 'Animations'],
    shortDesc: 'Full band website with merch store, EPK, and scroll animations.',
    gradient: 'linear-gradient(135deg, #F2F2F2 0%, #FFFFFF 100%)',
    mockup: '/intension-laptop.png',
    span: 2,
    role: 'Designer & Developer',
    year: '2025',
    fullDesc:
      'A full-featured website for Intension, a local Atlanta band. Built to handle everything a working band needs online: EPK for booking, merch store with Stripe checkout, tour dates, and a content-managed CMS via Sanity. Scroll-triggered animations and a dark cinematic aesthetic match the band\'s energy.',
    preview: 'intension',
    highlights: [
      'Merch store with Stripe checkout and Shippo shipping label automation',
      'Scroll-triggered animations using Intersection Observer API',
      'EPK section for press and booking inquiries',
      'Sanity Studio so the band self-manages all content',
      'WebP image optimization — 14MB → 3.4MB (77% reduction)',
      'Mobile-first — most fans browse on phones',
    ],
  },
  {
    slug: 'ace-wellness',
    title: 'Ace Wellness',
    track: 'branding',
    tags: ['Figma', 'Logo Design', 'Brand Identity', 'Web Design'],
    shortDesc: 'Logo design and website mockups for a wellness brand — three distinct visual directions.',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #EFEFEF 100%)',
    span: 1,
    role: 'Designer',
    year: '2025',
    mockup: '/ace-wellness-1.png',
    slides: [
      '/ace-wellness-s1.png',
      '/ace-wellness-s2.png',
      '/ace-wellness-brand.png',
    ],
    fullDesc:
      'Designed the visual identity for Ace Wellness, a wellness and skincare brand. Developed three logo concepts — a minimal icon mark, a gold foil wordmark, and a combined logotype — then applied each across website mockups to demonstrate brand flexibility across digital touchpoints.',
    highlights: [
      'Three logo directions: icon mark, wordmark, and combined logotype',
      'Gold foil print mockups for premium brand feel',
      'Website mockups showing two distinct visual directions (light/warm and dark/gold)',
      'Designed in Figma from concept to final presentation',
    ],
  },
  {
    slug: 'placeholder-app',
    title: 'Mobile App Design',
    track: 'freelance',
    tags: ['Figma', 'UX', 'Prototyping'],
    shortDesc: 'Placeholder — mobile app UX case study coming soon.',
    gradient: 'linear-gradient(135deg, #A8D8EA 0%, #6FB3CF 100%)',
    span: 1,
    role: 'UX Designer',
    year: '2025',
    fullDesc: 'Placeholder.',
    highlights: [],
  },

  // ── Engineering (dual-mode: tech angle in professional, design in creative) ─
  {
    slug: 'harvard-choir',
    title: 'Harvard Medical School — CHOIR at MGH',
    track: 'engineering',
    tags: ['React', 'Supabase', 'Python', 'Django', 'Azure'],
    shortDesc: 'Two clinical research platforms, designed and built solo from scratch.',
    creativeDesc: 'Designed the full UX for two clinical platforms — research intake flows, data dashboards, and IRB-compliant UI patterns built for clinical staff.',
    gradient: 'linear-gradient(135deg, #BEBEBE 0%, #E8E8E8 100%)',
    mockup: '/harvard-mockup.png',
    span: 2,
    role: 'UX Designer & Full Stack Developer',
    creativeRole: 'UX Designer',
    year: '2025 – 2026',
    fullDesc:
      'As the sole technical team member at the Comprehensive Headache and Opioid Investigation Research (CHOIR) group at Massachusetts General Hospital, I owned the end-to-end design and development of two clinical research platforms. These tools are used by researchers and clinical staff to collect, manage, and analyze patient data for active studies.',
    highlights: [
      'Sole designer and developer — no eng team, worked directly with PIs and clinical staff',
      'Built two separate platforms from scratch: one for patient intake, one for research data management',
      'React frontend with Django/Python backend, deployed on Azure',
      'Supabase for real-time data and authentication',
      'Designed with IRB compliance and data privacy requirements in mind',
      'Worked under HIPAA constraints for patient data handling',
    ],
  },
  {
    slug: 'syncio',
    title: 'syncIO Labs',
    track: 'engineering',
    tags: ['TypeScript', 'AI/ML', 'Anthropic API', 'Node.js'],
    shortDesc: 'Building the AI intelligence layer of an early-stage fintech platform.',
    creativeDesc: 'Shaping how users experience AI-driven financial conversations — designing onboarding flows, conversation UI, and the product language of an early-stage fintech.',
    gradient: 'linear-gradient(135deg, #C8614A 0%, #9B3D28 100%)',
    textLight: true,
    span: 1,
    role: 'Software Engineer — Intelligence Layer',
    creativeRole: 'Product Designer',
    year: '2026 – Present',
    fullDesc:
      'At syncIO Labs I own the intelligence layer of an early-stage fintech platform. This includes the AI conversation engine, client onboarding flows, and the integrations that connect financial data to AI-driven insights. The stack is TypeScript throughout, with the Anthropic API powering the core AI features.',
    highlights: [
      'Sole owner of the intelligence layer in a lean eng team',
      'Built the client onboarding and discovery protocol from spec',
      'Anthropic API (Claude) for conversational AI features',
      'TypeScript monorepo with Turborepo and pnpm workspaces',
      'Connector architecture for integrating external financial data sources',
    ],
  },
  {
    slug: 'pawtucket',
    title: 'City of Pawtucket',
    track: 'engineering',
    tags: ['WordPress', 'Elementor', 'CSS', 'HTML', 'UX'],
    shortDesc: 'Redesigned the city\'s public website from Adobe XD concepts to a live civic platform.',
    creativeDesc: 'Led the full redesign of a city\'s public-facing website — from Adobe XD wireframes to a live site, collaborating directly with the Mayor and city departments.',
    gradient: 'linear-gradient(135deg, #B8C4D4 0%, #7A98B8 100%)',
    span: 1,
    role: 'Frontend Development Intern',
    creativeRole: 'UX Designer',
    year: '2023',
    mockup: '/pawtucket-mockup.png',
    fullDesc:
      'Independently redesigned the City of Pawtucket\'s public website, transforming Adobe XD concepts into a live WordPress site using Elementor, CSS, and HTML. Worked directly with the Mayor and city departments to refine content and ensure the site met civic objectives and improved accessibility. Optimized navigation using data-driven insights, introducing intuitive hot buttons based on user behavior analysis.',
    highlights: [
      'Solo redesign from Adobe XD mockups to live WordPress site',
      'Collaborated directly with the Mayor and city departments',
      'Improved accessibility and civic usability',
      'Introduced hot-button navigation based on user behavior data',
    ],
  },

  // ── Presentations ────────────────────────────────────────────────────────────
  {
    slug: 'aurenza',
    title: 'Aurenza Pharmaceuticals',
    track: 'research',
    tags: ['Figma', 'Pitch Deck', 'Presentation Design', 'Brand'],
    shortDesc: 'Investor pitch deck for a compliance-first pharmaceutical manufacturing startup seeking $5M.',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #EFEFEF 100%)',
    span: 1,
    role: 'Designer',
    year: '2025',
    mockup: '/aurenza-mockup.png',
    fullDesc:
      'Designed a full investor pitch deck for Aurenza Pharmaceuticals, a startup building a compliance-first platform for high-demand therapeutics and nutraceuticals. The deck covers mission and vision, market opportunity, team, manufacturing approach, financial projections, and a $5M funding ask.',
    highlights: [
      'Full pitch deck from brief to final design in Figma',
      'Purple-forward brand identity aligned to Aurenza\'s visual system',
      'Slides covering team, market, financials, manufacturing approach, and funding',
      '$5M seed raise target with projected milestones',
    ],
  },
  {
    slug: 'nlp-scam-detection',
    title: 'NLP Scam Detection',
    track: 'research',
    tags: ['Python', 'NLP', 'BERT', 'TensorFlow', 'FastAPI', 'Next.js'],
    shortDesc: 'Cross-domain scam detection across four ML models — live interactive demo.',
    gradient: 'linear-gradient(135deg, #0D0D0D 0%, #1C1C1C 100%)',
    textLight: true,
    mockup: '/nlp-front.png',
    span: 1,
    role: 'ML Engineer',
    year: '2025',
    link: 'https://frontend-nu-lyart-80.vercel.app',
    fullDesc:
      'A cross-domain NLP research platform comparing four scam detection models — Logistic Regression, SVM, Feed-Forward Neural Network, and fine-tuned BERT — trained on email and call transcript datasets. Built and deployed as a live interactive tool where you can paste any message and get real-time predictions from all models simultaneously, with per-model confidence scores and feature attribution.',
    highlights: [
      'BERT fine-tuned on bert-base-uncased achieves 99.75% F1 — highest accuracy in the study',
      'SVM with TF-IDF reaches 99.3% F1; FFNN 97.2% F1; Logistic Regression 93% F1',
      'Ensemble verdict aggregates all live models with vote count and confidence',
      'LR and SVM expose top TF-IDF token weights driving each prediction',
      'FastAPI backend deployed on Render; Next.js frontend on Vercel',
      'Cross-domain generalization tested across email spam and phone transcript datasets',
    ],
  },
  {
    slug: 'huskyflow',
    title: 'HuskyFlow',
    track: 'research',
    tags: ['React', 'Express', 'MongoDB', 'Socket.io', 'TF-IDF'],
    shortDesc: 'Full-stack Q&A platform with content recommendations and real-time moderation.',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #EFEFEF 100%)',
    span: 1,
    role: 'Full Stack Developer',
    year: 'Sep – Dec 2025',
    mockup: '/huskyflow-mockup.png',
    fullDesc:
      'HuskyFlow is a full-stack Q&A platform built for CS4530. It features a React frontend and Express/MongoDB backend, a content recommendation system using TF-IDF vectorization, in-browser code execution via the Judge0 API, an automated moderation queue with Socket.io real-time updates, and an admin analytics dashboard.',
    highlights: [
      'TF-IDF content recommendation system for surfacing relevant questions',
      'In-browser code execution via Judge0 API',
      'Automated moderation queue with Socket.io real-time updates',
      'Admin analytics dashboard for moderator oversight',
      'React frontend with Express/MongoDB backend',
    ],
  },
  {
    slug: 'cff',
    title: 'Critical Flicker Fusion & Light Adaptation',
    track: 'research',
    tags: ['Neuroscience', 'Research', 'Psychophysics', 'Data Analysis'],
    shortDesc: 'Controlled experiment on environmental illumination and flicker perception.',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #EFEFEF 100%)',
    span: 1,
    role: 'Researcher',
    year: 'Jan – Apr 2024',
    mockup: '/cff-mockup.png',
    fullDesc:
      'Conducted a controlled experiment to analyze the relationship between environmental illumination and critical flicker fusion frequency (CFF) — the threshold at which a flickering light appears continuous. The study revealed a logarithmic increase in CFF with higher light levels and identified perceptual and physiological factors that influence individual CFF thresholds.',
    highlights: [
      'Designed and executed a controlled psychophysics experiment',
      'Revealed a logarithmic increase in CFF with higher environmental illumination',
      'Identified contributing factors to individual variation in CFF perception',
      'Analyzed results using statistical methods and data visualization',
    ],
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug)
}
