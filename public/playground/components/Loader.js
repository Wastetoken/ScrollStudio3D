function Loader({ progress }) {
  try {
    return (
      <div className="fixed inset-0 bg-[#030303] z-[10000] flex flex-col justify-center items-center" data-name="loader" data-file="components/Loader.js">
        <p className="text-white text-sm tracking-[0.2em] uppercase mb-8" style={{ fontFamily: "'General Sans', sans-serif" }}>Loading Experience</p>
        <div className="w-60 h-px bg-white/10 relative overflow-hidden">
          <div id="loader-bar" className="absolute top-0 left-0 h-full bg-white transition-transform duration-400" style={{ transform: `scaleX(${progress / 100})`, transformOrigin: 'left' }}></div>
        </div>
        <p className="text-white/50 text-xs mt-4 font-mono">{Math.round(progress)}%</p>
      </div>
    );
  } catch (error) { console.error('Loader error:', error); return null; }
}