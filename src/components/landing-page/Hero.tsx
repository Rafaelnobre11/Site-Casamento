import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';

interface HeroProps {
  texts?: { [key: string]: string };
  names?: string;
  heroImage?: string;
}

export default function Hero({ texts = {}, names, heroImage }: HeroProps) {
  const defaultHeroImage = PlaceHolderImages.find((p) => p.id === 'hero-bg');
  const imageSrc = heroImage || defaultHeroImage?.imageUrl;

  return (
    <section id="home" className="relative h-[100vh] w-full text-white">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={texts.hero_image_alt || "Casal de noivos"}
          fill
          className="object-cover"
          priority
          data-ai-hint="wedding couple"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <div className="container mx-auto flex flex-col items-center px-4">
          <p className="animate-fade-in-up uppercase tracking-[0.2em] text-sm md:text-base" style={{ animationDelay: '0.1s' }}>
            {texts.hero_subtitle || "A gente se enrolou e vai casar!"}
          </p>
          <h1 className="animate-fade-in-up font-headline text-6xl md:text-8xl lg:text-9xl my-4" style={{ animationDelay: '0.3s' }}>
            {names || "Jessica & Lucas"}
          </h1>
          <p className="animate-fade-in-up text-lg md:text-xl italic max-w-2xl" style={{ animationDelay: '0.5s' }}>
            {texts.hero_date || '21 de Setembro de 2024 - O dia do nosso "sim" (e do open bar).'}
          </p>
          <Button asChild size="lg" className="animate-fade-in-up mt-8 rounded-full shadow-lg" style={{ animationDelay: '0.7s' }}>
            <Link href="#rsvp">{texts.hero_cta || "Vem beber de graça!"}</Link>
          </Button>
        </div>
        <div className="absolute bottom-0 w-full p-6 md:p-10">
            <div className="container mx-auto max-w-7xl">
                 <div className="animate-fade-in-up flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-sm md:text-base backdrop-blur-sm bg-white/10 p-4 rounded-lg" style={{ animationDelay: '0.9s' }}>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>16:00</span>
                    </div>
                    <div className="hidden md:block h-6 w-px bg-white/30"></div>
                    <div className="flex items-center gap-2 text-center">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>Vila das Amoreiras, São Paulo - SP</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
