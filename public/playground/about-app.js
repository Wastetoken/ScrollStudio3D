class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) return <div className="min-h-screen flex items-center justify-center bg-[#030303] text-white">Error occurred</div>;
    return this.props.children;
  }
}

function AboutApp() {
  try {
    const [loading, setLoading] = React.useState(true);
    const [progress, setProgress] = React.useState(0);

    return (
      <div data-name="about-app" data-file="about-app.js">
        {loading && <Loader progress={progress} />}
        <NoiseLayer />
        <Navigation />
        <div id="viewport"></div>
        <SkaterScene onProgress={setProgress} onLoaded={() => setLoading(false)} />
        <main>
          <AboutHero />
          <AboutSection title="Push" subtitle="Forward" desc="Every journey starts with a single push." anim="idle_and_push" index={1} />
          <AboutSection title="Take" subtitle="Flight" desc="Defy gravity. Reach new heights." anim="jump" index={2} />
          <AboutSection title="Master" subtitle="The Art" desc="Expression through motion." anim="tricks_1" index={3} />
          <AboutSection title="Style" subtitle="Defined" desc="Your signature move awaits." anim="tricks_2" index={4} />
          <AboutSection title="Keep" subtitle="Moving" desc="The journey never ends." anim="walk" index={5} />
        </main>
      </div>
    );
  } catch (error) { console.error('AboutApp error:', error); return null; }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><AboutApp /></ErrorBoundary>);