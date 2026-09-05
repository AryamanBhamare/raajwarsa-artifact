import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', className = '' }) {
  return (
    <Reveal className={`section-head section-head--${align} ${className}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <span className="formal-line" aria-hidden="true" />
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </Reveal>
  );
}