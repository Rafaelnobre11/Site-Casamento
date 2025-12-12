
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { maskPhone } from '@/lib/masks';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PartyPopper, CheckCircle2, Frown, Users } from 'lucide-react';
import { getCharmingMessage, getWittyDeclineMessage } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';


const identificationSchema = z.object({
  name: z.string().min(3, { message: 'Qual é o seu nome completo, anjo?' }),
  phone: z.string().refine(value => /\(\d{2}\)\s\d{5}-\d{4}/.test(value), {
    message: "Telefone inválido. Formato esperado: (99) 99999-9999.",
  }),
});

const rsvpSchema = z.object({
  message: z.string().optional(),
});

type FormState = 'initial' | 'found' | 'loading' | 'success' | 'declined' | 'error';
type GuestInfo = { id: string; name: string; maxGuests: number };

interface RsvpFormProps {
    onRsvpConfirmed: () => void;
    texts?: { [key: string]: string };
}

const SuccessIcon = () => (
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-success-icon">
      <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
          strokeDasharray="24"
          strokeDashoffset="24"
        />
      </svg>
    </div>
  );

const DeclineIcon = () => (
    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center animate-fade-in-up">
        <Frown className="w-12 h-12 text-amber-600" />
    </div>
);


export default function RsvpForm({ onRsvpConfirmed, texts = {} }: RsvpFormProps) {
  const [formState, setFormState] = useState<FormState>('initial');
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
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

  async function handleSearch({ name, phone }: z.infer<typeof identificationSchema>) {
    if (!firestore) {
        setErrorMessage('Não foi possível conectar ao banco de dados. Tente novamente mais tarde.');
        setFormState('error');
        return;
    }

    startTransition(async () => {
      setFormState('loading');
      const numericPhone = phone.replace(/\D/g, '');
      
      try {
        const guestsRef = collection(firestore, 'guests');
        const q = query(guestsRef, where("phone", "==", numericPhone), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setErrorMessage('Convidado não encontrado. Verifique o telefone ou fale com os noivos.');
          setFormState('error');
          return;
        }

        const guestDoc = querySnapshot.docs[0];
        const guestData = guestDoc.data();

        if (guestData.name.toLowerCase() === name.toLowerCase()) {
           setGuestInfo({ id: guestDoc.id, name: guestData.name, maxGuests: guestData.maxGuests });
           setFormState('found');
        } else {
            setErrorMessage('O nome não corresponde ao telefone. Verifique os dados e tente novamente.');
            setFormState('error');
        }
      } catch (e) {
         console.error("Error finding guest in Firestore: ", e);
         setErrorMessage('Ocorreu um problema ao buscar seu convite. Tente novamente mais tarde.');
         setFormState('error');
      }
    });
  }

  function handleRsvpSubmit(values: z.infer<typeof rsvpSchema>) {
    if (!guestInfo || !firestore) return;
    startTransition(async () => {
      setFormState('loading');
      
      await setDocument(firestore, `guests/${guestInfo.id}`, {
          status: 'confirmed',
          confirmedGuests: guestInfo.maxGuests,
          message: values.message || ''
      }, { merge: true });

      const result = await getCharmingMessage({
        guestName: guestInfo.name,
        numberOfAttendees: guestInfo.maxGuests,
      });
      if (result.message) {
        setGeneratedMessage(result.message);
      }
      onRsvpConfirmed();
      setFormState('success');
    });
  }
  
  function handleDeclineSubmit() {
    if (!guestInfo || !firestore) return;
    startTransition(async () => {
        setFormState('loading');
        
        await setDocument(firestore, `guests/${guestInfo.id}`, {
            status: 'declined',
            confirmedGuests: 0,
        }, { merge: true });

        const result = await getWittyDeclineMessage({ guestName: guestInfo.name });
        if (result.message) {
            setGeneratedMessage(result.message);
        }
        setFormState('declined');
    });
  }

  const renderContent = () => {
    switch (formState) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      case 'success':
        return (
          <div className="flex flex-col items-center text-center p-4">
            <SuccessIcon />
            <h3 className="font-headline text-2xl mt-4">Nos vemos na pista!</h3>
            <p className="mt-2 text-muted-foreground">{generatedMessage}</p>
          </div>
        );
      case 'declined':
        return (
          <div className="flex flex-col items-center text-center p-4">
            <DeclineIcon />
            <h3 className="font-headline text-2xl mt-4">Que pena!</h3>
            <p className="mt-2 text-muted-foreground">{generatedMessage}</p>
          </div>
        );
    case 'error':
        return (
            <div className="flex flex-col items-center text-center p-4">
                <Frown className="w-12 h-12 text-destructive" />
                <h3 className="font-headline text-2xl mt-4">Eita!</h3>
                <p className="mt-2 text-muted-foreground">{errorMessage}</p>
                <Button onClick={() => { setFormState('initial'); idForm.reset(); }} className="mt-4">Tentar de Novo</Button>
            </div>
        );
      case 'found':
        if (!guestInfo) return null;
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">E aí, {guestInfo.name.split(' ')[0]}!</CardTitle>
              <CardDescription>Seu convite é válido para até {guestInfo.maxGuests} {guestInfo.maxGuests > 1 ? 'pessoas' : 'pessoa'}.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...rsvpForm}>
                <form onSubmit={rsvpForm.handleSubmit(handleRsvpSubmit)} className="space-y-6">
                  <div className="flex items-center justify-center gap-2 rounded-md border bg-muted p-3 text-center">
                      <Users className="h-5 w-5 text-primary" />
                      <p className="font-bold text-muted-foreground">
                          {guestInfo.maxGuests} {guestInfo.maxGuests > 1 ? 'convidados' : 'convidado'} no total
                      </p>
                  </div>
                  <FormField
                    control={rsvpForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manda um recado pra gente (opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ex: 'Finalmente!', 'Não esquece meu docinho!', etc." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button type="button" variant="outline" onClick={handleDeclineSubmit} disabled={isPending}>
                      {texts.rsvp_decline_button || 'Vou dar o cano 😔'}
                    </Button>
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {texts.rsvp_confirm_button || 'Bora Festejar! 🥳'}
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
              <CardTitle className="font-headline text-3xl md:text-4xl">{texts.rsvp_title || 'E aí, vai ou racha?'}</CardTitle>
              <CardDescription>{texts.rsvp_subtitle || 'Nosso buffet não é vidente. Confirme pra gente não pagar por quem não vem!'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...idForm}>
                <form onSubmit={idForm.handleSubmit(handleSearch)} className="space-y-4">
                  <FormField
                    control={idForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu nome completo (sem apelido, por favor)</FormLabel>
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
                        <FormLabel>Telefone (só pra te achar na lista)</FormLabel>
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
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {texts.rsvp_find_button || 'Achar meu convite'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        );
    }
  };

  return (
    <Card className={cn(
        "w-full max-w-lg bg-card text-card-foreground shadow-2xl transition-all duration-500",
        (formState === 'loading' || formState === 'success' || formState === 'declined' || formState === 'error') && "flex items-center justify-center py-16"
    )}>
      {renderContent()}
    </Card>
  );
}
