
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/landing-page/Header';
import Hero from '@/components/landing-page/Hero';
import MomentsCarousel from '@/components/landing-page/MomentsCarousel';
import RsvpSection from '@/components/landing-page/RsvpSection';
import InfoSection from '@/components/landing-page/InfoSection';
import GiftSection from '@/components/landing-page/GiftSection';
import Footer from '@/components/landing-page/Footer';
import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig } from '@/types/siteConfig';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const componentMap: { [key: string]: React.ComponentType<any> } = {
  hero: Hero,
  moments: MomentsCarousel,
  rsvp: RsvpSection,
  info: InfoSection,
  gifts: GiftSection,
};

export default function Home() {
  const [isRsvpConfirmed, setIsRsvpConfirmed] = useState(false);
  const { data: config, loading: loadingConfig } = useDoc<SiteConfig>('config/site');

  useEffect(() => {
    // Check local storage to persist confirmation state across reloads
    if (localStorage.getItem('rsvpConfirmed') === 'true') {
      setIsRsvpConfirmed(true);
    }
  }, []);

  const handleRsvpConfirmed = () => {
    setIsRsvpConfirmed(true);
    localStorage.setItem('rsvpConfirmed', 'true');
  };

  if (loadingConfig) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const texts = config?.texts || {};
  const isSiteLocked = config?.isContentLocked ?? true;
  const layoutOrder = config?.layoutOrder || ['hero', 'moments', 'rsvp', 'info', 'gifts'];
  const showContent = !isSiteLocked || isRsvpConfirmed;
  
  const getComponentProps = (key: string) => {
    const props: { [key: string]: any } = { 
        texts: config?.texts, 
        names: config?.names, 
        heroImage: config?.heroImage, 
        carouselImages: config?.carouselImages 
    };

    switch (key) {
      case 'rsvp':
        return { ...props, onRsvpConfirmed: handleRsvpConfirmed };
      case 'info':
         return { ...props, isVisible: true, locationName: config?.locationName, locationAddress: config?.locationAddress, date: config?.date, time: config?.time, wazeLink: config?.wazeLink, mapUrl: config?.mapUrl };
      case 'gifts':
         return { ...props, products: config?.products, pixKey: config?.pixKey };
      default:
        return props;
    }
  };
  
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header texts={config?.texts} names={config?.names} logoUrl={config?.logoUrl}/>
      <main className="flex-1">
        {layoutOrder.map(key => {
          const Component = componentMap[key];
          if (!Component) return null;

          // These sections are always visible
          if (key === 'hero' || key === 'moments' || key === 'rsvp') {
            return <Component key={key} {...getComponentProps(key)} />;
          }
          
          if (key === 'gifts') {
            if (showContent) {
              return <Component key={key} {...getComponentProps(key)} />;
            }
            return null;
          }

          return null;
        })}

        <div className="relative">
            {isSiteLocked && !showContent && (
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 p-4">
                    <div className="text-center p-8 rounded-lg bg-background/80 backdrop-blur-sm shadow-2xl border border-border max-w-lg">
                        <p className="mb-2 font-headline text-2xl text-foreground">
                            {texts.rsvp_lock_message_title || "🤫 Segredo, hein?"}
                        </p>
                        <p className="max-w-md text-muted-foreground">
                            {texts.rsvp_lock_message_subtitle || "Calma, curioso! Primeiro diz que vai, depois a gente te mostra onde é a festa e como nos ajudar a ficar menos duros."}
                        </p>
                    </div>
                 </div>
            )}
             <div className={cn(isSiteLocked && !showContent && 'blur-lg pointer-events-none select-none overflow-hidden')}>
                {layoutOrder.map(key => {
                    const Component = componentMap[key];
                    // Only render sections that are meant to be hidden here
                    if (!Component || ['hero', 'moments', 'rsvp', 'gifts'].includes(key)) return null;

                    return <Component key={key} {...getComponentProps(key)} isVisible={true} />;
                })}
             </div>
        </div>

      </main>
      <Footer texts={config?.texts} names={config?.names}/>
    </div>
  );
}
