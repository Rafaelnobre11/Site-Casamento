'use client';
import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig } from '@/types/siteConfig';

/**
 * Converte uma string de cor (hex, rgb, nome) para um objeto HSL.
 * Retorna null se a cor for inválida.
 */
function colorToHsl(colorStr: string | undefined): { h: number; s: number; l: number } | null {
  if (!colorStr) return null;

  const tempEl = document.createElement('div');
  tempEl.style.color = colorStr;
  document.body.appendChild(tempEl);

  const computedColor = window.getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch) return null;

  let r = parseInt(rgbMatch[1], 10);
  let g = parseInt(rgbMatch[2], 10);
  let b = parseInt(rgbMatch[3], 10);

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}


export function SiteStyle() {
  const { data: config } = useDoc<SiteConfig>('config/site');

  if (!config) return null;

  const primaryHsl = colorToHsl(config.customColor);
  
  if (!primaryHsl) return null;
  
  // Gera uma paleta de cores a partir da cor primária
  const { h, s, l } = primaryHsl;
  
  // Foreground: Preto ou branco dependendo da luminosidade da cor primária
  const primaryFg = l > 50 ? '0 0% 10%' : '0 0% 98%';

  // Accent: uma versão mais clara/escura da cor primária
  const accentL = l > 50 ? Math.max(0, l - 10) : Math.min(100, l + 10);

  // Background: Um tom muito claro e com baixa saturação da cor primária
  const bgL = Math.max(96, l + (96-l) * 0.8);
  const bgS = Math.min(15, s);

  const style = `
    :root {
      --background: ${h} ${bgS}% ${bgL}%;
      --foreground: 222 47% 11%; /* Mantém um cinza escuro para texto principal */
      
      --primary: ${h} ${s}% ${l}%;
      --primary-foreground: ${primaryFg};

      --secondary: ${h} ${s}% ${l + (100 - l) * 0.8}%;
      --secondary-foreground: ${h} ${s}% ${l > 50 ? Math.max(0, l-40) : Math.min(100, l+40)}%;
      
      --muted: ${h} ${s}% ${l + (100-l) * 0.9}%;
      --muted-foreground: 215 14% 44%;

      --accent: ${h} ${s}% ${accentL}%;
      --accent-foreground: ${primaryFg};
      
      --border: ${h} ${s}% ${l + (100 - l) * 0.7}%;
      --input: ${h} ${s}% ${l + (100 - l) * 0.85}%;
      --ring: ${h} ${s}% ${l}%;
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: style }} />
  );
}
