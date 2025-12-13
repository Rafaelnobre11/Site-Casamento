
'use client';

import { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { maskPhone } from '@/lib/masks';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Frown, Users, Check, PartyPopper } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const identificationSchema = z.object({
  name: z.string().min(3, { message: 'Por favor, insira o seu nome completo.' }),
  phone: z.string().refine(value => /\(\d{2}\)\s\d{5}-\d{4}/.test(value), {
    message: "Telefone inválido. Formato: (99) 99999-9999.",
  }),
});

const rsvpSchema = z.object({
  message: z.string().optional(),
  confirmedGuests: z.coerce.number().min(1, "Selecione o número de convidados."),
  additionalGuests: z.array(z.object({
    name: z.string().min(3, 'Nome do convidado adicional é obrigatório.'),
    age: z.coerce.number().positive("Idade deve ser um número positivo.").optional(),
  })).optional(),
});

type FormStage = 'initial' | 'found' | 'loading' | 'success' | 'declined' | 'error';
type GuestInfo = { id: string; name: string; maxGuests: number };

interface RsvpSectionProps {
  onRsvpConfirmed: () => void;
  texts?: { [key: string]: string };
}

const SuccessIcon = () => (
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-success-icon">
      <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeDasharray="24" strokeDashoffset="24" />
      </svg>
    </div>
);

const RsvpSection: React.FC<RsvpSectionProps> = ({ onRsvpConfirmed, texts = {} }) => {
  const [stage, setStage] = useState<FormStage>('initial');
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const { firestore } = useFirebase();

  const idForm = useForm<z.infer<typeof identificationSchema>>({
    resolver: zodResolver(identificationSchema),
    defaultValues: { name: '', phone: '' },
  });

  const rsvpForm = useForm<z.infer<typeof rsvpSchema>>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { message: '', confirmedGuests: 1, additionalGuests: [] },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: rsvpForm.control,
    name: "additionalGuests",
  });

  const confirmedGuestsValue = rsvpForm.watch('confirmedGuests');

  async function handleSearchGuest({ name, phone }: z.infer<typeof identificationSchema>) {
    if (!firestore) {
      setErrorMessage('Erro de conexão. Tente novamente mais tarde.');
      setStage('error');
      return;
    }

    startTransition(async () => {
      setStage('loading');
      const numericPhone = phone.replace(/\D/g, '');
      
      try {
        const guestsRef = collection(firestore, 'guests');
        const q = query(guestsRef, where("phone", "==", numericPhone), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setErrorMessage('Convidado não encontrado. Verifique os dados ou fale com os noivos.');
          setStage('error');
          return;
        }

        const guestDoc = querySnapshot.docs[0];
        const guestData = guestDoc.data();
        
        const dbFirstName = guestData.name.split(' ')[0].toLowerCase();
        const inputFirstName = name.split(' ')[0].toLowerCase();

        if (dbFirstName === inputFirstName) {
           setGuestInfo({ id: guestDoc.id, name: guestData.name, maxGuests: guestData.maxGuests });
           rsvpForm.reset({ confirmedGuests: guestData.maxGuests, message: '', additionalGuests: [] });
           setStage('found');
        } else {
            setErrorMessage('O nome não corresponde ao telefone na nossa lista. Verifique os dados.');
            setStage('error');
        }
      } catch (e) {
         console.error("Error finding guest:", e);
         setErrorMessage('Ocorreu um problema ao buscar seu convite. Tente novamente.');
         setStage('error');
      }
    });
  }

  async function handleRsvpSubmit(values: z.infer<typeof rsvpSchema>, willAttend: boolean) {
    if (!guestInfo || !firestore) return;
    startTransition(async () => {
      setStage('loading');
      
      const rsvpData = {
        status: willAttend ? 'confirmed' : 'declined',
        confirmedGuests: willAttend ? values.confirmedGuests : 0,
        message: values.message || '',
        additionalGuests: values.additionalGuests || [],
      };

      await setDocument(firestore, `guests/${guestInfo.id}`, rsvpData, { merge: true });

      if (willAttend) {
        onRsvpConfirmed();
        setStage('success');
      } else {
        setStage('declined');
      }
    });
  }
  
  const renderContent = () => {
    if (isPending || stage === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[350px]">
          <Loader2 className="h-12 w-12 animate-spin text-[#C5A086]" />
        </div>
      );
    }

    switch (stage) {
      case 'success':
        return (
          <div className="flex flex-col items-center text-center p-6 md:p-8 space-y-4 min-h-[350px] justify-center">
            <SuccessIcon />
            <h3 className="font-headline text-2xl text-[#C5A086] mt-4">Presença Confirmada!</h3>
            <p className="text-muted-foreground">Mal podemos esperar para celebrar com você. Obrigado!</p>
            <Button 
              onClick={() => {
                const giftSection = document.getElementById('gifts');
                if (giftSection) {
                  giftSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="mt-4 bg-transparent text-[#C5A086] hover:bg-amber-50 border border-[#C5A086]"
            >
              Ver Lista de Presentes
            </Button>
          </div>
        );
      case 'declined':
        return (
          <div className="flex flex-col items-center text-center p-6 md:p-8 space-y-4 min-h-[350px] justify-center">
            <Frown className="w-16 h-16 text-amber-500" />
            <h3 className="font-headline text-2xl text-[#C5A086] mt-4">Que pena!</h3>
            <p className="text-muted-foreground">Sentiremos sua falta, mas agradecemos por nos avisar.</p>
          </div>
        );
      case 'error':
        return (
            <div className="flex flex-col items-center text-center p-6 md:p-8 space-y-4 min-h-[350px] justify-center">
                <Frown className="w-16 h-16 text-destructive" />
                <h3 className="font-headline text-2xl text-destructive mt-4">Ops! Algo deu errado.</h3>
                <p className="text-muted-foreground">{errorMessage}</p>
                <Button onClick={() => { setStage('initial'); idForm.reset(); }} className="mt-4 bg-[#C5A086] hover:bg-[#b89176] text-white">Tentar Novamente</Button>
            </div>
        );
      case 'found':
        return (
          <>
            <CardHeader className="text-center px-4 pt-6 md:px-6 md:pt-8">
              <CardTitle className="font-headline text-2xl md:text-3xl text-[#C5A086]">Olá, {guestInfo?.name.split(' ')[0]}!</CardTitle>
              <CardDescription>Seu convite é válido para até {guestInfo?.maxGuests} {guestInfo?.maxGuests === 1 ? 'pessoa' : 'pessoas'}.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 md:px-6 md:pb-8">
              <Form {...rsvpForm}>
                <form className="space-y-6">
                  {guestInfo && guestInfo.maxGuests > 1 && (
                     <FormField
                        control={rsvpForm.control}
                        name="confirmedGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantas pessoas irão?</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(parseInt(value));
                                const count = parseInt(value);
                                // Adjust additional guests fields based on selection
                                const diff = count > 1 ? count - 1 - fields.length : -fields.length;
                                if (diff > 0) {
                                    for (let i = 0; i < diff; i++) append({ name: '', age: undefined });
                                } else if (diff < 0) {
                                    for (let i = 0; i < -diff; i++) remove(fields.length - 1 - i);
                                }
                            }} defaultValue={String(field.value)}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {Array.from({ length: guestInfo.maxGuests }, (_, i) => i + 1).map(num => (
                                        <SelectItem key={num} value={String(num)}>{num} {num === 1 ? 'pessoa' : 'pessoas'}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}

                  {confirmedGuestsValue > 1 && (
                     <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-medium">Confirme os acompanhantes:</h4>
                        {fields.map((field, index) => (
                             <div key={field.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                                <FormField
                                    control={rsvpForm.control}
                                    name={`additionalGuests.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-3">
                                            <FormLabel className="sr-only">Nome do Acompanhante</FormLabel>
                                            <FormControl><Input placeholder={`Nome do acompanhante ${index + 1}`} {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={rsvpForm.control}
                                    name={`additionalGuests.${index}.age`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                             <FormLabel className="sr-only">Idade</FormLabel>
                                             <FormControl><Input type="number" placeholder="Idade (opcional)" {...field} /></FormControl>
                                             <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                     </div>
                  )}
                  
                  <FormField
                    control={rsvpForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deixe um recado para os noivos (opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Mal posso esperar pela festa! ❤️" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col-reverse sm:grid sm:grid-cols-2 gap-4">
                    <Button type="button" variant="outline" onClick={rsvpForm.handleSubmit(v => handleRsvpSubmit(v, false))} disabled={isPending}>
                       {texts.rsvp_decline_button || 'Não poderei comparecer'}
                    </Button>
                    <Button type="button" className="w-full bg-[#C5A086] hover:bg-[#b89176] text-white" onClick={rsvpForm.handleSubmit(v => handleRsvpSubmit(v, true))} disabled={isPending}>
                      <PartyPopper className="mr-2"/>{texts.rsvp_confirm_button || 'Sim, eu vou!'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </>
        );
      case 'initial':
      default:
        return (
          <>
            <CardHeader className="text-center px-4 pt-6 md:px-6 md:pt-8">
              <CardTitle className="font-headline text-3xl md:text-4xl text-[#C5A086]">{texts.rsvp_title || 'Confirme sua Presença'}</CardTitle>
              <CardDescription>{texts.rsvp_subtitle || 'Por favor, preencha seus dados para encontrarmos seu convite.'}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 md:px-6 md:pb-8">
              <Form {...idForm}>
                <form onSubmit={idForm.handleSubmit(handleSearchGuest)} className="space-y-4">
                  <FormField
                    control={idForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome igual ao do convite" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={idForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu telefone</FormLabel>
                        <FormControl>
                           <Input
                                placeholder="(99) 99999-9999"
                                {...field}
                                onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                maxLength={15}
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-[#C5A086] hover:bg-[#b89176] text-white" disabled={isPending}>
                    <Check className="mr-2"/>
                    {texts.rsvp_find_button || 'Buscar meu Convite'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        );
    }
  };

  return (
    <section id="rsvp" className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto max-w-lg px-4">
        <Card className="shadow-2xl border-[#EAE2DA] bg-[#FBF9F6]">
            {renderContent()}
        </Card>
      </div>
    </section>
  );
};

export default RsvpSection;
