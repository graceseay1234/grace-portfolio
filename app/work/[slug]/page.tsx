import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject } from '../../../lib/projects'

const P = {
  ink: '#1A1A1A',
  bg:  '#FAFAF8',
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  return (
    <div style={{ background: P.bg, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: P.ink }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #EFEFED' }}>
        <Link href="/" style={{ fontFamily: 'puffin-arcade-regular, sans-serif', fontSize: 30, fontWeight: 600, lineHeight: 1, textDecoration: 'none', color: P.ink }}>
          grace
        </Link>
        <a href="mailto:seay.ad@northeastern.edu" style={{ background: P.ink, color: 'white', padding: '9px 20px', borderRadius: 999, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
          seay.ad@northeastern.edu
        </a>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 48px 100px' }}>

        {/* Back */}
        <Link href="/" style={{ fontSize: 13, color: '#AAA', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← All work
        </Link>

        {/* Image / preview area */}
        <div style={{
          height: 320,
          borderRadius: 16,
          background: project.gradient,
          marginBottom: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <span style={{
            fontSize: 120,
            fontWeight: 700,
            color: project.textLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
            fontFamily: 'puffin-arcade-regular, sans-serif',
            userSelect: 'none',
            letterSpacing: '-4px',
          }}>
            {project.title.charAt(0)}
          </span>
          <div style={{ position: 'absolute', bottom: 14, right: 16, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: project.textLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)' }}>
            preview placeholder
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, color: '#BBB', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Role</p>
            <p style={{ fontSize: 14, margin: 0 }}>{project.role}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#BBB', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Year</p>
            <p style={{ fontSize: 14, margin: 0 }}>{project.year}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#BBB', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Track</p>
            <p style={{ fontSize: 14, margin: 0, textTransform: 'capitalize' }}>{project.track}</p>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 40 }}>
          {project.tags.map(t => (
            <span key={t} style={{ fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, border: '1px solid #E0E0DC', color: '#666' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Title + description */}
        <h1 style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.2, margin: '0 0 24px' }}>{project.title}</h1>
        <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8, margin: '0 0 40px' }}>{project.fullDesc}</p>

        {/* Highlights */}
        <div>
          <h2 style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#CCC', marginBottom: 20 }}>Highlights</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {project.highlights.map((h, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#CCC', marginTop: 2, flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 15, color: '#444', lineHeight: 1.65 }}>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* External link */}
        {project.link && (
          <div style={{ marginTop: 48 }}>
            <a href={project.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: P.ink, fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid #DDD', paddingBottom: 2 }}>
              View project ↗
            </a>
          </div>
        )}

        {/* Back footer */}
        <div style={{ marginTop: 72, paddingTop: 32, borderTop: '1px solid #F0F0EE' }}>
          <Link href="/" style={{ fontSize: 13, color: '#AAA', textDecoration: 'none' }}>
            ← Back to all work
          </Link>
        </div>

      </div>
    </div>
  )
}
