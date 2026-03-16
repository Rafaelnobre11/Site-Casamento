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
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

<<<<<<< HEAD
  const config = {
=======
  // Define default config with witty texts
  const defaultConfig = {
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
    names: 'Cláudia & Rafael',
    date: '2025-09-21T16:00:00',
    time: '16:00',
    locationName: 'Vila das Amoreiras',
    locationAddress: 'R. Funchal, 500 - Vila Olímpia, São Paulo - SP',
    addressNumber: '500',
    mapUrl: 'https://maps.google.com/maps?q=Rua+Funchal%2C+500+-+Vila+Ol%C3%ADmpia%2C+S%C3%A3o+Paulo+-+SP&z=15&output=embed',
    wazeLink: 'https://www.waze.com/ul?q=Rua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Rua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo',
    products: defaultGifts,
    layoutOrder: defaultLayoutOrder,
    heroImage: PlaceHolderImages.find(p => p.id === 'hero-bg')?.imageUrl,
    texts: {
      nav_story: "Nossa Novela",
      nav_info: "Onde Vai Ser o Rolê",
      nav_gifts: "Manda PIX",
      nav_rsvp: "Bora beber de graça!",
      hero_date: "21 de Setembro de 2024",
      hero_subtitle: "O amor é lindo, a festa é cara e a gente aceita PIX em vez de faqueiro de prata.",
      carousel_title: "Nossa História em Fotos",
      carousel_subtitle: "Uma pequena viagem através de momentos especiais que nos trouxeram até aqui.",
      rsvp_title: "Bora ou não bora?",
      rsvp_subtitle: "Precisamos saber quantos pratos lavar. Por favor, não nos deixe no vácuo.",
      rsvp_find_button: "Achar meu convite",
      rsvp_confirm_button: "Bora Festejar! 🥳",
      rsvp_decline_button: "Vou dar o cano 😔",
      rsvp_lock_message_title: "🤫 Segredo, hein?",
      rsvp_lock_message_subtitle: "Calma lá, ansioso(a)! Primeiro confirma que você vem...",
      info_title: "Onde Vai Ser o Rolê",
      info_subtitle: "Anote tudo pra não se perder e, por favor, não atrase a noiva (mais ainda).",
      info_button: "Traçar Rota",
      gifts_title: "Ajude os Pombinhos",
      gifts_subtitle: "Presentes que valem mais que um abraço.",
      gifts_button: "Ver todos os presentes",
    },
    customColors: {},
    carouselImages: [],
    isContentLocked: true,
    ...siteConfig 
  };
<<<<<<< HEAD
=======

  // Merge siteConfig with defaultConfig, ensuring texts are merged deeply
  const config: SiteConfig = {
    ...defaultConfig,
    ...siteConfig,
    texts: {
      ...defaultConfig.texts,
      ...(siteConfig?.texts || {}),
    },
  };
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
  
  // Só bloqueia o endereço se o cadeado estiver ativo E o convidado não tiver status 'confirmed'
  const isConfirmed = guestData?.status === 'confirmed';
  const shouldLockAddress = config.isContentLocked && !isConfirmed;

  const components: { [key: string]: React.ReactNode } = {
    hero: (
        <Hero 
          names={config.names}
          weddingDate={config.texts?.hero_date}
          romanticQuote={config.texts?.hero_subtitle}
          heroImage={config.heroImage}
          texts={config.texts}
        />
    ),
    countdown: config.date ? (
        <div className="bg-primary/90 py-8 md:py-12">
            <Countdown targetDate={config.date} />
        </div>
    ) : null,
    carousel: (
        <PhotoCarousel images={config.carouselImages} texts={config.texts} />
    ),
    rsvp: (
        <RsvpSection onRsvpConfirmed={handleRsvpConfirmed} texts={config.texts} />
    ),
    event: showGatedContent ? (
        <EventInfo
          locationName={config.locationName}
          address={config.locationAddress}
          addressNumber={config.addressNumber}
          time={config.time}
          wazeLink={config.wazeLink}
          googleMapsLink={config.googleMapsLink}
          mapUrl={config.mapUrl}
          date={config.date}
          texts={config.texts}
        />
    ) : null,
     gifts: showGatedContent ? (
        <GiftSection 
            products={config.products} 
            pixKey={config.pixKey}
            texts={config.texts} 
        />
    ) : null,
  };

  const layoutOrder = config.layoutOrder || defaultLayoutOrder;

<<<<<<< HEAD
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
=======

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <Header texts={config.texts} names={config.names} logoUrl={config.logoUrl} />
      <main className="flex-1">
        
        {layoutOrder.map(key => components[key] ? (
            <div key={key}>{components[key]}</div>
        ) : null)}

        {!showGatedContent && (
            <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 rounded-lg shadow-inner max-w-2xl mx-auto my-12">
                <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold font-headline">{config.texts.rsvp_lock_message_title}</h3>
                <p className="mt-2 text-md text-muted-foreground">{config.texts.rsvp_lock_message_subtitle}</p>
            </div>
        )}
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d

      </main>
      <Footer names={config.names} />
    </div>
  );
}
