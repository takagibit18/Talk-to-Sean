interface SectionHeaderProps {
  number: string;
  label: string;
}

export default function SectionHeader({ number, label }: SectionHeaderProps) {
  return (
    <header className="cv-section-number">
      <span className="num">{number}.</span>
      <h2 className="label">{label}</h2>
    </header>
  );
}
