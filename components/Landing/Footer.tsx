import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-10 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
              <h3 className="text-xl font-bold text-white">3D Scrollytelling</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Create immersive 3D narratives with scroll-based animations and cinematic camera movements.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
              <span>Built with React Three Fiber</span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  Examples
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  Templates
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} 3D Scrollytelling Engine. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="transition-colors hover:text-white">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-white">
                License
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
