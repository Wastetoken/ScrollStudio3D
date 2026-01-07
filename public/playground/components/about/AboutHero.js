function AboutHero() {
  try {
    React.useEffect(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo('.about-hero-title', { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out', delay: 0.3 });
      gsap.fromTo('.about-hero-sub', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.8 });
    }, []);

    return (
      <section className="section-h" data-name="about-hero" data-file="components/about/AboutHero.js">
        <div className="text-center" style={{ position: 'relative', zIndex: 10 }}>
          <h1 className="about-hero-title text-[12vw] font-serif italic tracking-[-0.05em] leading-none text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Meet <span className="text-orange-500">Skater</span>
          </h1>
          <p className="about-hero-sub text-white/50 text-sm tracking-[0.3em] uppercase mt-8">Scroll to ride along</p>
        </div>
      </section>
    );
  } catch (error) { console.error('AboutHero error:', error); return null; }
}