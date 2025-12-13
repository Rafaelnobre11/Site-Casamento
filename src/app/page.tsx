
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

  // Define default config with witty texts
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
    isContentLocked: true, // Default to locked
  };

  // Merge siteConfig with defaultConfig, ensuring texts are merged deeply
  const config: SiteConfig = {
    ...defaultConfig,
    ...siteConfig,
    texts: {
      ...defaultConfig.texts,
      ...(siteConfig?.texts || {}),
    },
  };
  
  const isContentLocked = config.isContentLocked;
  const showGatedContent = isRsvpConfirmed || !isContentLocked;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <Header texts={config.texts} names={config.names} logoUrl={config.logoUrl} />
      <main className="flex-1">
        <Hero 
          names={config.names}
          weddingDate={config.texts?.hero_date}
          romanticQuote={config.texts?.hero_subtitle}
          heroImage={config.heroImage}
          texts={config.texts}
        />
        
        {config.date && (
            <div className="bg-primary/90 py-8 md:py-12">
                <Countdown targetDate={config.date} />
            </div>
        )}

        <PhotoCarousel images={config.carouselImages} texts={config.texts} />

        <RsvpSection onRsvpConfirmed={handleRsvpConfirmed} texts={config.texts} />
        
        {showGatedContent ? (
            <>
                <EventInfo
                  locationName={config.locationName}
                  address={config.locationAddress}
                  time={config.time}
                  wazeLink={config.wazeLink}
                  mapUrl={config.mapUrl}
                  date={config.date}
                  texts={config.texts}
                />
                <GiftSection 
                    products={config.products} 
                    pixKey={config.pixKey}
                    texts={config.texts} 
                />
            </>
        ) : (
            <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 rounded-lg shadow-inner max-w-2xl mx-auto my-12">
                <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold font-headline">{config.texts.rsvp_lock_message_title}</h3>
                <p className="mt-2 text-md text-muted-foreground">{config.texts.rsvp_lock_message_subtitle}</p>
            </div>
        )}

      </main>
      <Footer names={config.names} />
    </div>
  );
}
