function ContentSection({ title, subtitle, desc, align, index }) {
  try {
    const sectionRef = React.useRef(null);
    const alignClass = align === 'left' ? 'items-start text-left pl-16' : align === 'right' ? 'items-end text-right pr-16' : 'items-center text-center';

    React.useEffect(() => {
      gsap.registerPlugin(ScrollTrigger);
      const el = sectionRef.current;
      const items = el.querySelectorAll('.gs-anim');
      
      // Set initial visible state
      gsap.set(items, { opacity: 1, y: 0, filter: 'blur(0px)' });
      
      gsap.fromTo(items, 
        { opacity: 0, y: 60, filter: 'blur(10px)' }, 
        {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      );
    }, []);

    return (
      <section ref={sectionRef} className={`section-h flex-col ${alignClass}`} style={{ position: 'relative', zIndex: 5 }} data-name="content-section" data-file="components/ContentSection.js">
        <p className="gs-anim text-xs tracking-[0.3em] uppercase text-white/40 mb-4">0{index}</p>
        <h2 className="gs-anim text-[9vw] font-serif italic tracking-[-0.05em] leading-none text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
        <h3 className="gs-anim outline-text text-[9vw] font-serif italic tracking-[-0.05em] leading-none -mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>{subtitle}</h3>
        <p className="gs-anim text-white/60 text-lg mt-8 max-w-md">{desc}</p>
      </section>
    );
  } catch (error) { console.error('ContentSection error:', error); return null; }
}