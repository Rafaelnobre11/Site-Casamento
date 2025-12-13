
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface HeroProps {
  names?: string;
  weddingDate?: string;
  romanticQuote?: string;
  heroImage?: string;
  texts?: { [key: string]: string };
}

const Hero: React.FC<HeroProps> = ({ 
  names = 'Cláudia & Rafael', 
  weddingDate,
  romanticQuote,
  heroImage,
  texts = {}
}) => {
  const defaultHeroImage = PlaceHolderImages.find((p) => p.id === 'hero-bg');
  const imageSrc = heroImage || defaultHeroImage?.imageUrl;

  const nameParts = names.split('&');
  const name1 = nameParts[0] ? nameParts[0].trim() : '';
  const name2 = nameParts[1] ? nameParts[1].trim() : '';

  return (
    <section id="home" className="relative min-h-screen w-full text-white flex flex-col justify-center items-center">
      {imageSrc && <Image
        src={imageSrc}
        alt="Imagem do casal"
        fill
        className="object-cover"
        priority
        data-ai-hint="wedding couple elegant"
      />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end text-center pb-16 sm:pb-20 md:pb-24">
        <div className="container mx-auto flex flex-col items-center px-4">
          <p className="animate-fade-in-up uppercase tracking-[0.3em] text-sm md:text-base" style={{ animationDelay: '0.1s' }}>
            {weddingDate || "21 de Setembro de 2024"}
          </p>
          <h1 className="animate-fade-in-up font-hero-headline font-headline text-5xl sm:text-6xl md:text-8xl my-4" style={{ animationDelay: '0.3s' }}>
            <span className="block sm:inline">{name1}</span>
            <span className="text-primary text-4xl sm:text-6xl md:text-8xl mx-2 sm:mx-4">&amp;</span>
            <span className="block sm:inline">{name2}</span>
          </h1>
          <p className="animate-fade-in-up text-base md:text-lg lg:text-xl italic max-w-2xl font-light" style={{ animationDelay: '0.5s' }}>
            {romanticQuote || "A gente se enrolou e finalmente vai casar!"}
          </p>
          <Button asChild size="lg" className="animate-fade-in-up mt-8 rounded-full shadow-lg bg-white text-gray-800 hover:bg-gray-200" style={{ animationDelay: '0.7s' }}>
            <Link href="#rsvp">{texts.nav_rsvp || "Bora beber de graça!"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
