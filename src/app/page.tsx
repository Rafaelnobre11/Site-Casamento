
'use client';

import { useState, useEffect } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig } from '@/types/siteConfig';
import { Loader2, Lock } from 'lucide-react';
import Hero from '@/components/wedding/Hero';
import PhotoCarousel from '@/components/wedding/PhotoCarousel';
import RsvpSection from '@/components/wedding/RsvpSection';
import EventInfo from '@/components/wedding/EventInfo';
import GiftSection from '@/components/wedding/GiftSection';
import Footer from '@/components/wedding/Footer';
import Header from '@/components/landing-page/Header';
import { defaultGifts } from '@/lib/default-gifts';
import { cn } from '@/lib/utils';
import Countdown from '@/components/wedding/Countdown';

const defaultLayoutOrder = ['hero', 'carousel', 'countdown', 'rsvp', 'event', 'gifts'];

export default function Home() {
  const [isRsvpConfirmed, setIsRsvpConfirmed] = useState(false);
  const { data: siteConfig, loading } = useDoc<SiteConfig>('config/site');

  useEffect(() => {
    // Persist RSVP confirmation across reloads
    if (localStorage.getItem('rsvpConfirmed') === 'true') {
      setIsRsvpConfirmed(true);
    }
  }, []);

  const handleRsvpConfirmed = () => {
    setIsRsvpConfirmed(true);
    localStorage.setItem('rsvpConfirmed', 'true');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Carregando os detalhes do grande dia...</p>
      </div>
    );
  }

  // Fallback to a default config if nothing is in the database
  const config = siteConfig || {
    names: 'Jéssica & Lucas',
    date: '2025-09-21T16:00:00',
    locationName: 'Vila das Amoreiras',
    locationAddress: 'R. Funchal, 500 - Vila Olímpia, São Paulo - SP',
    mapUrl: 'https://maps.google.com/maps?q=Rua+Funchal%2C+500+-+Vila+Ol%C3%ADmpia%2C+S%C3%A3o+Paulo+-+SP&z=15&output=embed',
    wazeLink: 'https://www.waze.com/ul?q=Rua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo',
    products: defaultGifts,
    layoutOrder: defaultLayoutOrder,
    texts: {},
    customColors: {},
    carouselImages: [],
    isContentLocked: true, // Default to locked
  };
  
  const isContentLocked = config.isContentLocked;
  const showGatedContent = isRsvpConfirmed || !isContentLocked;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FBF9F6] text-[#4a4a4a]">
      <Header texts={config.texts} names={config.names} logoUrl={config.logoUrl} />
      <main className="flex-1">
        <Hero 
          names={config.names}
          weddingDate={config.date}
          romanticQuote={config.texts?.hero_subtitle || "Duas almas, uma só história. O nosso 'para sempre' começa agora."}
          heroImage={config.heroImage}
        />
        <PhotoCarousel images={config.carouselImages} />
        
        {config.date && (
            <div className="bg-[#C5A086] py-12">
                <Countdown targetDate={config.date} />
            </div>
        )}

        <RsvpSection onRsvpConfirmed={handleRsvpConfirmed} />
        
        <div className="relative">
             <div className={cn(
                "transition-all duration-700", 
                !showGatedContent && "blur-md pointer-events-none select-none"
             )}>
                <EventInfo
                  locationName={config.locationName}
                  address={config.locationAddress}
                  time={config.time}
                  wazeLink={config.wazeLink}
                  mapUrl={config.mapUrl}
                />
                <GiftSection 
                    products={config.products} 
                    pixKey={config.pixKey} 
                />
            </div>
             {!showGatedContent && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm z-10 text-center p-4">
                    <Lock className="w-16 h-16 text-primary mb-4" />
                    <h3 className="font-headline text-2xl text-primary-foreground bg-primary/80 px-4 py-2 rounded-md shadow-lg">
                        {config.texts?.rsvp_lock_message_title || "🤫 Segredo, hein?"}
                    </h3>
                    <p className="mt-2 text-lg text-primary-foreground max-w-md bg-primary/80 px-4 py-2 rounded-md shadow-lg">
                       {config.texts?.rsvp_lock_message_subtitle || "Calma, curioso! Primeiro diz que vai, depois a gente te mostra onde é a festa e como nos ajudar a ficar menos duros."}
                    </p>
                </div>
            )}
        </div>

      </main>
      <Footer names={config.names} />
    </div>
  );
}
