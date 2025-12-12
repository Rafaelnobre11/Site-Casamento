
'use client';

import { useState, useEffect } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig } from '@/types/siteConfig';
import { Loader2 } from 'lucide-react';
import Hero from '@/components/wedding/Hero';
import PhotoCarousel from '@/components/wedding/PhotoCarousel';
import RsvpSection from '@/components/wedding/RsvpSection';
import EventInfo from '@/components/wedding/EventInfo';
import GiftSection from '@/components/wedding/GiftSection';
import Footer from '@/components/wedding/Footer';
import { defaultGifts } from '@/lib/default-gifts';

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
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.749033036691!2d-46.6963980844747!3d-23.57791926830578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57a6e1f0c29f%3A0x1d3a0a3a7b6c7a7e!2sRua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2004551-060!5e0!3m2!1sen!2sbr!4v1622573836063!5m2!1sen!2sbr',
    wazeLink: 'https://www.waze.com/ul?q=Rua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo',
    products: defaultGifts,
    layoutOrder: defaultLayoutOrder,
    texts: {},
    customColors: {},
    carouselImages: [],
  };
  
  const showGatedContent = isRsvpConfirmed || !(config.isContentLocked ?? true);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FBF9F6] text-[#4a4a4a]">
      <main className="flex-1">
        <Hero 
          names={config.names}
          weddingDate={config.date}
          romanticQuote="Duas almas, uma só história. O nosso 'para sempre' começa agora."
          heroImage={config.heroImage}
        />
        <PhotoCarousel images={config.carouselImages} />
        <RsvpSection onRsvpConfirmed={handleRsvpConfirmed} />
        
        {showGatedContent && (
          <div className="animate-fade-in-up duration-1000">
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
        )}

      </main>
      <Footer names={config.names} />
    </div>
  );
}
