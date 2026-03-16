'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { maskPhone } from '@/lib/masks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, UserCheck, UserX, ArrowRight, ArrowLeft, Heart, PartyPopper } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getCharmingMessage, getWittyDeclineMessage } from '@/app/actions';
import { cn } from '@/lib/utils';

const identifySchema = z.object({
  name: z.string().min(3, "Por favor, informe seu nome como está no convite."),
  phone: z.string().min(10, "Telefone inválido."),
});

const confirmSchema = z.object({
  status: z.enum(['confirmed', 'declined']),
  confirmedGuests: z.coerce.number().min(0),
  message: z.string().optional(),
});

type Step = 'IDENTIFY' | 'CONFIRM' | 'SUCCESS';
type GuestData = { id: string; name: string; maxGuests: number; status: string; confirmedGuests: number; phone: string };

export default function RsvpSection({ onRsvpConfirmed }: { onRsvpConfirmed: (guestId: string) => void }) {
  const [step, setStep] = useState<Step>('IDENTIFY');
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [aiMessage, setAiMessage] = useState('');
  const { firestore } = useFirebase();

  const identifyForm = useForm<z.infer<typeof identifySchema>>({
    resolver: zodResolver(identifySchema),
    defaultValues: { name: '', phone: '' },
  });

  const confirmForm = useForm<z.infer<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { status: 'confirmed', confirmedGuests: 1, message: '' },
  });

  const watchStatus = confirmForm.watch('status');

  async function onIdentify(values: z.infer<typeof identifySchema>) {
    if (!firestore) return;
    
    startTransition(async () => {
      const normalizedPhone = values.phone.replace(/\D/g, '');
      const guestsRef = collection(firestore, 'guests');
      const q = query(guestsRef, where("phone", "==", normalizedPhone), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) {
        identifyForm.setError('name', { message: "Não encontramos seu convite. Verifique o nome e telefone." });
        return;
      }

      const doc = snap.docs[0];
      const data = doc.data();
      
      const dbFirstName = data.name.split(' ')[0].toLowerCase();
      const inputFirstName = values.name.split(' ')[0].toLowerCase();

      if (dbFirstName !== inputFirstName && !data.name.toLowerCase().includes(values.name.toLowerCase())) {
        identifyForm.setError('name', { message: "O nome não coincide com este telefone." });
        return;
      }

      setGuest({ id: doc.id, ...data, phone: data.phone } as GuestData);
      confirmForm.reset({ 
        status: data.status === 'declined' ? 'declined' : 'confirmed', 
        confirmedGuests: data.confirmedGuests || data.maxGuests,
        message: data.message || ''
      });
      setStep('CONFIRM');
    });
  }

  async function onConfirm(values: z.infer<typeof confirmSchema>) {
    if (!guest || !firestore) return;

    startTransition(async () => {
      const isAttending = values.status === 'confirmed';
      const updateData = {
        status: values.status,
        confirmedGuests: isAttending ? values.confirmedGuests : 0,
        message: values.message || '',
        updatedAt: new Date().toISOString(),
        confirmedAt: isAttending ? (guest.status === 'confirmed' ? (guest as any).confirmedAt : new Date().toISOString()) : null
      };

      await setDocument(firestore, `guests/${guest.id}`, updateData, { merge: true });

      try {
        const result = isAttending 
          ? await getCharmingMessage({ guestName: guest.name, numberOfAttendees: values.confirmedGuests })
          : await getWittyDeclineMessage({ guestName: guest.name });
        setAiMessage(result.message || '');
      } catch (e) {
        setAiMessage(isAttending ? "Presença confirmada! Nos vemos na festa!" : "Que pena que não poderá vir. Sentiremos sua falta!");
      }

      // Notifica o componente pai do sucesso para desbloquear conteúdo
      onRsvpConfirmed(guest.id);
      setStep('SUCCESS');
    });
  }

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
                <CardDescription className="text-lg">Ficamos muito felizes em te encontrar. <br/> Você vem?</CardDescription>
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
                            watchStatus === 'confirmed' ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "border-muted"
                        )}
                        onClick={() => confirmForm.setValue('status', 'confirmed')}
                      >
                        <UserCheck className="h-7 w-7" />
                        <span className="font-bold">Sim, eu vou!</span>
                      </Button>
                      <Button 
                        type="button" 
                        variant={watchStatus === 'declined' ? 'destructive' : 'outline'}
                        className={cn(
                            "h-24 flex-col gap-2 border-2 rounded-2xl transition-all duration-500", 
                            watchStatus === 'declined' ? "border-destructive bg-destructive/5 text-destructive hover:bg-destructive/10" : "border-muted"
                        )}
                        onClick={() => confirmForm.setValue('status', 'declined')}
                      >
                        <UserX className="h-7 w-7" />
                        <span className="font-bold">Não poderei ir</span>
                      </Button>
                    </div>

                    {watchStatus === 'confirmed' && (
                      <FormField control={confirmForm.control} name="confirmedGuests" render={({ field }) => (
                        <FormItem className="animate-fade-in-up">
                          <FormLabel className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Quantas pessoas você confirma? (Máx: {guest.maxGuests})</FormLabel>
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
                    )}

                    <FormField control={confirmForm.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Deixe um recado para os noivos</FormLabel>
                        <FormControl><Textarea placeholder="Ex: Mal podemos esperar por esse dia!" {...field} className="min-h-[100px] border-muted bg-white rounded-xl resize-none" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>

                    <div className="flex gap-4">
                      <Button type="button" variant="ghost" onClick={() => setStep('IDENTIFY')} disabled={isPending} className="rounded-xl">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                      </Button>
                      <Button type="submit" className="flex-1 h-14 text-lg rounded-xl shadow-xl" disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-5 w-5" />}
                        Finalizar Confirmação
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
                <h3 className="font-headline text-4xl text-gray-800">Recebido com Carinho!</h3>
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
        </Card>
      </div>
    </section>
  );
}
