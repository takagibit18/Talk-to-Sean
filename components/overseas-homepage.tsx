import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  GitBranch,
  GraduationCap,
  Mail,
  MessageCircle
} from "lucide-react";
import { ChatShell } from "@/components/chat-shell";
import { profileContent } from "@/lib/profile-content";

export function OverseasHomepage() {
  const c = profileContent;

  return (
    <main className="site-shell">
      <section className="hero-section" aria-label="Sean Yu overseas homepage">
        <div className="hero-copy">
          <div className="badge-row">
            <span className="badge">Class of '27 / CS @ MUC</span>
            <span className="badge badge-accent">{c.hero.intent}</span>
          </div>

          <div className="hero-name-block">
            <h1 aria-label={c.hero.name}>{c.hero.name}</h1>
            <span>{c.hero.nameLatin}</span>
            <p>{c.hero.intro}</p>
          </div>

          <div className="hero-actions">
            <a href="#projects" className="button button-primary">
              Explore Projects
              <ArrowDown size={15} />
            </a>
            <Link href="/chat" className="button button-cool">
              <MessageCircle size={16} />
              Full Chat
              <ArrowUpRight size={14} />
            </Link>
            <a href={c.contact.cvHref} className="button button-ghost">
              Download CV
            </a>
          </div>

          <blockquote>{c.hero.quote}</blockquote>
        </div>

        <aside className="hero-card" aria-label="Sean profile and embedded chat">
          <div className="profile-strip">
            <div className="avatar-shell">
              <Image
                src="/avatar-warm-portrait.png"
                alt="Sean Yu portrait"
                width={116}
                height={116}
                priority
              />
            </div>
            <div>
              <span>{c.hero.availability}</span>
              <strong>{c.hero.labTitle}</strong>
              <p>{c.hero.labSubtitle}</p>
            </div>
          </div>

          <div className="proof-grid">
            {c.hero.proofPoints.map((point) => (
              <div key={point.label} className="proof-item">
                <span>{point.label}</span>
                <strong>{point.value}</strong>
                <p>{point.detail}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="embedded-chat-card">
          <ChatShell mode="embedded" />
        </div>
      </section>

      <section id="about" className="content-section section-grid">
        <SectionKicker number="01" label={c.about.label} />
        <p className="section-lead">{c.about.body}</p>
      </section>

      <section className="content-section section-grid">
        <SectionKicker number="02" label="skills" />
        <div className="skill-list">
          {c.skills.map((group) => (
            <div key={group.group} className="skill-group">
              <h2>{group.group}</h2>
              <div>
                {group.items.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="content-section">
        <SectionKicker number="03" label="projects" />
        <div className="project-grid">
          {c.projects.map((project) => (
            <a
              href={project.href}
              key={project.title}
              target="_blank"
              rel="noreferrer"
              className="project-card"
            >
              <div className="project-meta">
                <span>{project.language}</span>
                <ArrowUpRight size={20} />
              </div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <dl>
                <div>
                  <dt>Problem</dt>
                  <dd>{project.problem}</dd>
                </div>
                <div>
                  <dt>Architecture</dt>
                  <dd>{project.architecture}</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>{project.evidence}</dd>
                </div>
              </dl>
              <div className="stack-row">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="content-section section-grid">
        <SectionKicker number="04" label={c.education.label} />
        <div className="cv-row-content">
          <span>{c.education.period}</span>
          <h2>
            <GraduationCap size={22} />
            {c.education.title}
          </h2>
          <strong>{c.education.school}</strong>
          <p>{c.education.description}</p>
          <div className="language-row">
            {c.languages.map((language) => (
              <span key={language.name}>
                {language.name}: {language.level}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="content-section contact-section">
        <SectionKicker number="05" label="contact" />
        <div className="contact-grid">
          <a href={`mailto:${c.contact.email}`} className="contact-link">
            <Mail size={22} />
            <span>Email</span>
            <strong>{c.contact.email}</strong>
          </a>
          <a href={c.contact.github} target="_blank" rel="noreferrer" className="contact-link">
            <GitBranch size={22} />
            <span>GitHub</span>
            <strong>{c.contact.githubLabel}</strong>
          </a>
          <div className="contact-link">
            <Bot size={22} />
            <span>WeChat</span>
            <strong>{c.contact.wechat}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionKicker({ number, label }: { number: string; label: string }) {
  return (
    <div className="section-kicker">
      <span>{number}</span>
      <strong>{label}</strong>
    </div>
  );
}
