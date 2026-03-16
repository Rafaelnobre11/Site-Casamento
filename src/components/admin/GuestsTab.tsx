'use client';
import { useState, useTransition, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addDocument, deleteDocument, updateDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Users, UserCheck, UserX, BarChart3, Trash2, Search, Download, Edit2, Filter, Star, Info, UserPlus, ListOrdered } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskPhone } from '@/lib/masks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Guest } from '@/types/siteConfig';
import { cn } from '@/lib/utils';

const guestSchema = z.object({
  name: z.string().min(3, "Nome muito curto."),
  phone: z.string().refine(v => v.replace(/\D/g, '').length >= 10, "Telefone inválido."),
  maxGuests: z.coerce.number().min(1, "Mínimo 1."),
});

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <Card className="relative overflow-hidden border-none shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
      <Icon className={cn("h-4 w-4", color)} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-[10px] text-muted-foreground mt-1 font-medium">{sub}</p>
    </CardContent>
    <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-20", color?.replace('text', 'bg'))} />
  </Card>
);

export default function GuestsTab() {
  const { data: guests, loading } = useCollection<Guest>('guests');
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const form = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: { name: '', phone: '', maxGuests: 1 },
  });

  const stats = useMemo(() => {
    if (!guests) return null;
    const total = guests.length;
    const confirmed = guests.filter(g => g.status === 'confirmed');
    const declined = guests.filter(g => g.status === 'declined');
    const pending = total - confirmed.length - declined.length;
    const peopleCount = confirmed.reduce((acc, g) => acc + (g.confirmedGuests || 0), 0);
    const maxPeople = guests.reduce((acc, g) => acc + g.maxGuests, 0);

    return { total, confirmed: confirmed.length, declined: declined.length, pending, peopleCount, maxPeople };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests?.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.phone.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || g.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [guests, searchTerm, statusFilter]);

  const onAdd = (values: any) => {
    startTransition(async () => {
      if (!firestore) return;
      try {
        await addDocument(firestore, 'guests', {
          ...values,
          phone: values.phone.replace(/\D/g, ''),
          status: 'pending',
          confirmedGuests: 0,
          message: '',
          createdAt: new Date().toISOString()
        });
        toast({ title: "Convidado adicionado!" });
        form.reset();
      } catch (error) {}
    });
  };

  const onDelete = (id: string, name: string) => {
    if (!confirm(`Excluir ${name}?`)) return;
    startTransition(async () => {
      if (!firestore) return;
      try {
        await deleteDocument(firestore, `guests/${id}`);
        toast({ title: "Removido!" });
      } catch (error) {}
    });
  };

  const onExport = () => {
    if (!guests) return;
    const headers = "Nome,Telefone,Limite,Confirmados,Status,Nomes dos Acompanhantes,Mensagem\n";
    const csv = guests.map(g => {
        const companions = g.attendeeNames?.join(" | ") || "";
        return `"${g.name}","${g.phone}",${g.maxGuests},${g.confirmedGuests},"${g.status}","${companions}","${g.message}"`;
    }).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convidados_wedding_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Convites" value={stats?.total} sub="Enviados" icon={Users} color="text-blue-500" />
        <StatCard title="OK" value={stats?.confirmed} sub="Convites Confirmados" icon={UserCheck} color="text-green-500" />
        <StatCard title="Ausentes" value={stats?.declined} sub="Não comparecerão" icon={UserX} color="text-red-500" />
        <StatCard title="Pendentes" value={stats?.pending} sub="Aguardando retorno" icon={Filter} color="text-amber-500" />
        <StatCard title="Total Pessoas" value={stats?.peopleCount} sub={`Pessoas Confirmadas`} icon={BarChart3} color="text-primary" />
        <StatCard title="Taxa" value={stats?.total ? `${Math.round((stats.confirmed / stats.total) * 100)}%` : '0%'} sub="De Confirmação" icon={Star} color="text-purple-500" />
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-lg h-fit sticky top-4">
                <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5" /> Novo Convite</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAdd)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nome do Titular</FormLabel><FormControl><Input placeholder="Ex: João e Maria" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} onChange={e => field.onChange(maskPhone(e.target.value))} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="maxGuests" render={({ field }) => (
                        <FormItem><FormLabel>Vagas no Convite</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" className="w-full shadow-lg" disabled={isPending}>Criar Convite</Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-3">
            <Card className="border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <div>
                    <CardTitle>Gestão de Convidados</CardTitle>
                    <CardDescription>Acompanhe quem já informou os nomes dos acompanhantes.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={onExport} className="rounded-full"><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nome ou telefone..." className="pl-9 rounded-full bg-muted/30 border-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] rounded-full bg-muted/30 border-none"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="confirmed">Confirmados</SelectItem>
                        <SelectItem value="declined">Recusados</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-bold">Titular</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="text-center font-bold">Pessoas</TableHead>
                            <TableHead className="text-center font-bold">Quem vai?</TableHead>
                            <TableHead className="text-right font-bold pr-6">Ações</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredGuests?.map((g) => {
                            const companionsCount = Math.max(0, (g.confirmedGuests || 0) - 1);
                            return (
                                <TableRow key={g.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="font-bold text-gray-800">{g.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{maskPhone(g.phone)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={g.status === 'confirmed' ? 'default' : g.status === 'declined' ? 'destructive' : 'secondary'} className="rounded-full px-3">
                                        {g.status === 'confirmed' ? 'Confirmado' : g.status === 'declined' ? 'Recusado' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-sm">{g.confirmedGuests} / {g.maxGuests}</span>
                                            {g.status === 'confirmed' && (
                                                <span className="text-[10px] text-muted-foreground">({companionsCount} extra)</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {g.status === 'confirmed' ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                                        <ListOrdered className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-4 rounded-xl shadow-xl border-none">
                                                    <div className="space-y-3">
                                                        <h4 className="font-bold text-xs uppercase tracking-widest text-primary border-b pb-2">Lista de Confirmados</h4>
                                                        <ul className="space-y-2">
                                                            {(g.attendeeNames && g.attendeeNames.length > 0) ? (
                                                                g.attendeeNames.map((name, idx) => (
                                                                    <li key={idx} className="text-sm flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                        {name}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="text-sm text-muted-foreground italic">Nomes não informados (convite antigo)</li>
                                                            )}
                                                        </ul>
                                                        {g.message && (
                                                            <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
                                                                <strong>Nota:</strong> {g.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:bg-destructive/10" onClick={() => onDelete(g.id, g.name)} disabled={isPending}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredGuests?.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Nenhum convidado encontrado.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
