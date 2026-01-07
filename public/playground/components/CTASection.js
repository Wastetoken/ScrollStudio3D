function CTASection() {
  try {
    const sectionRef = React.useRef(null);

    React.useEffect(() => {
      gsap.registerPlugin(ScrollTrigger);
      const el = sectionRef.current;
      gsap.fromTo(el.querySelectorAll('.cta-anim'), 
        { opacity: 0, y: 80, scale: 0.9 }, 
        { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 60%', toggleActions: 'play none none reverse' }
        }
      );
    }, []);

    return (
      <section ref={sectionRef} className="section-h flex-col items-center text-center" data-name="cta-section" data-file="components/CTASection.js">
        <p className="cta-anim text-xs tracking-[0.3em] uppercase text-white/40 mb-4">Ready?</p>
        <h2 className="cta-anim text-[7vw] font-serif italic tracking-[-0.05em] mb-2" style={{ 
          fontFamily: "'Playfair Display', serif",
          WebkitTextStroke: '2px rgba(255, 255, 255, 0.6)',
          WebkitTextFillColor: 'transparent'
        }}>Begin Your</h2>
        <h3 className="cta-anim text-[7vw] font-serif italic tracking-[-0.05em] text-white/60 mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Journey</h3>
        <p className="cta-anim text-white/60 text-lg mt-6 max-w-md mb-10">Let us bring your vision to life with immersive experiences.</p>
        <a href="https://scroll-studio3-d.vercel.app" target="_blank" rel="noopener noreferrer" id="cta-button" className="cta-anim group relative px-12 py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium tracking-widest uppercase text-sm rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,77,0,0.5)] pointer-events-auto inline-block no-underline">
          <span className="relative z-10">Start Creating</span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </a>
        <p className="cta-anim text-white/30 text-xs mt-8 tracking-wider">↑ Our friend insists</p>
      </section>
    );
  } catch (error) { console.error('CTASection error:', error); return null; }
}