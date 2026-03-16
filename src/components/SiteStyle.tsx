
'use client';
import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig } from '@/types/siteConfig';
import { colorToHsl, hexToRgb, getYiq } from '@/lib/color-utils';

export function SiteStyle() {
  const { data: config } = useDoc<SiteConfig>('config/site');

  if (!config) return null;

  const primaryColor = config.customColor || '#e85d3f'; // Terracota como fallback
  const primaryHsl = colorToHsl(primaryColor);
  
  if (!primaryHsl) return null;
  
  const { h, s, l } = primaryHsl;

  // Lógica de contraste para o texto do botão principal
  const primaryRgb = hexToRgb(primaryColor);
  const primaryYiq = primaryRgb ? getYiq(primaryRgb) : 128; // Default to dark text if conversion fails
  const primaryFg = primaryYiq >= 128 ? '0 0% 10%' : '0 0% 98%';

  // Lógica de contraste para o texto do botão customizado
  const buttonRgb = config.customColors?.buttonBg ? hexToRgb(config.customColors.buttonBg) : primaryRgb;
  const buttonYiq = buttonRgb ? getYiq(buttonRgb) : 128;
  const buttonFg = buttonYiq >= 128 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)';

  const customColors = config.customColors || {};

  const style = `
    :root {
      --background: ${h} ${s * 0.1} ${Math.min(99, l + (100 - l) * 0.98)}%;
      --foreground: ${h} ${s * 0.5} ${Math.max(8, l * 0.15)}%;
      
      --card: ${h} ${s * 0.05} ${Math.min(100, l + (100 - l) * 0.99)}%;
      --card-foreground: var(--foreground);

      --popover: var(--card);
      --popover-foreground: var(--card-foreground);
      
      --primary: ${h} ${s}% ${l}%;
      --primary-foreground: ${primaryFg};

      --secondary: ${h} ${s * 0.7} ${l * 0.9}%;
      --secondary-foreground: ${h} ${s} ${l * 0.2}%;
      
      --muted: ${h} ${s * 0.2} ${Math.min(97, l + (100 - l) * 0.94)}%;
      --muted-foreground: ${h} ${s * 0.25} ${Math.max(30, l * 0.5)}%;

      --accent: ${h} ${s * 0.8} ${l * 0.95}%;
      --accent-foreground: ${h} ${s} ${l * 0.25}%;
      
      --border: ${h} ${s * 0.15} ${l * 0.9}%;
      --input: ${h} ${s * 0.1} ${l * 0.95}%;
      --ring: ${h} ${s}% ${l}%;

      --radius: 0.75rem;
    }

    .font-headline {
      color: ${customColors.headingText || `hsl(${h}, ${s * 0.9}%, ${Math.max(15, l * 0.35)}%)`};
    }

    .font-hero-headline {
      color: ${customColors.heroHeadingText || `hsl(${h}, ${s * 0.1}%, ${Math.min(99, l + (100 - l) * 0.98)}%)`};
    }
    
    body {
        color: ${customColors.bodyText || `hsl(${h}, ${s * 0.3}, ${Math.max(15, l * 0.25)}%)`};
    }
  `;

  const dynamicButtonStyle = `
    .btn-primary {
      background-color: ${customColors.buttonBg || `hsl(${h}, ${s}%, ${l}%)`};
      color: ${customColors.buttonText || buttonFg};
    }
    .btn-primary:hover {
        background-color: ${customColors.buttonBg ? `color-mix(in srgb, ${customColors.buttonBg}, black 10%)` : `hsl(${h}, ${s}%, ${l - 5}%)`};
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: style + dynamicButtonStyle }} />
  );
}

    