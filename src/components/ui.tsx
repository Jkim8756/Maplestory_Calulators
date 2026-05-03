import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

type Tone = 'violet' | 'gold' | 'teal' | 'red' | 'muted'

const toneClasses: Record<Tone, string> = {
  violet: 'border-maple-accent/40 bg-maple-accent/15 text-violet-200',
  gold: 'border-maple-gold/40 bg-maple-gold/15 text-amber-200',
  teal: 'border-maple-teal/40 bg-maple-teal/15 text-teal-100',
  red: 'border-maple-red/40 bg-maple-red/15 text-red-200',
  muted: 'border-maple-border bg-white/5 text-maple-muted',
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const classes = {
    primary: 'border-maple-accent/60 bg-maple-accent text-white hover:bg-violet-500',
    secondary: 'border-maple-border bg-white/6 text-maple-text hover:border-maple-accent/60 hover:bg-white/10',
    ghost: 'border-transparent bg-transparent text-maple-muted hover:bg-white/8 hover:text-maple-text',
    danger: 'border-maple-red/50 bg-maple-red/15 text-red-100 hover:bg-maple-red/25',
  }
  return (
    <button className={`btn ${classes[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge ${toneClasses[tone]}`}>{children}</span>
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  )
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${props.className ?? ''}`} type="number" {...props} />
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${props.className ?? ''}`} type="text" {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`input ${props.className ?? ''}`} {...props} />
}

export function Toggle({
  active,
  onChange,
  label,
  disabled,
}: {
  active: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      className={`toggle ${active ? 'toggle-active' : ''}`}
      disabled={disabled}
      type="button"
      onClick={() => onChange(!active)}
    >
      <span className="toggle-dot" />
      <span>{label}</span>
    </button>
  )
}

export function ProgressBar({ value, tone = 'violet' }: { value: number; tone?: Tone }) {
  const width = `${Math.min(100, Math.max(0, value))}%`
  const fill = {
    violet: 'from-maple-accent to-violet-300',
    gold: 'from-maple-gold to-yellow-200',
    teal: 'from-maple-teal to-cyan-200',
    red: 'from-maple-red to-orange-300',
    muted: 'from-maple-muted to-slate-300',
  }[tone]
  return (
    <div className="progress-track">
      <div className={`progress-fill bg-gradient-to-r ${fill}`} style={{ width }} />
    </div>
  )
}
