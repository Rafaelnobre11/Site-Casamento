'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Star } from 'lucide-react';
import type { Product } from '@/types/siteConfig';
import GiftCard from './GiftCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface GiftSectionProps {
  products?: Product[];
  pixKey?: string;
  texts?: { [key: string]: string };
}

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

export default function GiftSection({ products = [], pixKey, texts = {} }: GiftSectionProps) {
  const [showFullList, setShowFullList] = useState(false);
  const hasProducts = products && products.length > 0;

  return (
    <section id="gifts" className="py-24 px-4 bg-[#fdfaf7]">
      <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
        <div className="flex items-center justify-center gap-2 text-primary/60 mb-2">
          <Star className="h-4 w-4 fill-current" />
          <span className="uppercase tracking-[0.3em] text-xs font-bold">Mimos para os Noivos</span>
          <Star className="h-4 w-4 fill-current" />
        </div>
        <h2 className="font-headline text-4xl md:text-6xl text-primary">{texts.gifts_title || 'Lista de Presentes'}</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
          {texts.gifts_subtitle || "Sua presença é essencial, mas se quiser nos presentear, criamos esta lista com muito carinho."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {!hasProducts 
          ? <GiftSectionSkeleton /> 
          : products.slice(0, 8).map((gift) => (
              <GiftCard key={gift.id} gift={gift} pixKey={pixKey} />
            ))}
      </div>

      {hasProducts && products.length > 8 && (
        <div className="mt-16 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full border-primary text-primary hover:bg-primary hover:text-white px-10 h-14 text-lg"
            onClick={() => setShowFullList(true)}
          >
            {texts.gifts_button || 'Ver todos os presentes'} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      <Dialog open={showFullList} onOpenChange={setShowFullList}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden bg-[#fdfaf7]">
          <DialogHeader className="p-8 pb-4 text-center">
            <DialogTitle className="font-headline text-4xl text-primary">Nossa Vitrine de Desejos</DialogTitle>
            <DialogDescription className="text-lg">Escolha como participar da nossa nova história.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-8 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(gift => (
                <GiftCard key={gift.id} gift={gift} pixKey={pixKey} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}