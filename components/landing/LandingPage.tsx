"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const fragments = ["blue train", "midnight", "she remembers", "maybe a poem", "names on walls", "don't forget this", "visual story?", "wait—", "another ending", "voice note 02", "12:47 AM", "the light changed", "not a novel", "keep this line", "where did it go?"];
const chaos = ["IDEA", "IDEA", "IDEA", "IDEA", "IDEA", "OPEN TAB", "NEW NOTE", "VOICE MEMO", "HALF SENTENCE", "ABANDONED"];
const paths = ["FLASH FICTION", "POEM", "VISUAL STORY"];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="landing-eyebrow">{children}</p>;
}

export function LandingPage() {
  const reducedMotion = useReducedMotion();
  const [activePath, setActivePath] = useState("POEM");
  const [navSolid, setNavSolid] = useState(false);
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--cursor-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--cursor-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <main className="landing" onScroll={(event) => setNavSolid(event.currentTarget.scrollTop > 40)}>
      <header className={`landing-nav ${navSolid ? "landing-nav--solid" : ""}`}>
        <Link className="landing-brand" href="/">CATCH THE FLOOD</Link>
        <nav aria-label="Landing navigation"><a href="#method">Method</a><a href="#why">Why it exists</a><a href="#studio">Studio</a></nav>
        <Link className="landing-nav__studio" href="/app">Open Studio <span>↗</span></Link>
      </header>

      <section className="landing-hero" onPointerMove={onPointerMove} aria-labelledby="hero-title">
        <div className="landing-hero__noise" aria-hidden="true" />
        <div className="landing-vertical">FROM<br />IDEA FLOOD<br />TO<br /><strong>FINISHED PIECE</strong></div>
        <div className="landing-hero__copy">
          <Eyebrow>CREATIVE COMPLETION SYSTEM / 01</Eyebrow>
          <h1 id="hero-title">YOUR BRAIN<br />DOESN&apos;T NEED<br />TO SLOW DOWN.<em>IT NEEDS SOMEWHERE TO GO.</em></h1>
          <p className="landing-hero__lede">When ideas arrive faster than you can organize them, Catch the Flood captures the chaos, protects your voice, and helps you finish one thing.</p>
          <div className="landing-actions"><Link href="/app" className="landing-primary">CATCH YOUR FLOOD <span>→</span></Link><a href="#method" className="landing-secondary">SEE HOW IT WORKS</a></div>
        </div>
        <div className="idea-flood" aria-label="An animated field of captured creative fragments">
          <div className="idea-flood__halo" /><div className="idea-flood__capture">CAPTURE</div>
          {fragments.map((fragment, index) => <motion.span key={fragment} className={`idea-flood__fragment idea-flood__fragment--${index % 5}`} initial={{ opacity: 0 }} animate={{ opacity: 1, x: reducedMotion ? 0 : [0, index % 2 ? 8 : -7, 0], y: reducedMotion ? 0 : [0, index % 3 - 2, 0] }} transition={{ opacity: { delay: 0.25 + index * 0.055 }, x: { duration: 5 + index % 4, repeat: Infinity }, y: { duration: 4 + index % 3, repeat: Infinity } }}>{fragment}</motion.span>)}
          <svg className="idea-flood__threads" viewBox="0 0 500 500" aria-hidden="true"><path d="M65 95 C180 160 290 95 405 220" /><path d="M40 360 C185 240 285 430 442 294" /><path d="M120 430 C220 330 330 370 430 120" /></svg>
        </div>
      </section>

      <section className="landing-problem" id="why">
        <Eyebrow>THE RECOGNITION</Eyebrow><h2>THE PROBLEM ISN&apos;T<br />THAT YOU HAVE TOO FEW IDEAS.<em>IT&apos;S THAT THEY ARRIVE<br />ALL AT ONCE.</em></h2>
        <div className="chaos-line" aria-label="Ideas become tabs, notes, voice memos and abandoned fragments">{chaos.map((item, index) => <span key={`${item}-${index}`}>{item}{index < chaos.length - 1 && <i>→</i>}</span>)}</div>
        <p>Creativity doesn&apos;t always arrive as a clean brief.</p>
      </section>

      <section className="landing-reframe"><p>SO WE BUILT THE OPPOSITE.</p><h2>Don&apos;t force the flood into a form.<br /><em>Catch it first.</em></h2><div className="landing-wave" /></section>

      <section className="landing-workflow" id="method" aria-labelledby="method-heading">
        <Eyebrow>THE METHOD / 02</Eyebrow><h2 id="method-heading">CHAOS BECOMES A WAY FORWARD.</h2>
        <article className="workflow-step"><span>STEP 01</span><div><h3>CAPTURE</h3><p>Don&apos;t organize it.</p></div><div className="workflow-dump">{["girl", "train", "midnight", "forgetting", "blue", "maybe poem", "wait", "names", "wall"].map((word) => <b key={word}>{word}</b>)}</div></article>
        <article className="workflow-step"><span>STEP 02</span><div><h3>FIDELITY</h3><p>We preserve what is yours.</p></div><div className="fidelity-readout"><strong>17 <small>CREATIVE UNITS CAPTURED</small></strong><strong>0 <small>INVENTED</small></strong><p><i>WHAT YOU SAID</i><br />The blue train still comes.</p></div></article>
        <article className="workflow-step"><span>STEP 03</span><div><h3>MOMENTUM</h3><p>Now give the ideas somewhere to go.</p></div><div className="workflow-paths">{paths.map((path) => <button type="button" onClick={() => setActivePath(path)} data-active={activePath === path} key={path}>{path}<span>→</span></button>)}</div></article>
        <article className="workflow-step workflow-step--finish"><span>STEP 04</span><div><h3>FINISH</h3><p>17 fragments → 1 finished piece.</p></div><div className="workflow-finish">MIDNIGHT<br />FORGETTING</div></article>
      </section>

      <section className="agent-system"><Eyebrow>THE CREATOR REMAINS CENTRAL</Eyebrow><div className="agent-system__diagram"><div><span>FIDELITY AGENT</span><p>Protects the creator&apos;s voice.</p></div><strong>THE<br />CREATOR</strong><div><span>MOMENTUM AGENT</span><p>Creates a path to completion.</p></div></div><p className="agent-system__flow">RAW FLOOD <i>→</i> FIDELITY <i>→</i> CREATIVE UNITS <i>→</i> MOMENTUM <i>→</i> CHOICE <i>→</i> FINISHED WORK</p><p>One agent protects the idea. The other protects the momentum.</p></section>

      <section className="artifact" id="studio"><div className="artifact__copy"><Eyebrow>COMPLETION / 04</Eyebrow><h2>DON&apos;T END WITH A CHAT REPLY.<em>END WITH SOMETHING YOU CAN KEEP.</em></h2><p>Creative work deserves a home, not a disappearing conversation.</p><Link href="/app" className="landing-secondary">OPEN THE STUDIO →</Link></div><article className="artifact__paper"><span>17 SOURCE FRAGMENTS · VOICE PRESERVED</span><h3>MIDNIGHT<br />FORGETTING</h3><p>the blue train still comes<br />through the place I left<br />my name on the wall</p><footer>POEM / 24 LINES <b>CREATED JUST NOW</b></footer></article></section>

      <section className="landing-belief"><p>AI DIDN&apos;T CREATE THIS.</p><h2>YOU DID.</h2><span>Catch the Flood doesn&apos;t replace the creative act. It helps you cross the distance between having the idea and finishing it.</span></section>

      <section className="landing-human"><Eyebrow>BUILT WITH REAL PEOPLE</Eyebrow><h2>DESIGNED AROUND LIVED CREATIVE EXPERIENCE, NOT ASSUMPTIONS.</h2><p>CURRENTLY TESTING WITH NEURODIVERGENT CREATORS</p></section>

      <section className="landing-final"><Eyebrow>YOUR NEXT IDEA IS ALREADY COMING.</Eyebrow><h2>DON&apos;T LET IT<br /><em>DISAPPEAR.</em></h2><div className="landing-actions"><Link href="/app" className="landing-primary">CATCH YOUR FLOOD <span>→</span></Link><a href="#method" className="landing-secondary">EXPLORE THE METHOD</a></div></section>
      <footer className="landing-footer"><span>CATCH THE FLOOD</span><span>YOUR IDEAS. YOUR VOICE. FINISHED.</span><nav><Link href="/app">Studio</Link><a href="#method">Method</a><a href="#why">About</a><a href="#why">Accessibility</a><a href="#why">Privacy</a></nav><small>© 2026 Catch the Flood</small></footer>
    </main>
  );
}
