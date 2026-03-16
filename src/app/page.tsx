'use client';

import { useState, useEffect } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig, Guest } from '@/types/siteConfig';
import { Loader2 } from 'lucide-react';
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
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const { data: siteConfig, loading: loadingConfig } = useDoc<SiteConfig>('config/site');
  
  const { data: guestData, loading: loadingGuest } = useDoc<Guest>(
    currentGuestId ? `guests/${currentGuestId}` : ''
  );

  useEffect(() => {
    const savedId = localStorage.getItem('guestId');
    if (savedId) {
      setCurrentGuestId(savedId);
    }
  }, []);

  const handleRsvpSuccess = (guestId: string) => {
    setCurrentGuestId(guestId);
    localStorage.setItem('guestId', guestId);
  };

  if (loadingConfig) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Carregando os detalhes do grande dia...</p>
      </div>
    );
  }

  const config = {
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
    isContentLocked: true,
    ...siteConfig 
  };
  
  // Só bloqueia o endereço se o cadeado estiver ativo E o convidado não tiver status 'confirmed'
  const isConfirmed = guestData?.status === 'confirmed';
  const shouldLockAddress = config.isContentLocked && !isConfirmed;

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

        <RsvpSection onRsvpConfirmed={handleRsvpSuccess} />
        
        <EventInfo
          isLocked={shouldLockAddress}
          locationName={shouldLockAddress ? "Local Protegido" : config.locationName}
          address={shouldLockAddress ? "Confirme sua presença para liberar o acesso ao endereço" : config.locationAddress}
          time={config.time}
          wazeLink={shouldLockAddress ? "#rsvp" : config.wazeLink}
          mapUrl={shouldLockAddress ? "" : config.mapUrl}
          date={config.date}
        />

        <GiftSection 
            products={config.products} 
            pixKey={config.pixKey} 
        />

      </main>
      <Footer names={config.names} />
    </div>
  );
}
