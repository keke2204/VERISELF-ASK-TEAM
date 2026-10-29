import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  Eye,
  FileCheck2,
  Fingerprint,
  Globe,
  Heart,
  LockKeyhole,
  Menu,
  Moon,
  Radar,
  Scale,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from "lucide-react";

function Brand({ inverse = false }) {
  return (
    <Link className={`landing-brand${inverse ? " landing-brand--inverse" : ""}`} to="/" aria-label="VeriSelf home">
      <span className="landing-brand__mark" aria-hidden="true">
        <ShieldCheck size={18} strokeWidth={1.65} />
        <span />
      </span>
      <span className="landing-brand__wordmark">veriself<span>.</span></span>
    </Link>
  );
}

const PRINCIPLES = [
  { number: "01", icon: LockKeyhole, title: "Permission comes first", text: "Review only the media and public sources you are authorized to handle. The tool should never outrun your judgment." },
  { number: "02", icon: ScanSearch, title: "Signals, not certainty", text: "Similarity, risk, and forensic outputs are clues to investigate—not proof, probabilities, or final verdicts." },
  { number: "03", icon: CircleCheck, title: "A clear next step", text: "Keep findings, evidence, alerts, and response drafts close so a careful decision does not get lost in the noise." },
];

const STEPS = [
  { number: "01", title: "Set your reference", text: "Enroll a portrait you have permission to use and create a private comparison baseline.", icon: Fingerprint },
  { number: "02", title: "Choose what to review", text: "Submit an image, video, candidate URL, or public page for an on-demand check.", icon: Eye },
  { number: "03", title: "Decide with context", text: "Read the signals, inspect the evidence, and choose the response that feels right to you.", icon: FileCheck2 },
];

const FAQS = [
  { question: "What is VeriSelf?", answer: "VeriSelf is a digital-identity-defense project for everyday people. Its toolkit brings identity references, public-page scans, media review, alerts, evidence records, response drafts, and experimental image protection into one calm workspace." },
  { question: "Does it continuously scan the whole internet?", answer: "No. The system performs operator-triggered scans for URLs that a user explicitly adds. It is not an invasive, continuous web monitoring service. Only submit sources you are authorized to review." },
  { question: "Are match or forensic scores proof?", answer: "No. The source project uses development-grade biometric and media heuristics. Results can be wrong, are not calibrated probabilities, and should only guide careful human review." },
  { question: "Does VeriSelf send legal notices for me?", answer: "No. It can prepare a response draft from a finding, but it does not send or file anything automatically. Review any draft carefully and consult qualified legal counsel for legal decisions." },
  { question: "Where does my media go?", answer: "The site sends requests only when you interact with a feature or test the backend API. File uploads and analysis run locally or through your configured server." },
];

const MODULES = [
  { number: "01", icon: Fingerprint, title: "Identity profile", text: "Enroll a reference portrait and compare a selected image against it.", href: "/identity" },
  { number: "02", icon: Globe, title: "Public-page scans", text: "Add a permitted public URL and start a scan when you choose.", href: "/monitoring" },
  { number: "03", icon: Radar, title: "Candidate matches", text: "Review a candidate image URL against an enrolled profile.", href: "/matches" },
  { number: "04", icon: ScanSearch, title: "Media forensics", text: "Inspect image and video indicators without treating a score as a verdict.", href: "/manipulation" },
  { number: "05", icon: Activity, title: "Risk findings", text: "See backend-reported findings and severity summaries in one place.", href: "/risk" },
  { number: "06", icon: Scale, title: "Evidence & drafts", text: "Keep source details, hashes, and response drafts together for review.", href: "/evidence" },
];

function IdentityCard() {
  return (
    <div className="identity-card">
      <div className="identity-card__top"><span className="micro-label">REFERENCE / 01</span><span className="identity-card__status"><span /> ready to review</span></div>
      <div className="identity-card__portrait" aria-hidden="true"><div className="portrait-halo" /><div className="portrait-head"><span className="portrait-eye portrait-eye--left" /><span className="portrait-eye portrait-eye--right" /><span className="portrait-mouth" /></div><div className="portrait-shoulders" /><div className="portrait-scan" /></div>
      <div className="identity-card__copy"><div><span className="micro-label">DIGITAL IDENTITY</span><strong>reference profile</strong></div><span className="identity-card__check"><Check size={14} /></span></div>
      <div className="identity-card__footer"><span>Last checked just now</span><span>Private by design</span></div>
    </div>
  );
}

function HeroArt() {
  return (
    <div className="hero-visual" aria-label="A calm identity review workspace illustration" role="img">
      <div className="hero-visual__orbit hero-visual__orbit--one" /><div className="hero-visual__orbit hero-visual__orbit--two" />
      <div className="hero-visual__label hero-visual__label--top"><Sparkles size={13} /> quiet confidence</div><IdentityCard />
      <div className="signal-note signal-note--top"><span className="signal-note__dot" /> image provenance <ArrowUpRight size={13} /></div>
      <div className="signal-note signal-note--bottom"><span className="signal-note__icon"><ShieldCheck size={14} /></span><span>Worth a closer look.<br /><em>Never a final verdict.</em></span></div>
      <div className="hero-visual__caption">YOUR IMAGE / YOUR DECISION <ArrowDown size={12} /></div>
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("veriself-theme") || "light"; } catch { return "light"; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("veriself-theme", theme); } catch { /* Storage can be unavailable. */ }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));
  const closeMenu = () => setMobileMenuOpen(false);
  const handleContactSubmit = (event) => { event.preventDefault(); setFormSubmitted(true); };

  return (
    <div className="landing-shell" id="top">
      <div className="landing-announcement"><span className="announcement-mark">✳</span> A quieter way to stay close to your digital identity <a href="#about">Meet VeriSelf <ArrowUpRight size={13} /></a></div>
      <header className="landing-header"><div className="landing-header__inner landing-wrap"><Brand /><button className="landing-menu-toggle" type="button" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button><nav className={`landing-nav${mobileMenuOpen ? " landing-nav--open" : ""}`} aria-label="Main navigation"><a href="#about" onClick={closeMenu}>About</a><a href="#platform" onClick={closeMenu}>Platform</a><a href="#faq" onClick={closeMenu}>FAQs</a><Link className="landing-nav__cta" to="/dashboard" onClick={closeMenu}>Open command center <ArrowUpRight size={14} /></Link></nav><button className="landing-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><span className="theme-toggle__icon">{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</span><span>{theme === "dark" ? "Light" : "Dark"}</span></button></div></header>
      <main>
        <section className="landing-hero landing-section" aria-labelledby="hero-title"><div className="landing-wrap landing-hero__grid"><div className="landing-hero__copy"><p className="landing-eyebrow"><span /> digital identity defense / built for real life</p><h1 id="hero-title">Keep your identity <em>close to you.</em></h1><p className="landing-hero__lede">VeriSelf brings identity checks, public-page scans, and media review into one considered place—so you can spot signals without handing over your judgment.</p><div className="landing-actions"><Link className="landing-button landing-button--solid" to="/dashboard">Open command center <ArrowUpRight size={16} /></Link><a className="landing-text-link" href="#platform">See how it works <ArrowDown size={15} /></a></div><div className="landing-trust-line"><span><Check size={13} /> on-demand reviews</span><span><Check size={13} /> human in the loop</span><span><Check size={13} /> no final verdicts</span></div></div><HeroArt /></div><div className="landing-wrap landing-hero__footer"><span>FOR THE QUESTIONS THAT MATTER</span><span className="landing-hero__rule" /><span>MADE WITH CARE / 2026</span></div></section>
        <section className="landing-intro landing-section" id="about" aria-labelledby="intro-title"><div className="landing-wrap landing-intro__grid"><div className="landing-kicker"><span>01</span> the heart of it</div><div><h2 id="intro-title">Identity defense should feel more like a <em>studio</em> than a control room.</h2><div className="landing-intro__bottom"><p>VeriSelf is a digital-identity-defense project for everyday people. It gives you a clear place to establish a reference, inspect possible exposure, and keep the useful evidence close.</p><p className="landing-note"><ArrowUpRight size={17} /> Clear signals.<br /><em>Human decisions.</em></p></div></div></div><div className="landing-intro__stamp"><span>MADE FOR<br />YOUR OWN<br />WAY FORWARD</span><Sparkles size={16} /></div></section>
        <section className="landing-principles landing-section" aria-labelledby="principles-title"><div className="landing-wrap"><div className="landing-kicker"><span>02</span> what we believe</div><div className="landing-section-heading"><h2 id="principles-title">A good tool should <em>know its limits.</em></h2><p>Simple workflows, careful language, and room for a person to verify every important result.</p></div><div className="principle-list">{PRINCIPLES.map(({ number, icon: Icon, title, text }) => <article className="principle-card" key={number}><div className="principle-card__top"><span>{number} / 03</span><span className="principle-card__icon"><Icon size={18} /></span></div><h3>{title}</h3><p>{text}</p><ArrowUpRight className="principle-card__arrow" size={18} /></article>)}</div><div className="landing-caption"><span /> development-grade signals / human review always</div></div></section>
        <section className="landing-platform landing-section" id="platform" aria-labelledby="platform-title"><div className="landing-wrap"><div className="landing-kicker"><span>03</span> the toolkit</div><div className="landing-section-heading landing-section-heading--platform"><h2 id="platform-title">Everything you need to <em>look closer.</em></h2><p>Not an endless feed. A small set of considered tools for the moments when your image, name, or presence needs attention.</p></div><div className="module-grid">{MODULES.map(({ number, icon: Icon, title, text, href }) => <Link className="module-card" key={number} to={href}><span className="module-card__number">{number}</span><span className="module-card__icon"><Icon size={19} /></span><h3>{title}</h3><p>{text}</p><span className="module-card__link">Open tool <ArrowRight size={14} /></span></Link>)}</div></div></section>
        <section className="landing-how landing-section" aria-labelledby="how-title"><div className="landing-wrap landing-how__grid"><div><div className="landing-kicker"><span>04</span> a gentler workflow</div><h2 id="how-title">Three steps to a <em>clearer next move.</em></h2><p className="landing-how__intro">Start small. Check the source. Keep your own judgment at the center of the process.</p><div className="landing-how__aside"><Sparkles size={22} /> Your data deserves a calm room.</div></div><div className="steps-list">{STEPS.map(({ number, title, text, icon: Icon }) => <div className="step-row" key={number}><span className="step-row__number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="step-row__icon"><Icon size={17} /></span></div>)}<div className="step-row__note"><Heart size={15} /> No automation replaces your call.</div></div></div></section>
        <section className="landing-trust landing-section" aria-labelledby="trust-title"><div className="landing-wrap landing-trust__grid"><div className="landing-trust__seal"><ShieldCheck size={20} /><span>REVIEW<br />WITH<br />CARE</span></div><div><div className="landing-kicker"><span>05</span> the promise</div><h2 id="trust-title">Useful, not <em>certain.</em></h2><p>VeriSelf is designed to help you organize attention—not outsource responsibility. Every signal carries its context, every action stays yours.</p><a className="landing-text-link" href="#faq">Read the questions <ArrowDown size={15} /></a></div><blockquote><span>“</span><p>A little more clarity can change what you do next.</p><cite>— the VeriSelf principle</cite></blockquote></div></section>
        <section className="landing-faq landing-section" id="faq" aria-labelledby="faq-title"><div className="landing-wrap landing-faq__grid"><div><div className="landing-kicker"><span>06</span> good to know</div><h2 id="faq-title">The honest <em>answers.</em></h2><p>Because trust is built with specifics, not oversized promises.</p></div><div className="faq-list">{FAQS.map(({ question, answer }) => <details className="faq-item" key={question}><summary>{question}<ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div></div></section>
        <section className="landing-contact landing-section" aria-labelledby="contact-title"><div className="landing-contact__texture" /><div className="landing-wrap landing-contact__grid"><div><div className="landing-kicker landing-kicker--light"><span>07</span> stay in the loop</div><h2 id="contact-title">Make room for a <em>better question.</em></h2><p>Share a thought, a concern, or the kind of identity workflow you wish existed. This form is only a local preview until a backend is connected.</p><div className="landing-contact__note"><span><Heart size={15} /></span> Built with care for people, not just systems.</div></div><div className="landing-form-card">{formSubmitted ? <div className="landing-form-success"><CircleCheck size={24} /><h3>Thank you for the note.</h3><p>Your message is captured in this preview. Connect the backend when you are ready to make it real.</p><button className="landing-button landing-button--outline" type="button" onClick={() => setFormSubmitted(false)}>Send another</button></div> : <form onSubmit={handleContactSubmit}><div className="landing-form-card__heading"><span>Say hello</span><Sparkles size={16} /></div><label htmlFor="name">Your name</label><input id="name" name="name" placeholder="A name you like to use" required /><label htmlFor="email">Email address</label><input id="email" name="email" type="email" placeholder="you@example.com" required /><label htmlFor="message">A few words</label><textarea id="message" name="message" placeholder="What would make identity defense feel more human?" required /><button className="landing-button landing-button--accent" type="submit">Share your thought <ArrowUpRight size={15} /></button><p className="landing-form-note">No newsletters. No noise. Just a thoughtful reply when connected.</p></form>}</div></div></section>
      </main>
      <footer className="landing-footer"><div className="landing-wrap landing-footer__top"><div><Brand inverse /><p>Tools for keeping your digital identity close, considered, and yours.</p></div><div className="landing-footer__links"><div><span>Explore</span><Link to="/dashboard">Command center</Link><Link to="/identity">Identity profile</Link><Link to="/monitoring">Public scans</Link></div><div><span>Read</span><a href="#about">About VeriSelf</a><a href="#faq">FAQs</a><Link to="/privacy-policy">Privacy policy</Link></div></div></div><div className="landing-wrap landing-footer__bottom"><span>© 2026 VeriSelf / An experimental identity defense project.</span><span>Signals guide review. They are not proof.</span></div></footer>
    </div>
  );
}
