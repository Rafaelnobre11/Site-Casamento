'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig } from '@/types/siteConfig';

function hexToHsl(hex: string | undefined): string | null {
    if (!hex || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) return null;

    let r, g, b;
    hex = hex.substring(1); // remove #

    if (hex.length === 3) {
        r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
        g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
        b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


export function SiteStyle() {
  const { data: config } = useDoc<SiteConfig>('config/site');

  if (!config) return null;

  const primaryColorHsl = hexToHsl(config.customColor);
  const colors = config.customColors || {};

  const style = `
    :root {
      ${primaryColorHsl ? `--primary: ${primaryColorHsl};` : ''}
    }
    
    body {
        ${colors.bodyText ? `color: ${colors.bodyText};` : ''}
    }

    h1, h2, h3, h4, h5, h6, .font-headline {
        ${colors.headingText ? `color: ${colors.headingText};` : ''}
    }
    
    header {
        ${colors.headerBg ? `background-color: ${colors.headerBg} !important;` : ''}
        ${colors.headerBg ? `backdrop-filter: none !important;` : ''}
    }
    header a, header span {
        ${colors.headerText ? `color: ${colors.headerText} !important;` : ''}
    }

    footer {
        ${colors.footerBg ? `background-color: ${colors.footerBg};` : ''}
        ${colors.footerText ? `color: ${colors.footerText};` : ''}
    }
    footer a {
       ${colors.footerText ? `color: ${colors.footerText};` : ''}
    }
    footer a:hover {
       ${colors.footerText ? `color: ${colors.footerText}; opacity: 0.8;` : ''}
    }
    
    .btn-primary {
        ${colors.buttonBg ? `background-color: ${colors.buttonBg};` : ''}
        ${colors.buttonText ? `color: ${colors.buttonText};` : ''}
    }
     .btn-primary:hover {
        ${colors.buttonBg ? `background-color: ${colors.buttonBg}; opacity: 0.9;` : ''}
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: style }} />
  );
}
