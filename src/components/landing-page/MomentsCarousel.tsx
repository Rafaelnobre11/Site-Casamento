'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MomentsCarouselProps {
  texts?: { [key: string]: string };
  carouselImages?: string[];
}

export default function MomentsCarousel({ texts = {}, carouselImages }: MomentsCarouselProps) {
  const defaultMomentImages = PlaceHolderImages.filter((p) => p.id.startsWith('moment-'));
  const images = carouselImages && carouselImages.length > 0 ? carouselImages.map((url, i) => ({ id: `moment-${i}`, imageUrl: url, description: `Moment ${i}`, imageHint: '' })) : defaultMomentImages;

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, []);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  useEffect(() => {
    if (!api) {
      return;
    }
    onSelect(api);
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <section id="moments" className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h2 className="font-headline text-4xl md:text-5xl mb-4">{texts.moments_title || 'Nossos Momentos'}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          {texts.moments_subtitle || 'Uma pequena viagem através da nossa história de amor, capturada em momentos que guardaremos para sempre.'}
        </p>
        <Carousel
          setApi={setApi}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {images.map((image, index) => (
              <CarouselItem key={image.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <CardContent className="relative flex aspect-[4/3] items-center justify-center p-0">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                        data-ai-hint={image.imageHint}
                      />
                       <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        <div className="flex justify-center gap-2 mt-8">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  'h-2 w-2 rounded-full bg-border transition-all',
                  current === index ? 'w-4 bg-primary' : 'hover:bg-muted-foreground'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
      </div>
    </section>
  );
}
