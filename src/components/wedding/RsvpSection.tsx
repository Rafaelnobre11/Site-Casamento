'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { maskPhone } from '@/lib/masks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

export default function RsvpSection({ onRsvpConfirmed }: { onRsvpConfirmed: () => void }) {
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
      
      // Busca amigável: permite que a pessoa digite apenas o primeiro nome se o telefone bater
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

      // IA Magic
      try {
        const result = isAttending 
          ? await getCharmingMessage({ guestName: guest.name, numberOfAttendees: values.confirmedGuests })
          : await getWittyDeclineMessage({ guestName: guest.name });
        setAiMessage(result.message || '');
      } catch (e) {
        setAiMessage(isAttending ? "Presença confirmada! Nos vemos na festa!" : "Que pena que não poderá vir. Sentiremos sua falta!");
      }

      if (isAttending) onRsvpConfirmed();
      setStep('SUCCESS');
    });
  }

  return (
    <section id="rsvp" className="w-full py-20 px-4 bg-muted/30">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-xl border-none overflow-hidden bg-white/80 backdrop-blur-sm">
          {step === 'IDENTIFY' && (
            <>
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Heart className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="font-headline text-3xl md:text-4xl text-primary">Confirmar Presença</CardTitle>
                <CardDescription>Insira seus dados para localizarmos seu convite na lista oficial.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...identifyForm}>
                  <form onSubmit={identifyForm.handleSubmit(onIdentify)} className="space-y-5">
                    <FormField control={identifyForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu nome completo</FormLabel>
                        <FormControl><Input placeholder="Como está no convite" {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={identifyForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(00) 00000-0000" 
                            {...field} 
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            className="bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
                      {isPending ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                      Localizar meu Convite
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {step === 'CONFIRM' && guest && (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-headline text-3xl text-primary">Olá, {guest.name.split(' ')[0]}!</CardTitle>
                <CardDescription>Encontramos seu convite. Agora, diga-nos se você vem.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...confirmForm}>
                  <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant={watchStatus === 'confirmed' ? 'default' : 'outline'}
                        className={cn("h-20 flex-col gap-1 border-2", watchStatus === 'confirmed' && "border-primary")}
                        onClick={() => confirmForm.setValue('status', 'confirmed')}
                      >
                        <UserCheck className="h-6 w-6" />
                        Vou comparecer
                      </Button>
                      <Button 
                        type="button" 
                        variant={watchStatus === 'declined' ? 'destructive' : 'outline'}
                        className={cn("h-20 flex-col gap-1 border-2", watchStatus === 'declined' && "border-destructive")}
                        onClick={() => confirmForm.setValue('status', 'declined')}
                      >
                        <UserX className="h-6 w-6" />
                        Não poderei ir
                      </Button>
                    </div>

                    {watchStatus === 'confirmed' && (
                      <FormField control={confirmForm.control} name="confirmedGuests" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantas pessoas você confirma? (Máx: {guest.maxGuests})</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: guest.maxGuests }, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={String(num)}>{num} {num === 1 ? 'pessoa' : 'pessoas'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    )}

                    <FormField control={confirmForm.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deixe um recado (Opcional)</FormLabel>
                        <FormControl><Textarea placeholder="Ex: Mal podemos esperar!" {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>

                    <div className="flex gap-3">
                      <Button type="button" variant="ghost" onClick={() => setStep('IDENTIFY')} disabled={isPending}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                      </Button>
                      <Button type="submit" className="flex-1 h-12" disabled={isPending}>
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
            <CardContent className="py-12 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                {confirmForm.getValues('status') === 'confirmed' ? (
                  <PartyPopper className="h-12 w-12 text-green-600" />
                ) : (
                  <Check className="h-12 w-12 text-green-600" />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-3xl text-primary">Recebido com Sucesso!</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                  {aiMessage || "Sua resposta foi salva. Obrigado por nos avisar!"}
                </p>
              </div>
              {confirmForm.getValues('status') === 'confirmed' && (
                <Button variant="outline" className="mt-4" onClick={() => document.getElementById('gifts')?.scrollIntoView({ behavior: 'smooth' })}>
                  Ver Lista de Presentes
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </section>
  );
}
