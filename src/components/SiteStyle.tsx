'use client';
import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig } from '@/types/siteConfig';

/**
 * Converte uma string de cor (hex, rgb, nome) para um objeto HSL.
 * Retorna null se a cor for inválida.
 */
function colorToHsl(colorStr: string | undefined): { h: number; s: number; l: number } | null {
  if (!colorStr) return null;

  // Usa um elemento temporário para obter o valor RGB computado, lidando com nomes de cores
  const tempEl = document.createElement('div');
  tempEl.style.color = colorStr;
  document.body.appendChild(tempEl);

  const computedColor = window.getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch) return null;

  let r = parseInt(rgbMatch[1], 10) / 255;
  let g = parseInt(rgbMatch[2], 10) / 255;
  let b = parseInt(rgbMatch[3], 10) / 255;

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Calcula o YIQ para determinar se uma cor de fundo precisa de texto claro ou escuro.
 */
function getYiq(color: {r: number, g: number, b: number}): number {
    return ((color.r * 299) + (color.g * 587) + (color.b * 114)) / 1000;
}

function hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function colorStringToHex(colorStr: string | undefined): string | null {
    if (!colorStr) return null;
    const tempEl = document.createElement('div');
    tempEl.style.color = colorStr;
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return null;

    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


export function SiteStyle() {
  const { data: config } = useDoc<SiteConfig>('config/site');

  if (!config) return null;

  const primaryHsl = colorToHsl(config.customColor || '#e85d3f');
  
  if (!primaryHsl) return null;
  
  const { h, s, l } = primaryHsl;
  
  const buttonHex = colorStringToHex(config.customColors?.buttonBg) || colorStringToHex(config.customColor);
  const buttonRgb = buttonHex ? hexToRgb(buttonHex) : null;
  const buttonYiq = buttonRgb ? getYiq(buttonRgb) : 128;
  const buttonColor = buttonYiq >= 128 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)';

  const customColors = config.customColors || {};

  const style = `
    :root {
      --background: ${h} ${s * 0.15} ${Math.min(98, l + (100 - l) * 0.95)}%;
      --foreground: ${customColors.bodyText ? `${colorToHsl(customColors.bodyText)?.h} ${colorToHsl(customColors.bodyText)?.s}% ${colorToHsl(customColors.bodyText)?.l}%` : `${h} ${s*0.3} ${Math.max(10, l * 0.2)}%`};
      --card: ${h} ${s * 0.1} ${Math.min(100, l + (100 - l) * 0.98)}%;
      --card-foreground: ${h} ${s*0.3} ${Math.max(10, l * 0.2)}%;

      --popover: var(--card);
      --popover-foreground: var(--card-foreground);
      
      --primary: ${h} ${s}% ${l}%;
      --primary-foreground: ${l > 60 ? '0 0% 10%' : '0 0% 98%'};

      --secondary: ${h} ${s * 0.8}% ${Math.min(100, l > 50 ? l * 0.9 : l + (100-l)*0.2)}%;
      --secondary-foreground: ${h} ${s}% ${l > 50 ? Math.max(0, l-40) : Math.max(10, l * 0.3)}%;
      
      --muted: ${h} ${s * 0.2} ${Math.min(97, l + (100 - l) * 0.9)}%;
      --muted-foreground: ${h} ${s*0.25} ${Math.max(30, l * 0.5)}%;

      --accent: ${h} ${s * 0.9}% ${Math.min(100, l > 50 ? l * 0.95 : l + (100-l)*0.1)}%;
      --accent-foreground: ${l > 60 ? '0 0% 10%' : '0 0% 98%'};
      
      --border: ${h} ${s * 0.3} ${Math.min(92, l + (100 - l) * 0.8)}%;
      --input: ${h} ${s * 0.25} ${Math.min(94, l + (100 - l) * 0.85)}%;
      --ring: ${h} ${s}% ${l}%;

      --radius: 0.75rem;
    }

    .font-headline {
      color: ${customColors.headingText || `hsl(${h}, ${s * 0.9}%, ${Math.max(15, l * 0.4)}%)`};
    }
  `;

  const dynamicButtonStyle = `
    .btn-primary {
      background-color: ${customColors.buttonBg || `hsl(${h}, ${s}%, ${l}%)`};
      color: ${customColors.buttonText || buttonColor};
    }
    .btn-primary:hover {
        background-color: ${customColors.buttonBg ? `color-mix(in srgb, ${customColors.buttonBg}, black 10%)` : `hsl(${h}, ${s}%, ${l-5}%)`};
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: style + dynamicButtonStyle }} />
  );
}
