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


export function SiteStyle() {
  const { data: config } = useDoc<SiteConfig>('config/site');

  if (!config) return null;

  const primaryHsl = colorToHsl(config.customColor);
  
  // Se não houver cor primária válida, não faz nada
  if (!primaryHsl) return null;
  
  const { h, s, l } = primaryHsl;
  
  // Calcula cores da paleta com base na cor primária
  const primaryFg = l > 60 ? '0 0% 10%' : '0 0% 98%';
  const accentL = l > 50 ? Math.max(0, l - 10) : Math.min(100, l + 10);
  const bgL = Math.max(96, l + (96-l) * 0.8);
  const bgS = Math.min(15, s);

  // Verifica as cores customizadas do admin painel
  const customColors = config.customColors || {};

  const style = `
    :root {
      --background: ${h} ${bgS}% ${bgL}%;
      --foreground: ${customColors.bodyText ? colorToHsl(customColors.bodyText)?.h + ' ' + colorToHsl(customColors.bodyText)?.s + '% ' + colorToHsl(customColors.bodyText)?.l + '%' : '222 47% 11%'};
      
      --primary: ${h} ${s}% ${l}%;
      --primary-foreground: ${primaryFg};

      --secondary: ${h} ${s}% ${l + (100 - l) * 0.8}%;
      --secondary-foreground: ${h} ${s}% ${l > 50 ? Math.max(0, l-40) : Math.min(100, l+40)}%;
      
      --muted: ${h} ${s}% ${l + (100 - l) * 0.9}%;
      --muted-foreground: 215 14% 44%;

      --accent: ${h} ${s}% ${accentL}%;
      --accent-foreground: ${primaryFg};
      
      --border: ${h} ${s}% ${l + (100 - l) * 0.7}%;
      --input: ${h} ${s}% ${l + (100 - l) * 0.85}%;
      --ring: ${h} ${s}% ${l}%;
    }

    .font-headline {
        color: ${customColors.headingText || `hsl(${h}, ${s}%, ${l > 50 ? Math.max(0, l-30) : Math.min(100, l+30)}%)`};
    }
    
    .btn-primary {
        background-color: ${customColors.buttonBg || `hsl(${h}, ${s}%, ${l}%)`};
        color: ${customColors.buttonText || `hsl(${primaryFg})`};
    }
    .btn-primary:hover {
        background-color: ${customColors.buttonBg ? colorToHsl(customColors.buttonBg)?.h + ' ' + colorToHsl(customColors.buttonBg)?.s + '% ' + (colorToHsl(customColors.buttonBg).l - 5) + '%' : `hsl(${h}, ${s}%, ${l-5}%)`};
    }

  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: style }} />
  );
}
