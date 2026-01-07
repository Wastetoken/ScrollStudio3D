import { useEffect } from 'react';
import { FontDefinition } from '../types';

export const loadFont = (font: FontDefinition) => {
  const existingElement = document.getElementById(`font-${font.id}`);
  if (existingElement) return;

  if (font.source === 'cdn' && font.url) {
    const link = document.createElement('link');
    link.id = `font-${font.id}`;
    link.rel = 'stylesheet';
    link.href = font.url;
    document.head.appendChild(link);
  } else if (font.source === 'local') {
    const style = document.createElement('style');
    style.id = `font-${font.id}`;
    // Use data URI for runtime preview if available, otherwise fallback to localPath
    const src = font.data ? font.data : font.localPath;
    if (!src) return;

    style.textContent = `
      @font-face {
        font-family: '${font.name}';
        src: url('${src}') format('woff2');
        font-weight: ${font.weights?.join(' ') || 'normal'};
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }
};

export const useFontLoader = (fonts: FontDefinition[]) => {
  useEffect(() => {
    fonts.forEach(loadFont);
  }, [fonts]);
};
