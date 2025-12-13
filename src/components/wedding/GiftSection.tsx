
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift } from 'lucide-react';
import type { Product } from '@/types/siteConfig';
import GiftCard from './GiftCard';

// --- COMPONENTES INTERNOS ---

const GiftSectionSkeleton = () => (
    Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <div className="w-full bg-muted animate-pulse rounded-lg aspect-[4/3]"></div>
        <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded-lg w-full mt-2"></div>
      </div>
    ))
);


// --- COMPONENTE PRINCIPAL ---

interface GiftSectionProps {
  products?: Product[];
  pixKey?: string;
  texts?: { [key: string]: string };
}

const GiftSection: React.FC<GiftSectionProps> = ({ products = [], pixKey, texts = {} }) => {
  const hasProducts = products && products.length > 0;

  return (
      <section id="gifts" className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-headline text-4xl md:text-5xl text-primary mb-4">{texts.gifts_title || 'Lista de Presentes'}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-12">
            {texts.gifts_subtitle || 'Sua presença é o nosso maior presente. Mas, se você também quiser nos mimar, criamos uma lista de presentes simbólica com muito carinho.'}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {!hasProducts 
              ? <GiftSectionSkeleton /> 
              : products.slice(0, 8).map((gift) => (
                  <GiftCard key={gift.id} gift={gift} pixKey={pixKey} />
                ))}
          </div>
          
          {hasProducts && products.length > 8 && (
            <Button asChild variant="outline" size="lg" className="mt-12">
              <Link href="/presentes">
                {texts.gifts_button || 'Ver todos os presentes'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>
  );
}

export default GiftSection;
