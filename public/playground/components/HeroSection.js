function HeroSection() {
  try {
    React.useEffect(() => {
      gsap.registerPlugin(ScrollTrigger);

      // Set initial state to visible first, then animate
      gsap.set('.hero-container', { opacity: 1, y: 0 });
      gsap.set('.hero-sub', { opacity: 1, y: 0 });

      gsap.fromTo('.hero-container',
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out', delay: 0.3 }
      );
      gsap.fromTo('.hero-sub',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.8 }
      );

      // SVG turbulence animation
      if (typeof TweenMax !== 'undefined') {
        TweenMax.to("#turbwave", 30, {
          attr: { "baseFrequency": 0.01 },
          repeat: -1,
          yoyo: true
        });
      }
    }, []);

    return (
      <section className="section-h" data-name="hero-section" data-file="components/HeroSection.js">
        <div className="text-center" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-container" id="turb-box">
            <svg className="mysvg" width="1614" height="570" viewBox="0 0 600 200">
              <defs>
                <filter id="turb">
                  <feTurbulence id="turbwave" type="fractalNoise" baseFrequency="0.11" numOctaves="20000" result="turbulence_3" data-filterid="3" />
                  <feDisplacementMap xChannelSelector="R" yChannelSelector="G" in="SourceGraphic" in2="turbulence_3" scale="10" />
                </filter>
              </defs>
              <image id="img" x="0" y="0" width="100%" height="100%" xlinkHref="https://pub-1ae9a3d95ead4a65b5c663c4d43d1de2.r2.dev/Untitled481_20251230000438.png" filter="url(#turb)" />
            </svg>
          </div>
          <p className="hero-sub text-white/50 text-sm tracking-[0.3em] uppercase mt-8">Scroll to explore</p>
        </div>
      </section>
    );
  } catch (error) { console.error('HeroSection error:', error); return null; }
}
