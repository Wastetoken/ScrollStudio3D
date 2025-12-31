function Navigation() {
  try {
    return (
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center" data-name="navigation" data-file="components/Navigation.js">
        <div className="text-white text-sm tracking-[0.2em] uppercase font-medium">ScrollStudio</div>
        <div className="flex gap-8">
          <a href="/" className="nav-item text-white/70 text-xs tracking-[0.15em] uppercase hover:text-white transition-colors pointer-events-auto">Home</a>
          <a href="about.html" className="nav-item text-white/70 text-xs tracking-[0.15em] uppercase hover:text-white transition-colors pointer-events-auto">More</a>
        </div>
      </nav>
    );
  } catch (error) { console.error('Navigation error:', error); return null; }
}