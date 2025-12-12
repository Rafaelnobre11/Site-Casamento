
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import RsvpForm from './RsvpForm';
import { cn } from '@/lib/utils';

interface RsvpSectionProps {
    onRsvpConfirmed: () => void;
    texts?: { [key: string]: string };
}

export default function RsvpSection({ onRsvpConfirmed, texts = {} }: RsvpSectionProps) {
  const rsvpBgImage = PlaceHolderImages.find((p) => p.id === 'rsvp-bg');

  return (
    <section id="rsvp" className="relative w-full py-20 md:py-32 bg-fixed bg-cover bg-center">
      {rsvpBgImage && (
        <Image
          src={rsvpBgImage.imageUrl}
          alt={rsvpBgImage.description}
          fill
          className="object-cover"
          data-ai-hint={rsvpBgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gray-900/70" />
      <div className="relative container mx-auto max-w-7xl px-4 flex flex-col items-center">
         <RsvpForm onRsvpConfirmed={onRsvpConfirmed} texts={texts} />
      </div>
    </section>
  );
}
