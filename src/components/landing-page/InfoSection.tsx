import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface InfoSectionProps {
  isVisible: boolean;
  texts?: { [key: string]: string };
  date?: string;
  time?: string;
  locationName?: string;
  locationAddress?: string;
  wazeLink?: string;
  mapUrl?: string;
}

export default function InfoSection({ isVisible, texts = {}, date, time, locationName, locationAddress, wazeLink, mapUrl }: InfoSectionProps) {
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-placeholder');

  return (
    <section id="info" className={cn("w-full py-16 md:py-24 bg-background transition-opacity duration-700", isVisible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden p-0')}>
      {isVisible && (
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
            <h2 className="font-headline text-4xl md:text-5xl mb-4">{texts.info_title || 'Onde Vai Ser o Rolê'}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                {texts.info_subtitle || 'Anote tudo pra não se perder e, por favor, não atrase a noiva (mais ainda).'}
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <Card className="bg-muted/60 shadow-lg flex flex-col">
              <CardHeader>
                  <div className="space-y-8 p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 bg-white text-primary p-3 rounded-full shadow-md">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">Data</h3>
                            <p className="text-lg font-bold">{date || 'Sábado, 21 de Setembro de 2024'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 bg-white text-primary p-3 rounded-full shadow-md">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">Horário</h3>
                            <p className="text-lg font-bold">{time || 'A cerimônia começa às 16:00'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 bg-white text-primary p-3 rounded-full shadow-md">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{locationName || 'Vila das Amoreiras'}</h3>
                            <p className="text-muted-foreground text-sm">{locationAddress || 'Rua Funchal, 500 - Vila Olímpia, São Paulo - SP, 04551-060'}</p>
                        </div>
                    </div>
                </div>
              </CardHeader>
              <div className="flex-grow" />
              <Separator className="my-0" />
              <CardFooter className="p-4">
                  <Button asChild size="lg" className="w-full">
                      <a href={wazeLink || "https://www.google.com/maps/search/?api=1&query=Rua+Funchal+500+Vila+Olimpia+Sao+Paulo"} target="_blank" rel="noopener noreferrer">
                          {texts.info_button || 'Traçar Rota'}
                      </a>
                  </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden shadow-lg aspect-square lg:aspect-auto">
                <CardContent className="p-0 h-full">
                    {mapImage && (
                        <iframe
                        src={mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.749033036691!2d-46.6963980844747!3d-23.57791926830578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57a6e1f0c29f%3A0x1d3a0a3a7b6c7a7e!2sRua%20Funchal%2C%20500%20-%20Vila%20Ol%C3%ADmpia%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2004551-060!5e0!3m2!1sen!2sbr!4v1622573836063!5m2!1sen!2sbr"}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      )}
    </section>
  );
}
