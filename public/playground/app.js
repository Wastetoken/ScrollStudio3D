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

function App() {
  try {
    const [loading, setLoading] = React.useState(true);
    const [progress, setProgress] = React.useState(0);

    return (
      <div data-name="app" data-file="app.js">
        {loading && <Loader progress={progress} />}
        <NoiseLayer />
        <Navigation />
        <div id="viewport"></div>
        <Scene3D onProgress={setProgress} onLoaded={() => setLoading(false)} />
        <main>
          <HeroSection />
          <ContentSection title="Transform" subtitle="Vision" desc="Where imagination meets precision." align="left" index={1} />
          <ContentSection title="Command" subtitle="The Moment" desc="Every frame tells a story." align="right" index={2} />
          <ContentSection title="Elevate" subtitle="Beyond" desc="Pushing boundaries of possibility." align="center" index={3} />
          <CTASection />
        </main>
      </div>
    );
  } catch (error) { console.error('App error:', error); return null; }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);