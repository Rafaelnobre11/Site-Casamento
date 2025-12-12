
'use client';

import { MapPin, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EventInfoProps {
  locationName?: string;
  address?: string;
  time?: string;
  wazeLink?: string;
  mapUrl?: string;
}

const EventInfo: React.FC<EventInfoProps> = ({
  locationName,
  address,
  time,
  wazeLink,
  mapUrl
}) => {
  return (
    <section id="event-info" className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl text-[#C5A086]">O Grande Dia</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Todas as informações que você precisa para celebrar conosco sem preocupações.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-3 rounded-full shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{locationName || "Nome do Local"}</h3>
                <p className="text-muted-foreground">{address || "Endereço do evento"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-3 rounded-full shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Horário da Cerimônia</h3>
                <p className="text-muted-foreground">Às {time || "16:00"}</p>
              </div>
            </div>
            <Button asChild size="lg" className="w-full bg-[#C5A086] hover:bg-[#b89176] text-white">
              <a href={wazeLink} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-2 h-5 w-5" />
                Abrir no Waze
              </a>
            </Button>
          </div>
          
          <div className="lg:col-span-3 h-full min-h-[400px]">
            <Card className="overflow-hidden shadow-lg h-full w-full">
              <iframe
                src={mapUrl || ''}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventInfo;
