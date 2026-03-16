
'use client';

<<<<<<< HEAD
import { useState, useTransition, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
=======
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { maskPhone } from '@/lib/masks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
<<<<<<< HEAD
import { Loader2, Check, UserCheck, UserX, ArrowRight, ArrowLeft, Heart, PartyPopper, Users, UserPlus } from 'lucide-react';
=======
import { Loader2, Frown, PartyPopper, Check } from 'lucide-react';
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getCharmingMessage, getWittyDeclineMessage } from '@/app/actions';
<<<<<<< HEAD
import { cn } from '@/lib/utils';
=======
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d

const identifySchema = z.object({
  name: z.string().min(3, "Por favor, informe seu nome como está no convite."),
  phone: z.string().min(10, "Telefone inválido."),
});

const confirmSchema = z.object({
  status: z.enum(['confirmed', 'declined']),
  confirmedGuests: z.coerce.number().min(0),
  message: z.string().optional(),
<<<<<<< HEAD
  attendees: z.array(z.object({
    name: z.string().min(2, "Informe o nome completo"),
  })).optional(),
=======
  confirmedGuests: z.coerce.number().min(1, "Selecione o número de convidados."),
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
});

type Step = 'IDENTIFY' | 'CONFIRM' | 'SUCCESS';
type GuestData = { id: string; name: string; maxGuests: number; status: string; confirmedGuests: number; phone: string; attendeeNames?: string[] };

<<<<<<< HEAD
export default function RsvpSection({ onRsvpConfirmed }: { onRsvpConfirmed: (guestId: string) => void }) {
  const [step, setStep] = useState<Step>('IDENTIFY');
  const [guest, setGuest] = useState<GuestData | null>(null);
=======
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
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
  const [isPending, startTransition] = useTransition();
  const [aiMessage, setAiMessage] = useState('');
  const { firestore } = useFirebase();

  const identifyForm = useForm<z.infer<typeof identifySchema>>({
    resolver: zodResolver(identifySchema),
    defaultValues: { name: '', phone: '' },
  });

<<<<<<< HEAD
  const confirmForm = useForm<z.infer<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { status: 'confirmed', confirmedGuests: 1, message: '', attendees: [] },
  });

  const { fields, replace } = useFieldArray({
    control: confirmForm.control,
    name: "attendees"
=======
  const rsvpForm = useForm<z.infer<typeof rsvpSchema>>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { message: '', confirmedGuests: 1 },
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
  });

  const watchStatus = confirmForm.watch('status');
  const watchCount = confirmForm.watch('confirmedGuests');

  // Atualiza os campos de nome quando a quantidade de pessoas muda
  useEffect(() => {
    if (watchStatus === 'confirmed' && guest) {
      const currentAttendees = confirmForm.getValues('attendees') || [];
      const newAttendees = Array.from({ length: watchCount }, (_, i) => {
        if (i === 0) return { name: guest.name }; // O primeiro é sempre o titular
        return currentAttendees[i] || { name: '' };
      });
      replace(newAttendees);
    }
  }, [watchCount, watchStatus, guest, replace, confirmForm]);

  async function onIdentify(values: z.infer<typeof identifySchema>) {
    if (!firestore) return;
    
    startTransition(async () => {
      const normalizedPhone = values.phone.replace(/\D/g, '');
      const guestsRef = collection(firestore, 'guests');
      const q = query(guestsRef, where("phone", "==", normalizedPhone), limit(1));
      const snap = await getDocs(q);

<<<<<<< HEAD
      if (snap.empty) {
        identifyForm.setError('name', { message: "Não encontramos seu convite. Verifique o nome e telefone." });
        return;
=======
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
           rsvpForm.reset({ confirmedGuests: guestData.maxGuests, message: '' });
           setStage('found');
        } else {
            setErrorMessage('O nome não corresponde ao telefone na nossa lista. Verifique os dados.');
            setStage('error');
        }
      } catch (e) {
         console.error("Error finding guest:", e);
         setErrorMessage('Ocorreu um problema ao buscar seu convite. Tente novamente.');
         setStage('error');
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
      }

      const doc = snap.docs[0];
      const data = doc.data() as GuestData;
      
      const dbFirstName = data.name.split(' ')[0].toLowerCase();
      const inputFirstName = values.name.split(' ')[0].toLowerCase();

      if (dbFirstName !== inputFirstName && !data.name.toLowerCase().includes(values.name.toLowerCase())) {
        identifyForm.setError('name', { message: "O nome não coincide com este telefone." });
        return;
      }

      setGuest({ id: doc.id, ...data });
      confirmForm.reset({ 
        status: data.status === 'declined' ? 'declined' : 'confirmed', 
        confirmedGuests: data.confirmedGuests || data.maxGuests,
        message: data.message || '',
        attendees: []
      });
      setStep('CONFIRM');
    });
  }

  async function onConfirm(values: z.infer<typeof confirmSchema>) {
    if (!guest || !firestore) return;

    startTransition(async () => {
      const isAttending = values.status === 'confirmed';
      
      // Extrai apenas os nomes do array de objetos
      const attendeeNames = isAttending 
        ? (values.attendees?.map(a => a.name) || [guest.name])
        : [];

      const updateData = {
        status: values.status,
        confirmedGuests: isAttending ? values.confirmedGuests : 0,
        attendeeNames: attendeeNames,
        message: values.message || '',
<<<<<<< HEAD
        updatedAt: new Date().toISOString(),
        confirmedAt: isAttending ? (guest.status === 'confirmed' ? (guest as any).confirmedAt : new Date().toISOString()) : null
=======
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
      };

      await setDocument(firestore, `guests/${guest.id}`, updateData, { merge: true });

<<<<<<< HEAD
      try {
        const result = isAttending 
          ? await getCharmingMessage({ guestName: guest.name, numberOfAttendees: values.confirmedGuests })
          : await getWittyDeclineMessage({ guestName: guest.name });
        setAiMessage(result.message || '');
      } catch (e) {
        setAiMessage(isAttending ? "Presença confirmada! Nos vemos na festa!" : "Que pena que não poderá vir. Sentiremos sua falta!");
=======
      if (willAttend) {
        const result = await getCharmingMessage({
          guestName: guestInfo.name,
          numberOfAttendees: values.confirmedGuests
        });
        setGeneratedMessage(result.message);
        onRsvpConfirmed();
        setStage('success');
      } else {
        const result = await getWittyDeclineMessage({ guestName: guestInfo.name });
        setGeneratedMessage(result.message);
        setStage('declined');
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
      }

      onRsvpConfirmed(guest.id);
      setStep('SUCCESS');
    });
  }
<<<<<<< HEAD

  return (
    <section id="rsvp" className="w-full py-20 px-4 bg-[#FBF9F6]">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-2xl border-none overflow-hidden bg-white/90 backdrop-blur-sm rounded-[2rem]">
          {step === 'IDENTIFY' && (
            <>
              <CardHeader className="text-center space-y-4 pt-10">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Heart className="text-primary h-8 w-8 fill-primary/20" />
                </div>
                <div className="space-y-2">
                    <CardTitle className="font-headline text-4xl text-gray-800">Confirmar Presença</CardTitle>
                    <CardDescription className="text-lg">Insira seus dados para localizarmos seu convite.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-10 px-8 md:px-12">
                <Form {...identifyForm}>
                  <form onSubmit={identifyForm.handleSubmit(onIdentify)} className="space-y-6">
                    <FormField control={identifyForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Seu nome completo</FormLabel>
                        <FormControl><Input placeholder="Como está no convite" {...field} className="h-12 border-muted bg-white rounded-xl focus:ring-primary" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={identifyForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Seu Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(00) 00000-0000" 
                            {...field} 
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            className="h-12 border-muted bg-white rounded-xl focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isPending}>
                      {isPending ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                      Acessar Meu Convite
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {step === 'CONFIRM' && guest && (
            <>
              <CardHeader className="text-center pb-6 pt-10">
                <CardTitle className="font-headline text-4xl text-gray-800">Olá, {guest.name.split(' ')[0]}!</CardTitle>
                <CardDescription className="text-lg">
                  Convite para até <strong>{guest.maxGuests} {guest.maxGuests > 1 ? 'pessoas' : 'pessoa'}</strong>.
                  <br/> Você poderá comparecer?
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-10 px-8 md:px-12">
                <Form {...confirmForm}>
                  <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant={watchStatus === 'confirmed' ? 'default' : 'outline'}
                        className={cn(
                            "h-24 flex-col gap-2 border-2 rounded-2xl transition-all duration-500", 
                            watchStatus === 'confirmed' ? "border-primary bg-primary/5 text-primary" : "border-muted"
                        )}
                        onClick={() => confirmForm.setValue('status', 'confirmed')}
                      >
                        <UserCheck className="h-7 w-7" />
                        <span className="font-bold">Vou comparecer</span>
                      </Button>
                      <Button 
                        type="button" 
                        variant={watchStatus === 'declined' ? 'destructive' : 'outline'}
                        className={cn(
                            "h-24 flex-col gap-2 border-2 rounded-2xl transition-all duration-500", 
                            watchStatus === 'declined' ? "border-destructive bg-destructive/5 text-destructive" : "border-muted"
                        )}
                        onClick={() => confirmForm.setValue('status', 'declined')}
                      >
                        <UserX className="h-7 w-7" />
                        <span className="font-bold">Não poderei ir</span>
                      </Button>
                    </div>

                    {watchStatus === 'confirmed' && (
                      <div className="space-y-6 animate-fade-in-up">
                        <FormField control={confirmForm.control} name="confirmedGuests" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Quantas pessoas ao todo?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl border-muted bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                {Array.from({ length: guest.maxGuests }, (_, i) => i + 1).map(num => (
                                  <SelectItem key={num} value={String(num)} className="rounded-lg">{num} {num === 1 ? 'pessoa' : 'pessoas'}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}/>

                        <div className="space-y-4 pt-4 border-t border-dashed">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                            <Users className="h-3 w-3" /> Nomes dos Confirmados
                          </p>
                          {fields.map((field, index) => (
                            <FormField
                              key={field.id}
                              control={confirmForm.control}
                              name={`attendees.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                                      {index + 1}.
                                    </span>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder={index === 0 ? "Seu nome" : "Nome do acompanhante"} 
                                        className="h-11 pl-8 border-muted rounded-xl bg-white/50"
                                        disabled={index === 0} // Titular não muda
                                      />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
=======
  
  const renderContent = () => {
    if (isPending || stage === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[350px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    switch (stage) {
      case 'success':
        return (
          <div className="flex flex-col items-center text-center p-6 md:p-8 space-y-4 min-h-[350px] justify-center">
            <SuccessIcon />
            <h3 className="font-headline text-2xl text-primary mt-4">Presença Confirmada!</h3>
            <p className="text-muted-foreground">{generatedMessage || 'Mal podemos esperar para celebrar com você. Obrigado!'}</p>
            <Button 
              onClick={() => {
                const giftSection = document.getElementById('gifts');
                if (giftSection) {
                  giftSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="outline"
              className="mt-4"
            >
              Ver Lista de Presentes
            </Button>
          </div>
        );
      case 'declined':
        return (
          <div className="flex flex-col items-center text-center p-6 md:p-8 space-y-4 min-h-[350px] justify-center">
            <Frown className="w-16 h-16 text-amber-500" />
            <h3 className="font-headline text-2xl text-primary mt-4">Que pena!</h3>
            <p className="text-muted-foreground">{generatedMessage || 'Sentiremos sua falta, mas agradecemos por nos avisar.'}</p>
          </div>
        );
      case 'error':
        return (
            <div className="flex flex-col items-center text-center p-6 md:p-8 space-y-4 min-h-[350px] justify-center">
                <Frown className="w-16 h-16 text-destructive" />
                <h3 className="font-headline text-2xl text-destructive mt-4">Ops! Algo deu errado.</h3>
                <p className="text-muted-foreground">{errorMessage}</p>
                <Button onClick={() => { setStage('initial'); idForm.reset(); }} className="mt-4">Tentar Novamente</Button>
            </div>
        );
      case 'found':
        return (
          <>
            <CardHeader className="text-center px-4 pt-6 md:px-6 md:pt-8">
              <CardTitle className="font-headline text-2xl md:text-3xl text-primary">Olá, {guestInfo?.name.split(' ')[0]}!</CardTitle>
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
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value || '')}>
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
                    <Button type="button" className="w-full" onClick={rsvpForm.handleSubmit(v => handleRsvpSubmit(v, true))} disabled={isPending}>
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
              <CardTitle className="font-headline text-3xl md:text-4xl text-primary">{texts.rsvp_title || 'Confirme sua Presença'}</CardTitle>
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
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <FormField control={confirmForm.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Mensagem para os noivos (Opcional)</FormLabel>
                        <FormControl><Textarea placeholder="Deixe um carinho aqui..." {...field} className="min-h-[80px] border-muted bg-white rounded-xl resize-none" /></FormControl>
                        <FormMessage />
                      </FormItem>
<<<<<<< HEAD
                    )}/>

                    <div className="flex gap-4">
                      <Button type="button" variant="ghost" onClick={() => setStep('IDENTIFY')} disabled={isPending} className="rounded-xl">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                      </Button>
                      <Button type="submit" className="flex-1 h-14 text-lg rounded-xl shadow-xl" disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-5 w-5" />}
                        Confirmar Agora
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {step === 'SUCCESS' && (
            <CardContent className="py-20 px-8 flex flex-col items-center text-center space-y-8 animate-fade-in-up">
              <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
                {confirmForm.getValues('status') === 'confirmed' ? (
                  <PartyPopper className="h-16 w-16 text-green-600" />
                ) : (
                  <Check className="h-16 w-16 text-green-600" />
                )}
              </div>
              <div className="space-y-4">
                <h3 className="font-headline text-4xl text-gray-800">Tudo Pronto!</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed italic">
                  "{aiMessage || "Sua resposta foi salva. Obrigado por nos avisar!"}"
                </p>
              </div>
              
              <div className="pt-4 space-y-4 w-full">
                  {confirmForm.getValues('status') === 'confirmed' && (
                    <Button 
                        size="lg"
                        className="w-full h-14 rounded-xl shadow-lg transition-transform hover:scale-[1.02]" 
                        onClick={() => document.getElementById('event')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Ver Local do Evento
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="text-gray-400"
                    onClick={() => { setStep('IDENTIFY'); setGuest(null); }}
                  >
                    Confirmar para outro convidado
                  </Button>
              </div>
            </CardContent>
          )}
=======
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
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
    <section id="rsvp" className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto max-w-lg px-4">
        <Card className="shadow-xl bg-background rounded-2xl border-border/50">
            {renderContent()}
>>>>>>> 5c07af4a248d37fbb8dcac0d291b75ca4375149d
        </Card>
      </div>
    </section>
  );
}
