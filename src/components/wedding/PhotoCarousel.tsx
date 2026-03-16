
'use client';

import React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

interface PhotoCarouselProps {
  images?: string[];
  texts?: { [key: string]: string };
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ images = [], texts = {} }) => {
  const defaultMomentImages = PlaceHolderImages.filter((p) => p.id.startsWith('moment-')).map(p => p.imageUrl);
  const finalImages = images.length > 0 ? images : defaultMomentImages;

  const findImageDimensions = (url: string) => {
    const placeholder = PlaceHolderImages.find(p => p.imageUrl === url);
    return { width: placeholder?.width || 800, height: placeholder?.height || 800 };
  }

  return (
    <section id="carousel" className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-0 text-center">
        <div className="px-4">
            <h2 className="font-headline text-4xl md:text-5xl text-primary mb-4">{texts.carousel_title || 'Nossa História em Fotos'}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              {texts.carousel_subtitle || 'Uma pequena viagem através de momentos especiais que nos trouxeram até aqui.'}
            </p>
        </div>
        <Carousel
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {finalImages.map((imageUrl, index) => {
              const { width, height } = findImageDimensions(imageUrl);
              return (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-4/5 sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <Card className="overflow-hidden rounded-xl shadow-md border-transparent aspect-square">
                    <CardContent className="relative flex items-center justify-center p-0 h-full w-full">
                      {imageUrl && <Image
                        src={imageUrl}
                        alt={`Momento ${index + 1}`}
                        width={width}
                        height={height}
                        className="object-cover h-full w-full transition-transform duration-500 ease-in-out hover:scale-110"
                        data-ai-hint="couple smiling"
                         sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
                      />}
                       <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )})}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex left-4 text-primary bg-background/70 hover:bg-background" />
          <CarouselNext className="hidden lg:flex right-4 text-primary bg-background/70 hover:bg-background" />
        </Carousel>
      </div>
    </section>
  );
}

export default PhotoCarousel;
