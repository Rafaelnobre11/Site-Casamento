'use client';

import { MapPin, Clock, Navigation, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EventInfoProps {
  locationName?: string;
  address?: string;
  time?: string;
  wazeLink?: string;
  mapUrl?: string;
  date?: string;
  isLocked?: boolean;
}

const EventInfo: React.FC<EventInfoProps> = ({
  locationName,
  address,
  time,
  wazeLink,
  mapUrl,
  date,
  isLocked = false,
}) => {

  const formattedDate = date 
    ? new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : "Data do evento";

  return (
    <section id="event" className="relative w-full py-20 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-6xl text-[#C5A086] mb-4">O Grande Dia</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg italic">
            "Onde o nosso 'felizes para sempre' ganha o seu primeiro capítulo."
          </p>
        </div>

        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-1000",
          isLocked && "filter blur-lg select-none pointer-events-none scale-[0.98]"
        )}>
          {/* Coluna de Detalhes Textuais */}
          <div className="lg:col-span-5 space-y-10">
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-4 rounded-2xl shadow-sm group-hover:bg-[#C5A086] group-hover:text-white transition-colors duration-500">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm uppercase tracking-widest font-bold text-gray-400">Data</h3>
                <p className="text-xl md:text-2xl font-headline text-gray-800 capitalize">{formattedDate}</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-4 rounded-2xl shadow-sm group-hover:bg-[#C5A086] group-hover:text-white transition-colors duration-500">
                <Clock className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm uppercase tracking-widest font-bold text-gray-400">Horário</h3>
                <p className="text-xl md:text-2xl font-headline text-gray-800">Às {time || "16:00"}</p>
              </div>
            </div>

             <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-4 rounded-2xl shadow-sm group-hover:bg-[#C5A086] group-hover:text-white transition-colors duration-500">
                <MapPin className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm uppercase tracking-widest font-bold text-gray-400">Local</h3>
                <p className="text-xl md:text-2xl font-headline text-gray-800">{locationName || "Local do Evento"}</p>
                <p className="text-gray-500 leading-relaxed">{address || "Endereço em processamento..."}</p>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild size="lg" className="rounded-full px-10 h-14 bg-[#C5A086] hover:bg-[#b89176] text-white shadow-xl hover:shadow-2xl transition-all">
                <a href={wazeLink} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-2 h-5 w-5 animate-pulse" />
                  Abrir no GPS
                </a>
              </Button>
            </div>
          </div>
          
          {/* Coluna do Mapa */}
          <div className="lg:col-span-7 w-full">
            <Card className="overflow-hidden border-none shadow-2xl w-full aspect-square md:aspect-video rounded-[2rem] bg-[#FBF9F6]">
              {mapUrl ? (
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <MapPin className="h-12 w-12 text-gray-200" />
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Overlay de Bloqueio (Glassmorphism) */}
        {isLocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="bg-white/40 backdrop-blur-md border border-white/50 p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center space-y-6 animate-fade-in-up">
              <div className="mx-auto w-20 h-20 bg-[#C5A086]/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-[#C5A086]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-3xl text-gray-800">Shhh... É Segredo!</h3>
                <p className="text-gray-600 leading-relaxed">
                  Os detalhes do local e o mapa são exclusivos para convidados confirmados. 
                  <br className="hidden md:block" />
                  Confirme sua presença abaixo para liberar o acesso.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full border-[#C5A086] text-[#C5A086] hover:bg-[#C5A086] hover:text-white transition-all px-8 pointer-events-auto cursor-pointer"
                onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Confirmar Minha Presença
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventInfo;
