
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { maskPhone } from '@/lib/masks';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Frown, Users, Check, PartyPopper } from 'lucide-react';
import { useFirestore } from '@/firebase';
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
});

type FormStage = 'initial' | 'found' | 'loading' | 'success' | 'declined' | 'error';
type GuestInfo = { id: string; name: string; maxGuests: number };

interface RsvpSectionProps {
  onRsvpConfirmed: () => void;
}

const SuccessIcon = () => (
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-success-icon">
      <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeDasharray="24" strokeDashoffset="24" />
      </svg>
    </div>
);

const RsvpSection: React.FC<RsvpSectionProps> = ({ onRsvpConfirmed }) => {
  const [stage, setStage] = useState<FormStage>('initial');
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const firestore = useFirestore();

  const idForm = useForm<z.infer<typeof identificationSchema>>({
    resolver: zodResolver(identificationSchema),
    defaultValues: { name: '', phone: '' },
  });

  const rsvpForm = useForm<z.infer<typeof rsvpSchema>>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { message: '' },
  });

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
        
        // Basic name check (first name)
        const dbFirstName = guestData.name.split(' ')[0].toLowerCase();
        const inputFirstName = name.split(' ')[0].toLowerCase();

        if (dbFirstName === inputFirstName) {
           setGuestInfo({ id: guestDoc.id, name: guestData.name, maxGuests: guestData.maxGuests });
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
        confirmedGuests: willAttend ? guestInfo.maxGuests : 0,
        message: values.message || ''
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
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-[#C5A086]" />
        </div>
      );
    }

    switch (stage) {
      case 'success':
        return (
          <div className="flex flex-col items-center text-center p-8 space-y-4 min-h-[300px] justify-center">
            <SuccessIcon />
            <h3 className="font-headline text-2xl text-[#C5A086] mt-4">Presença Confirmada!</h3>
            <p className="text-muted-foreground">Mal podemos esperar para celebrar com você. Obrigado!</p>
          </div>
        );
      case 'declined':
        return (
          <div className="flex flex-col items-center text-center p-8 space-y-4 min-h-[300px] justify-center">
            <Frown className="w-16 h-16 text-amber-500" />
            <h3 className="font-headline text-2xl text-[#C5A086] mt-4">Que pena!</h3>
            <p className="text-muted-foreground">Sentiremos sua falta, mas agradecemos por nos avisar.</p>
          </div>
        );
      case 'error':
        return (
            <div className="flex flex-col items-center text-center p-8 space-y-4 min-h-[300px] justify-center">
                <Frown className="w-16 h-16 text-destructive" />
                <h3 className="font-headline text-2xl text-destructive mt-4">Ops! Algo deu errado.</h3>
                <p className="text-muted-foreground">{errorMessage}</p>
                <Button onClick={() => { setStage('initial'); idForm.reset(); }} className="mt-4 bg-[#C5A086] hover:bg-[#b89176] text-white">Tentar Novamente</Button>
            </div>
        );
      case 'found':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl text-[#C5A086]">Olá, {guestInfo?.name.split(' ')[0]}!</CardTitle>
              <CardDescription>Seu convite é válido para até {guestInfo?.maxGuests} {guestInfo?.maxGuests === 1 ? 'pessoa' : 'pessoas'}.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...rsvpForm}>
                <form className="space-y-6">
                  <div className="flex items-center justify-center gap-2 rounded-md border bg-muted p-3 text-center">
                      <Users className="h-5 w-5 text-[#C5A086]" />
                      <p className="font-bold text-muted-foreground">
                          Confirmando para {guestInfo?.maxGuests} {guestInfo?.maxGuests === 1 ? 'convidado' : 'convidados'}
                      </p>
                  </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button type="button" variant="outline" onClick={rsvpForm.handleSubmit(v => handleRsvpSubmit(v, false))} disabled={isPending}>
                       Não poderei comparecer
                    </Button>
                    <Button type="button" className="w-full bg-[#C5A086] hover:bg-[#b89176] text-white" onClick={rsvpForm.handleSubmit(v => handleRsvpSubmit(v, true))} disabled={isPending}>
                      <PartyPopper className="mr-2"/> Sim, eu vou!
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
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl md:text-4xl text-[#C5A086]">Confirme sua Presença</CardTitle>
              <CardDescription>Por favor, preencha seus dados para encontrarmos seu convite.</CardDescription>
            </CardHeader>
            <CardContent>
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
                    Buscar meu Convite
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
