class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('ErrorBoundary caught:', error, errorInfo.componentStack); }
  render() {
    if (this.state.hasError) {
      return (<div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="text-center text-white"><h1 className="text-2xl font-bold mb-4">Something went wrong</h1><button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded">Reload</button></div></div>);
    }
    return this.props.children;
  }
}

function PlaygroundHero() {
  React.useEffect(() => {
    gsap.fromTo('.hero-container',
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out', delay: 0.3 }
    );
    gsap.fromTo('.hero-sub',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.8 }
    );
  }, []);

  return (
    <section className="section-h pt-32 pb-16" data-name="playground-hero">
      <div className="text-center" style={{ position: 'relative', zIndex: 10 }}>
        <div className="hero-container mb-8" id="turb-box">
          <svg className="mysvg mx-auto" width="800" height="280" viewBox="0 0 600 200">
            <defs>
              <filter id="turb-grid">
                <feTurbulence id="turbwave-grid" type="fractalNoise" baseFrequency="0.11" numOctaves="20000" result="turbulence_3" />
                <feDisplacementMap xChannelSelector="R" yChannelSelector="G" in="SourceGraphic" in2="turbulence_3" scale="10" />
              </filter>
            </defs>
            <image x="0" y="0" width="100%" height="100%" xlinkHref="https://pub-1ae9a3d95ead4a65b5c663c4d43d1de2.r2.dev/Untitled481_20251230000438.png" filter="url(#turb-grid)" />
          </svg>
        </div>
        <p className="hero-sub text-white/50 text-sm tracking-[0.3em] uppercase">ScrollStudio Playground</p>
        <h1 className="hero-sub text-5xl md:text-8xl font-bold text-white mt-4 uppercase tracking-tighter">Interactive Samples</h1>
        <p className="hero-sub text-white/30 text-xs mt-6 tracking-widest uppercase italic">Select an experience</p>
      </div>
    </section>
  );
}

function PlaygroundGrid() {
  try {
    const examples = [
      { id: '1', url: 'immersive.html' },
      { id: '2', url: 'predator.html' },
      { id: '3', url: 'glock.html' },
      { id: '4', url: 'astro.html' },
      { id: '5', url: 'knot.html' },
      { id: '6', url: 'shapes.html' },
      { id: '7', url: 'camerarail.html' },
      { id: '8', url: 'camerarail2.html' },
      { id: '9', url: 'about.html' },
      { id: '10', url: 'guns.html' }
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-[100] pointer-events-auto" data-name="playground-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {examples.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              className="edge-light-card block aspect-[3/4] group pointer-events-auto cursor-pointer"
            >
              <div className="card-content flex items-center justify-center p-6">
                <span className="text-[120px] font-black text-white/10 group-hover:text-white/20 transition-all duration-500 italic tracking-tighter">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Subtle Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-white/40">Launch</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('PlaygroundGrid error:', error);
    return null;
  }
}

function App() {
  try {
    return (
      <div data-name="app" data-file="playground-app.js">
        <NoiseLayer />
        <Navigation />
        <main className="pointer-events-auto">
          <PlaygroundHero />
          <PlaygroundGrid />
        </main>
      </div>
    );
  } catch (error) { console.error('App error:', error); return null; }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);