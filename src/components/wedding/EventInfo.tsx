'use client';

import { MapPin, Clock, Navigation, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
<<<<<<< HEAD
import { cn } from '@/lib/utils';
=======
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d

interface EventInfoProps {
  locationName?: string;
  address?: string;
  addressNumber?: string;
  time?: string;
  wazeLink?: string;
  googleMapsLink?: string;
  mapUrl?: string;
<<<<<<< HEAD
  date?: string;
  isLocked?: boolean;
=======
  date?: string; 
  texts?: { [key: string]: string };
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
}

const EventInfo: React.FC<EventInfoProps> = ({
  locationName,
  address,
  addressNumber,
  time,
  wazeLink,
  googleMapsLink,
  mapUrl,
  date,
<<<<<<< HEAD
  isLocked = false,
=======
  texts = {},
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
}) => {

  const formattedDate = date 
    ? new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : "Data do evento";
    
  const fullAddress = addressNumber ? `${address}, ${addressNumber}` : address;

  return (
<<<<<<< HEAD
    <section id="event" className="relative w-full py-20 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-6xl text-[#C5A086] mb-4">O Grande Dia</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg italic">
            "Onde o nosso 'felizes para sempre' ganha o seu primeiro capítulo."
          </p>
        </div>

        <div className="relative">
            {/* Conteúdo da Seção */}
            <div className={cn(
                "grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-700",
                isLocked && "filter blur-2xl grayscale opacity-50 select-none pointer-events-none"
            )}>
                {/* Coluna de Detalhes Textuais */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="flex gap-6 items-start group">
                        <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-4 rounded-2xl shadow-sm">
                            <Calendar className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm uppercase tracking-widest font-bold text-gray-400">Data</h3>
                            <p className="text-xl md:text-2xl font-headline text-gray-800 capitalize">{formattedDate}</p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start group">
                        <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-4 rounded-2xl shadow-sm">
                            <Clock className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm uppercase tracking-widest font-bold text-gray-400">Horário</h3>
                            <p className="text-xl md:text-2xl font-headline text-gray-800">Às {time || "16:00"}</p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start group">
                        <div className="flex-shrink-0 bg-[#FBF9F6] text-[#C5A086] p-4 rounded-2xl shadow-sm">
                            <MapPin className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm uppercase tracking-widest font-bold text-gray-400">Local</h3>
                            <p className="text-xl md:text-2xl font-headline text-gray-800">{locationName}</p>
                            <p className="text-gray-500 leading-relaxed">{address}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button asChild size="lg" className="rounded-full px-10 h-14 bg-[#C5A086] hover:bg-[#b89176] text-white shadow-xl">
                            <a href={wazeLink} target="_blank" rel="noopener noreferrer">
                                <Navigation className="mr-2 h-5 w-5" />
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

            {/* Camada de Bloqueio Real */}
            {isLocked && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-xl w-full text-center space-y-8 animate-fade-in-up">
                        <div className="mx-auto w-24 h-24 bg-[#C5A086]/20 rounded-full flex items-center justify-center">
                            <Lock className="h-10 w-10 text-[#C5A086]" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-headline text-4xl text-gray-800">Shhh... É Segredo!</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Os detalhes do local e o mapa são exclusivos para convidados confirmados. 
                                <br className="hidden md:block" />
                                <strong>Confirme sua presença</strong> para liberar o acesso.
                            </p>
                        </div>
                        <Button 
                            variant="default" 
                            size="lg" 
                            className="rounded-full bg-[#C5A086] text-white hover:bg-[#b89176] transition-all px-12 h-16 text-lg pointer-events-auto shadow-lg"
                            onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Confirmar Minha Presença
                        </Button>
                    </div>
                </div>
=======
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
                <p className="text-sm text-gray-500">{fullAddress || "Endereço do evento"}</p>
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
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
            )}
        </div>
      </div>
    </section>
  );
};

export default EventInfo;
