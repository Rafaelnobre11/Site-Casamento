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
import { Loader2, Users, UserCheck, UserX, BarChart3, Trash2, Search, Download, Edit2, Filter, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskPhone } from '@/lib/masks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Guest } from '@/types/siteConfig';
import { cn } from '@/lib/utils';

const guestSchema = z.object({
  name: z.string().min(3, "Nome muito curto."),
  phone: z.string().refine(v => v.replace(/\D/g, '').length >= 10, "Telefone inválido."),
  maxGuests: z.coerce.number().min(1, "Mínimo 1."),
});

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
      <Icon className={cn("h-4 w-4", color)} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
    </CardContent>
    <div className={cn("absolute bottom-0 left-0 h-1 w-full", color?.replace('text', 'bg'))} />
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
      } catch (error) {
        // Erro tratado pelo error emitter
      }
    });
  };

  const onDelete = (id: string, name: string) => {
    if (!confirm(`Excluir ${name}?`)) return;
    startTransition(async () => {
      if (!firestore) return;
      try {
        await deleteDocument(firestore, `guests/${id}`);
        toast({ title: "Removido!" });
      } catch (error) {
        // Erro tratado pelo error emitter
      }
    });
  };

  const onExport = () => {
    if (!guests) return;
    const headers = "Nome,Telefone,Limite,Confirmados,Status,Mensagem\n";
    const csv = guests.map(g => `"${g.name}","${g.phone}",${g.maxGuests},${g.confirmedGuests},"${g.status}","${g.message}"`).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convidados_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Total Convites" value={stats?.total} sub="Enviados" icon={Users} color="text-blue-500" />
        <StatCard title="Confirmados" value={stats?.confirmed} sub="Convites OK" icon={UserCheck} color="text-green-500" />
        <StatCard title="Recusados" value={stats?.declined} sub="Não virão" icon={UserX} color="text-red-500" />
        <StatCard title="Pendentes" value={stats?.pending} sub="Aguardando" icon={Filter} color="text-amber-500" />
        <StatCard title="Total Pessoas" value={stats?.peopleCount} sub={`De ${stats?.maxPeople} possíveis`} icon={BarChart3} color="text-primary" />
        <StatCard title="Taxa" value={stats?.total ? `${Math.round((stats.confirmed / stats.total) * 100)}%` : '0%'} sub="De conversão" icon={Star} color="text-purple-500" />
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit sticky top-4">
          <CardHeader><CardTitle>Novo Convite</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAdd)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Família Silva" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} onChange={e => field.onChange(maskPhone(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="maxGuests" render={({ field }) => (
                  <FormItem><FormLabel>Vagas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <Button type="submit" className="w-full" disabled={isPending}>Adicionar</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lista de Gerenciamento</CardTitle>
              <CardDescription>Acompanhe e edite os status manualmente se necessário.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onExport}><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome ou telefone..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="declined">Recusados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Convidado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Presenças</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests?.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="py-4">
                        <div className="font-bold">{g.name}</div>
                        <div className="text-xs text-muted-foreground">{maskPhone(g.phone)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={g.status === 'confirmed' ? 'default' : g.status === 'declined' ? 'destructive' : 'secondary'}>
                          {g.status === 'confirmed' ? 'Confirmado' : g.status === 'declined' ? 'Recusado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm">{g.confirmedGuests} / {g.maxGuests}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onDelete(g.id, g.name)} disabled={isPending}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredGuests?.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Nenhum convidado encontrado.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
