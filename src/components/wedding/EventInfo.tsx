
'use client';

import { MapPin, Clock, Navigation, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EventInfoProps {
  locationName?: string;
  address?: string;
  time?: string;
  wazeLink?: string;
  googleMapsLink?: string;
  mapUrl?: string;
  date?: string; 
  texts?: { [key: string]: string };
}

const EventInfo: React.FC<EventInfoProps> = ({
  locationName,
  address,
  time,
  wazeLink,
  googleMapsLink,
  mapUrl,
  date,
  texts = {},
}) => {

  const formattedDate = date 
    ? new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : "Data do evento";

  return (
    <section id="event-info" className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl text-primary">{texts.info_title || 'O Grande Dia'}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            {texts.info_subtitle || 'Todas as informações que você precisa para celebrar conosco sem preocupações.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-2 space-y-8 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
              <div className="flex-shrink-0 bg-muted text-primary p-3 rounded-full shadow-sm">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-headline">Data</h3>
                <p className="text-muted-foreground capitalize">{formattedDate}</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
              <div className="flex-shrink-0 bg-muted text-primary p-3 rounded-full shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-headline">Horário</h3>
                <p className="text-muted-foreground">Às {time || "16:00"}</p>
              </div>
            </div>
             <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
              <div className="flex-shrink-0 bg-muted text-primary p-3 rounded-full shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-headline">Local</h3>
                <p className="text-muted-foreground">{locationName || "Nome do Local"}</p>
                <p className="text-sm text-gray-500">{address || "Endereço do evento"}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="w-full max-w-xs mx-auto lg:mx-0">
                  <Navigation className="mr-2 h-5 w-5" />
                  {texts.info_button || 'Como Chegar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={wazeLink} target="_blank" rel="noopener noreferrer">Abrir no Waze</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
          
          <div className="lg:col-span-3 w-full">
            {mapUrl && (
              <Card className="overflow-hidden shadow-lg w-full aspect-[4/3] lg:aspect-video rounded-xl border-border/50">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventInfo;
