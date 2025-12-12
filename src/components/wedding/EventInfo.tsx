
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
  locationName = "Vila das Amoreiras",
  address = "Rua Funchal, 500 - Vila Olímpia, São Paulo - SP",
  time = "16:00",
  wazeLink = "https://www.waze.com/ul?q=Rua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo",
  mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.749033036691!2d-46.6963980844747!3d-23.57791926830578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57a6e1f0c29f%3A0x1d3a0a3a7b6c7a7e!2sRua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2004551-060!5e0!3m2!1sen!2sbr!4v1622573836063!5m2!1sen!2sbr"
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
                <h3 className="text-lg font-bold">{locationName}</h3>
                <p className="text-muted-foreground">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-3 rounded-full shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Horário da Cerimônia</h3>
                <p className="text-muted-foreground">Às {time}</p>
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
                src={mapUrl}
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
