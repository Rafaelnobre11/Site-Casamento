
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
import Countdown from '@/components/wedding/Countdown';

const defaultLayoutOrder = ['hero', 'countdown', 'carousel', 'rsvp', 'event', 'gifts'];

export default function Home() {
  const [isRsvpConfirmed, setIsRsvpConfirmed] = useState(false);
  const { data: siteConfig, loading } = useDoc<SiteConfig>('config/site');

  useEffect(() => {
    // Check local storage to see if RSVP was already confirmed
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

  // Define default config
  const defaultConfig = {
    names: 'Cláudia & Rafael',
    date: '2025-09-21T16:00:00',
    time: '16:00',
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

  // Merge siteConfig with defaultConfig
  const config = { ...defaultConfig, ...siteConfig };
  
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
        
        {config.date && (
            <div className="bg-[#C5A086] py-8 md:py-12">
                <Countdown targetDate={config.date} />
            </div>
        )}

        <PhotoCarousel images={config.carouselImages} />

        <RsvpSection onRsvpConfirmed={handleRsvpConfirmed} />
        
        {showGatedContent ? (
            <>
                <EventInfo
                  locationName={config.locationName}
                  address={config.locationAddress}
                  time={config.time}
                  wazeLink={config.wazeLink}
                  mapUrl={config.mapUrl}
                  date={config.date} // Pass the date prop
                />
                <GiftSection 
                    products={config.products} 
                    pixKey={config.pixKey} 
                />
            </>
        ) : (
            <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50 rounded-lg shadow-inner max-w-2xl mx-auto my-12">
                <Lock className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800">Calma lá, ansioso!</h3>
                <p className="mt-2 text-md text-gray-600">Primeiro confirma que você vem...</p>
            </div>
        )}

      </main>
      <Footer names={config.names} />
    </div>
  );
}
