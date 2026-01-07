function AboutSection({ title, subtitle, desc, anim, index }) {
  try {
    const ref = React.useRef(null);
    const aligns = ['left', 'right', 'center', 'right', 'left'];
    const align = aligns[(index - 1) % 5];
    const alignClass = align === 'left' ? 'items-start text-left pl-16' : align === 'right' ? 'items-end text-right pr-16' : 'items-center text-center';

    React.useEffect(() => {
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current;
      const items = el.querySelectorAll('.gs-anim');
      gsap.fromTo(items, { opacity: 0, y: 60, filter: 'blur(10px)' }, {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    }, []);

    return (
      <section ref={ref} className={`section-h flex-col ${alignClass}`} data-anim={anim} style={{ position: 'relative', zIndex: 5 }} data-name="about-section" data-file="components/about/AboutSection.js">
        <p className="gs-anim text-xs tracking-[0.3em] uppercase text-white/40 mb-4">0{index}</p>
        <h2 className="gs-anim text-[9vw] font-serif italic tracking-[-0.05em] leading-none text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
        <h3 className="gs-anim outline-text text-[9vw] font-serif italic tracking-[-0.05em] leading-none -mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>{subtitle}</h3>
        <p className="gs-anim text-white/60 text-lg mt-8 max-w-md">{desc}</p>
      </section>
    );
  } catch (error) { console.error('AboutSection error:', error); return null; }
}