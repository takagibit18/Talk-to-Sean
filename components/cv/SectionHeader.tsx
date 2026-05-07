interface SectionHeaderProps {
  number: string;
  label: string;
}

export default function SectionHeader({ number, label }: SectionHeaderProps) {
  return (
    <header className="cv-section-number">
      <span className="num">{number}.</span>
      <span className="label">{label}</span>
    </header>
  );
}
