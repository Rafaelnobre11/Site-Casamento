'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast"
import { Copy, Check } from 'lucide-react';
import { getCharmingMessage } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/siteConfig';

const defaultGifts: Product[] = [
    {
        id: 'gift-1',
        title: '1 Hora de Open Bar',
        price: 'R$ 50,00',
        description: 'Garanta a alegria dos noivos (e a sua) com mais uma hora de bons drinks. Um investimento com retorno garantido na pista de dança.',
        funnyNote: 'Boaaa! Você não é apenas um convidado, é um investidor-anjo da nossa alegria etílica. O primeiro brinde será em sua homenagem!',
        imageUrl: 'https://picsum.photos/seed/gift1/400/250'
    },
    {
        id: 'gift-2',
        title: 'Paciência para o Noivo',
        price: 'R$ 75,00',
        description: 'Um investimento na paz conjugal. A noiva agradece e o terapeuta também.',
        funnyNote: 'Você fez uma contribuição valiosíssima para a harmonia deste lar. A noiva agradece em dobro. Prometemos usar com sabedoria!',
        imageUrl: 'https://picsum.photos/seed/gift2/400/250'
    },
    {
        id: 'gift-3',
        title: 'Kit Anti-Ressaca',
        price: 'R$ 100,00',
        description: 'Para sobrevivermos à festa e à lua de mel. Inclui analgésicos e muita água de coco.',
        funnyNote: 'Herói(na)! Graças a você nossa lua de mel não será apenas à base de água e analgésicos. Sua generosidade será lembrada na manhã seguinte!',
        imageUrl: 'https://picsum.photos/seed/gift3/400/250'
    },
    {
        id: 'gift-4',
        title: 'Curso de Culinária para a Noiva',
        price: 'R$ 150,00',
        description: 'Ajude o noivo a não viver de delivery. Uma causa nobre pela gastronomia do lar.',
        funnyNote: 'Ufa! Você salvou o noivo de uma vida de miojo e delivery. Ele está emocionadíssimo com a sua generosidade e preocupação com a saúde dele.',
        imageUrl: 'https://picsum.photos/seed/gift4/400/250'
    },
    {
        id: 'gift-5',
        title: 'Vale Jantar Romântico',
        price: 'R$ 200,00',
        description: 'Patrocine nosso primeiro jantar chique como casados. Prometemos não usar o extintor de incêndio como decoração.',
        funnyNote: 'Obrigado! Graças a você, nosso primeiro jantar não será pão com ovo. Você acaba de salvar nosso casamento do tédio gastronômico.',
        imageUrl: 'https://picsum.photos/seed/gift5/400/250'
    },
    {
        id: 'gift-6',
        title: 'A Primeira Conta de Luz',
        price: 'R$ 120,00',
        description: 'Ajude-nos a manter as luzes acesas (e o Wi-Fi funcionando) no primeiro mês. É mais romântico do que parece.',
        funnyNote: 'Você iluminou nosso primeiro mês! Literalmente. Obrigado por nos salvar da escuridão e do tédio sem internet!',
        imageUrl: 'https://picsum.photos/seed/gift6/400/250'
    },
    {
        id: 'gift-7',
        title: 'Cota para a Lua de Mel',
        price: 'R$ 300,00',
        description: 'Contribua com qualquer valor para nossa viagem dos sonhos. Queremos voltar com histórias, não com dívidas.',
        funnyNote: 'Cada centavo nos leva para mais perto de um coquetel na praia. Brindaremos à sua generosidade sob o sol!',
        imageUrl: 'https://picsum.photos/seed/gift7/400/250'
    },
    {
        id: 'gift-8',
        title: 'Um Mês de Terapia de Casal (Preventiva)',
        price: 'R$ 400,00',
        description: 'Porque é melhor prevenir do que remediar. Um investimento no nosso futuro "felizes para sempre".',
        funnyNote: 'Você é um visionário! Obrigado por investir na nossa sanidade mental conjunta. Prometemos não discutir na sua frente.',
        imageUrl: 'https://picsum.photos/seed/gift8/400/250'
    },
    {
        id: 'gift-9',
        title: 'Kit "Sobrevivendo à Montagem de Móveis"',
        price: 'R$ 90,00',
        description: 'Inclui manual, paciência extra e um voucher para pizza, porque ninguém cozinha depois dessa batalha.',
        funnyNote: 'Você salvou nosso relacionamento do teste supremo! A pizza será consumida em sua homenagem, em meio a parafusos e prateleiras.',
        imageUrl: 'https://picsum.photos/seed/gift9/400/250'
    },
    {
        id: 'gift-10',
        title: 'Assinatura de Streaming (Para Evitar Spoilers)',
        price: 'R$ 55,00',
        description: 'Garanta que a gente assista às mesmas séries ao mesmo tempo. Evite a terceira guerra mundial conjugal.',
        funnyNote: 'A paz reina em nosso sofá graças a você! Agora podemos maratonar sem o risco de um "eu já assisti esse episódio". Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift10/400/250'
    },
    {
        id: 'gift-11',
        title: 'Aulas de Dança (Para Não Fazer Feio)',
        price: 'R$ 180,00',
        description: 'Ajude-nos a não pisar no pé um do outro na pista de dança. Pelo bem do nosso futuro e dos nossos sapatos.',
        funnyNote: 'Nossos futuros passos de dança desajeitados, porém sincronizados, são por sua conta. Obrigado por nos salvar da vergonha!',
        imageUrl: 'https://picsum.photos/seed/gift11/400/250'
    },
    {
        id: 'gift-12',
        title: 'Fones de Ouvido com Cancelamento de Ruído (Para Ele)',
        price: 'R$ 250,00',
        description: 'Para momentos de paz e concentração... ou para quando a noiva estiver cantando no chuveiro.',
        funnyNote: 'A paz interior do noivo agradece. E a noiva também, que agora pode cantar livremente. Obrigado pelo silêncio!',
        imageUrl: 'https://picsum.photos/seed/gift12/400/250'
    },
    {
        id: 'gift-13',
        title: 'Um Jogo de Toalhas que Combinam',
        price: 'R$ 130,00',
        description: 'Para finalmente parecermos adultos responsáveis que têm um banheiro organizado. Adeus, toalhas de time de futebol.',
        funnyNote: 'Você elevou o nível do nosso banheiro! Obrigado por nos fazer sentir como pessoas chiques que têm toalhas que combinam.',
        imageUrl: 'https://picsum.photos/seed/gift13/400/250'
    },
    {
        id: 'gift-14',
        title: 'Botijão de Gás (A Chama do Amor)',
        price: 'R$ 110,00',
        description: 'Mantenha a chama do nosso amor (e do nosso fogão) acesa. Um presente literalmente essencial.',
        funnyNote: 'Você está literalmente mantendo a chama do nosso amor acesa! E garantindo que teremos comida quente. Herói!',
        imageUrl: 'https://picsum.photos/seed/gift14/400/250'
    },
    {
        id: 'gift-15',
        title: 'Primeira Feira do Mês',
        price: 'R$ 350,00',
        description: 'Patrocine nosso primeiro carrinho de supermercado como casados. Prometemos comprar vegetais.',
        funnyNote: 'Obrigado! Nosso carrinho não terá apenas bolachas e sorvete graças a você. Nossa saúde agradece!',
        imageUrl: 'https://picsum.photos/seed/gift15/400/250'
    },
    {
        id: 'gift-16',
        title: 'Ração do Pet (Porque Ele Também é da Família)',
        price: 'R$ 80,00',
        description: 'Ajude a manter nosso membro de quatro patas feliz e bem alimentado. Ele manda um "au au" de agradecimento.',
        funnyNote: 'Nosso pet está abanando o rabo de felicidade! Obrigado por garantir o banquete dele. Ele te ama!',
        imageUrl: 'https://picsum.photos/seed/gift16/400/250'
    },
    {
        id: 'gift-17',
        title: 'Multa por Atraso da Noiva',
        price: 'R$ 60,00',
        description: 'Um fundo de emergência para a notória falta de pontualidade da noiva. O noivo (e o padre) agradecem.',
        funnyNote: 'Você é um anjo da pontualidade! Com a sua ajuda, talvez o casamento comece apenas com 15 minutos de atraso, e não 30.',
        imageUrl: 'https://picsum.photos/seed/gift17/400/250'
    },
    {
        id: 'gift-18',
        title: 'Curso de Finanças para Casais',
        price: 'R$ 220,00',
        description: 'Para aprendermos a não brigar por causa de dinheiro. Um investimento na nossa prosperidade e paz.',
        funnyNote: 'Obrigado por nos ajudar a não transformar "meu dinheiro" e "seu dinheiro" em uma batalha. Nosso futuro agradece!',
        imageUrl: 'https://picsum.photos/seed/gift18/400/250'
    },
    {
        id: 'gift-19',
        title: 'Sessão de Cinema em Casa (com Pipoca Gourmet)',
        price: 'R$ 45,00',
        description: 'Para aquelas noites em que a preguiça de sair vence. Garanta nosso entretenimento e guloseimas.',
        funnyNote: 'Noite de cinema garantida! Você é o patrocinador oficial do nosso momento sofá e filme. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift19/400/250'
    },
    {
        id: 'gift-20',
        title: 'Doação para Caridade em Nosso Nome',
        price: 'R$ 100,00',
        description: 'Espalhe o amor! Faremos uma doação para uma instituição de caridade que apoiamos.',
        funnyNote: 'Obrigado por espalhar o amor junto com a gente! Sua generosidade fez a diferença não só para nós, mas para outros também.',
        imageUrl: 'https://picsum.photos/seed/gift20/400/250'
    },
    {
        id: 'gift-21',
        title: 'Cota para o Bolo de Casamento',
        price: 'R$ 30,00',
        description: 'Ajude a pagar uma fatia do bolo. Em troca, garantimos que você poderá repetir.',
        funnyNote: 'Você garantiu a sobremesa! A primeira fatia simbólica é sua. Obrigado por adoçar nosso dia!',
        imageUrl: 'https://picsum.photos/seed/gift21/400/250'
    },
    {
        id: 'gift-22',
        title: 'Gasolina para a Fuga dos Noivos',
        price: 'R$ 150,00',
        description: 'Para o carro que nos levará da festa para o início da nossa nova vida (ou para o hotel mais próximo).',
        funnyNote: 'Tanque cheio para a nossa fuga! Obrigado por garantir que a gente não fique pelo caminho. Partiu lua de mel!',
        imageUrl: 'https://picsum.photos/seed/gift22/400/250'
    },
    {
        id: 'gift-23',
        title: 'A Planta que (Esperamos) Não Vai Morrer',
        price: 'R$ 50,00',
        description: 'Um ser vivo para testar nossa responsabilidade. Prometemos tentar mantê-la verde.',
        funnyNote: 'Desafio aceito! Cuidaremos desta planta como um teste para futuras responsabilidades. Obrigado pelo voto de confiança!',
        imageUrl: 'https://picsum.photos/seed/gift23/400/250'
    },
    {
        id: 'gift-24',
        title: 'Caixa de Ferramentas (Para o Noivo se Virar)',
        price: 'R$ 180,00',
        description: 'Chega de usar uma faca como chave de fenda. Ajude o noivo a se tornar um "marido de aluguel".',
        funnyNote: 'Obrigado! Agora o noivo não tem mais desculpas para não consertar aquela gaveta solta. Você é um herói do lar!',
        imageUrl: 'https://picsum.photos/seed/gift24/400/250'
    },
    {
        id: 'gift-25',
        title: 'Kit de Primeiros Socorros Conjugal',
        price: 'R$ 70,00',
        description: 'Para pequenos acidentes domésticos e grandes discussões sobre a tampa do vaso.',
        funnyNote: 'Perfeito! Agora estamos preparados para pequenos cortes, arranhões e crises existenciais sobre quem comeu o último pedaço de bolo.',
        imageUrl: 'https://picsum.photos/seed/gift25/400/250'
    },
    {
        id: 'gift-26',
        title: 'Um Dia de Spa para a Noiva (Pós-Estresse)',
        price: 'R$ 350,00',
        description: 'Organizar um casamento é estressante. Ajude a noiva a recuperar a dignidade e a paz de espírito.',
        funnyNote: 'A noiva está em estado de gratidão profunda. Você salvou a pele dela (literalmente). Obrigado por patrocinar o relaxamento!',
        imageUrl: 'https://picsum.photos/seed/gift26/400/250'
    },
    {
        id: 'gift-27',
        title: 'Vale-Cerveja Artesanal para o Noivo',
        price: 'R$ 100,00',
        description: 'Para o noivo relaxar e refletir sobre a grande decisão que tomou. Ele merece.',
        funnyNote: 'O noivo ergue um brinde (imaginário, por enquanto) a você! Obrigado por patrocinar a hidratação e a alegria dele.',
        imageUrl: 'https://picsum.photos/seed/gift27/400/250'
    },
    {
        id: 'gift-28',
        title: 'Livros (Para a gente parecer mais inteligente)',
        price: 'R$ 60,00',
        description: 'Ajude a compor nossa biblioteca e a decorar a estante com títulos que impressionem as visitas.',
        funnyNote: 'Obrigado! Nossa estante ficará mais culta e nossas conversas, quem sabe, mais interessantes. Você é um incentivador da leitura!',
        imageUrl: 'https://picsum.photos/seed/gift28/400/250'
    },
    {
        id: 'gift-29',
        title: 'Fundo de Emergência "Quebrou, Pagou"',
        price: 'R$ 150,00',
        description: 'Para quando um de nós quebrar acidentalmente aquele vaso que era da avó do outro. A paz agradece.',
        funnyNote: 'Você é um pacificador! Esse fundo vai salvar muitas discussões futuras. Obrigado por investir na diplomacia do nosso lar.',
        imageUrl: 'https://picsum.photos/seed/gift29/400/250'
    },
    {
        id: 'gift-30',
        title: 'Cafeteira (A Gasolina do Adulto)',
        price: 'R$ 250,00',
        description: 'O combustível essencial para manhãs produtivas e para manter o bom humor antes das 10h.',
        funnyNote: 'Nossas manhãs serão infinitamente melhores graças a você! Obrigado por garantir nossa dose diária de humanidade.',
        imageUrl: 'https://picsum.photos/seed/gift30/400/250'
    },
    {
        id: 'gift-31',
        title: 'Cota para o fotógrafo',
        price: 'R$ 50,00',
        description: 'Ajude-nos a pagar o profissional que irá registrar nossas caras de felicidade (e talvez de choro).',
        funnyNote: 'Cada clique do fotógrafo terá um pouco da sua generosidade. Obrigado por nos ajudar a eternizar este momento!',
        imageUrl: 'https://picsum.photos/seed/gift31/400/250'
    },
    {
        id: 'gift-32',
        title: 'Uma noite no hotel (pós-festa)',
        price: 'R$ 500,00',
        description: 'Para desabarmos em uma cama confortável depois da festa, sem ter que arrumar nada.',
        funnyNote: 'Você nos deu o presente do descanso! Mal podemos esperar para não fazer absolutamente nada. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift32/400/250'
    },
    {
        id: 'gift-33',
        title: 'Kit jardinagem para varanda',
        price: 'R$ 120,00',
        description: 'Para tentarmos ter um polegar verde e cultivar nossos próprios temperos (ou pelo menos tentar).',
        funnyNote: 'Obrigado por nos dar a chance de ter uma "horta". Se tudo der certo, te convidamos para um jantar com temperos frescos!',
        imageUrl: 'https://picsum.photos/seed/gift33/400/250'
    },
    {
        id: 'gift-34',
        title: 'A primeira conta de condomínio',
        price: 'R$ 600,00',
        description: 'A dura realidade da vida adulta batendo na porta. Ajude-nos a não sermos expulsos no primeiro mês.',
        funnyNote: 'Obrigado! Você adiou nossa primeira briga com o síndico. Somos eternamente gratos por isso!',
        imageUrl: 'https://picsum.photos/seed/gift34/400/250'
    },
    {
        id: 'gift-35',
        title: 'Vale-pizza de domingo',
        price: 'R$ 80,00',
        description: 'Porque domingo é o dia oficial da preguiça de cozinhar. Patrocine essa tradição.',
        funnyNote: 'Você salvou nosso domingo! A primeira fatia será comida em sua homenagem. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift35/400/250'
    },
    {
        id: 'gift-36',
        title: 'Um aspirador de pó robô',
        price: 'R$ 1.200,00',
        description: 'Para que a gente possa discutir sobre quem limpa a casa enquanto ele faz todo o trabalho.',
        funnyNote: 'Você comprou nosso futuro melhor amigo! Obrigado por nos dar mais tempo para o que importa: decidir o que assistir na TV.',
        imageUrl: 'https://picsum.photos/seed/gift36/400/250'
    },
    {
        id: 'gift-37',
        title: 'Dois ingressos para um show',
        price: 'R$ 400,00',
        description: 'Para o nosso primeiro "rolê" como casados. Música, diversão e talvez um pouco de dor nos pés.',
        funnyNote: 'Vamos celebrar nosso casamento em alto e bom som, graças a você! Obrigado pelo primeiro date oficial como casados.',
        imageUrl: 'https://picsum.photos/seed/gift37/400/250'
    },
    {
        id: 'gift-38',
        title: 'Jogo de tabuleiro (para testar a competitividade)',
        price: 'R$ 150,00',
        description: 'Uma forma divertida de descobrir quem é o mais competitivo (e o mais chorão) da relação.',
        funnyNote: 'Que comecem os jogos! Obrigado por patrocinar futuras noites de diversão (e talvez algumas pequenas discussões).',
        imageUrl: 'https://picsum.photos/seed/gift38/400/250'
    },
    {
        id: 'gift-39',
        title: 'Cota para a decoração da casa nova',
        price: 'R$ 200,00',
        description: 'Ajude-nos a deixar nosso cantinho com a nossa cara (e com menos caixas de papelão).',
        funnyNote: 'Nossa casa ficará mais bonita e aconchegante com a sua ajuda. Obrigado por fazer parte da construção do nosso ninho!',
        imageUrl: 'https://picsum.photos/seed/gift39/400/250'
    },
    {
        id: 'gift-40',
        title: 'Um conjunto de panelas decente',
        price: 'R$ 500,00',
        description: 'Para aposentar aquela panela amassada que temos desde a faculdade. Nossa comida agradece.',
        funnyNote: 'Adeus, comida queimada! Com essas panelas, nossas habilidades culinárias (ou a falta delas) têm uma nova chance. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift40/400/250'
    },
    {
        id: 'gift-41',
        title: 'Cota para a taxa do cartório',
        price: 'R$ 1.000,00',
        description: 'A parte menos glamorosa, mas necessária, do casamento. Ajude-nos a oficializar a "loucura".',
        funnyNote: 'Você é a parte burocrática (e essencial) do nosso amor! Obrigado por nos ajudar a assinar os papéis.',
        imageUrl: 'https://picsum.photos/seed/gift41/400/250'
    },
    {
        id: 'gift-42',
        title: 'Um fim de semana na serra',
        price: 'R$ 700,00',
        description: 'Para fugirmos da cidade e respirarmos ar puro. Fondue e lareira por nossa conta.',
        funnyNote: 'Nossa primeira mini-lua de mel será graças a você! Mal podemos esperar pelo friozinho e pelo chocolate quente. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift42/400/250'
    },
    {
        id: 'gift-43',
        title: 'Kit de vinhos para iniciantes',
        price: 'R$ 250,00',
        description: 'Para aprendermos a apreciar um bom vinho e fingir que entendemos de "taninos" e "bouquet".',
        funnyNote: 'Um brinde a você! Obrigado por iniciar nossa jornada no mundo dos vinhos. Seremos os sommeliers mais charmosos (e confusos) que você conhece.',
        imageUrl: 'https://picsum.photos/seed/gift43/400/250'
    },
    {
        id: 'gift-44',
        title: 'A primeira compra de material de limpeza',
        price: 'R$ 150,00',
        description: 'Porque a casa não se limpa sozinha (infelizmente). Um presente prático e muito apreciado.',
        funnyNote: 'Você está patrocinando um lar limpo e cheiroso! Nossa guerra contra a poeira tem um novo aliado. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift44/400/250'
    },
    {
        id: 'gift-45',
        title: 'Cadeira de praia e guarda-sol',
        price: 'R$ 180,00',
        description: 'Para futuros dias de sol, mar e preguiça. Essencial para a nossa saúde mental.',
        funnyNote: 'Nossos futuros dias de praia serão muito mais confortáveis graças a você. Obrigado por patrocinar nossa marquinha de sol!',
        imageUrl: 'https://picsum.photos/seed/gift45/400/250'
    },
    {
        id: 'gift-46',
        title: 'Vale "Fila do Pão na Padaria"',
        price: 'R$ 25,00',
        description: 'Patrocine o pão quentinho do café da manhã de domingo. Pequenos luxos da vida a dois.',
        funnyNote: 'Você salvou nosso café da manhã! O cheirinho de pão fresco pela manhã será um brinde a você. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift46/400/250'
    },
    {
        id: 'gift-47',
        title: 'Ajudinha para o aluguel',
        price: 'R$ 500,00',
        description: 'A parte mais "adulta" e menos divertida de morar junto. Qualquer ajuda é um golaço!',
        funnyNote: 'Você nos ajudou a garantir nosso teto por mais um tempo! O síndico agradece, e nós mais ainda. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift47/400/250'
    },
    {
        id: 'gift-48',
        title: 'Edredom quentinho para noites de filme',
        price: 'R$ 300,00',
        description: 'Para nos mantermos aquecidos e confortáveis enquanto maratonamos nossas séries favoritas.',
        funnyNote: 'Nossas noites de Netflix nunca mais serão as mesmas. Obrigado pelo conforto e pelo aconchego!',
        imageUrl: 'https://picsum.photos/seed/gift48/400/250'
    },
    {
        id: 'gift-49',
        title: 'Um quadro para a parede vazia',
        price: 'R$ 150,00',
        description: 'Ajude-nos a preencher aquela parede triste e vazia da sala. Arte é vida!',
        funnyNote: 'Nossa parede não será mais um deserto branco graças a você. Obrigado por trazer mais cor e vida para o nosso lar!',
        imageUrl: 'https://picsum.photos/seed/gift49/400/250'
    },
    {
        id: 'gift-50',
        title: 'Fundo para o primeiro "perrengue" do carro',
        price: 'R$ 200,00',
        description: 'Porque sabemos que uma hora o pneu fura ou a bateria arria. Esteja um passo à frente do caos.',
        funnyNote: 'Você é nosso anjo da guarda automotivo! Obrigado por nos salvar de um futuro estresse na beira da estrada.',
        imageUrl: 'https://picsum.photos/seed/gift50/400/250'
    },
    {
        id: 'gift-51',
        title: 'Cota para o DJ da festa',
        price: 'R$ 75,00',
        description: 'Ajude a garantir que a pista de dança não pare e que as músicas sejam de bom gosto (pelo menos na maior parte do tempo).',
        funnyNote: 'A pista de dança agradece! Cada batida contagiante terá um pouco da sua energia. Obrigado por manter a festa viva!',
        imageUrl: 'https://picsum.photos/seed/gift51/400/250'
    },
    {
        id: 'gift-52',
        title: 'Kit de jardinagem para iniciantes',
        price: 'R$ 130,00',
        description: 'Para tentarmos cultivar algo além de boletos. Dedos cruzados para que as plantas sobrevivam.',
        funnyNote: 'Você nos deu uma missão! Cuidaremos dessas plantinhas com todo o carinho. Obrigado por trazer um pouco de verde para nossa vida.',
        imageUrl: 'https://picsum.photos/seed/gift52/400/250'
    },
    {
        id: 'gift-53',
        title: 'Uma airfryer (para uma vida mais saudável... ou não)',
        price: 'R$ 450,00',
        description: 'Para fazermos batata frita sem culpa e outros pratos que nos façam sentir como chefs de cozinha.',
        funnyNote: 'A era da fritura saudável começou! Obrigado por este presente que vai revolucionar nossa cozinha (e nossa cintura).',
        imageUrl: 'https://picsum.photos/seed/gift53/400/250'
    },
    {
        id: 'gift-54',
        title: 'Vale-sorvete para dias quentes',
        price: 'R$ 40,00',
        description: 'Para refrescar o corpo e a alma nos dias de calor intenso. Um presente delicioso e estratégico.',
        funnyNote: 'Você salvou nosso verão! A próxima bola de sorvete será em sua homenagem. Obrigado pela refrescância!',
        imageUrl: 'https://picsum.photos/seed/gift54/400/250'
    },
    {
        id: 'gift-55',
        title: 'Um conjunto de taças de vinho (para as visitas)',
        price: 'R$ 180,00',
        description: 'Para impressionar os amigos e fingir que somos adultos sofisticados. Chega de copo de requeijão.',
        funnyNote: 'Nossa sofisticação agradece! Agora podemos receber visitas com a dignidade que elas merecem. Um brinde a você!',
        imageUrl: 'https://picsum.photos/seed/gift55/400/250'
    },
    {
        id: 'gift-56',
        title: 'Cota para as alianças',
        price: 'R$ 500,00',
        description: 'Um pedacinho do símbolo do nosso amor será graças a você. Um presente para a vida toda.',
        funnyNote: 'Carregaremos um pedaço da sua generosidade em nossos dedos para sempre. Obrigado por fazer parte deste símbolo tão especial.',
        imageUrl: 'https://picsum.photos/seed/gift56/400/250'
    },
    {
        id: 'gift-57',
        title: 'Caixinha de som bluetooth',
        price: 'R$ 200,00',
        description: 'Para levarmos nossa trilha sonora para todos os cantos da casa (e talvez irritar um pouco os vizinhos).',
        funnyNote: 'A trilha sonora da nossa vida a dois agora é portátil! Obrigado por trazer mais música para nossos dias.',
        imageUrl: 'https://picsum.photos/seed/gift57/400/250'
    },
    {
        id: 'gift-58',
        title: 'Fundo para o "delivery" da semana',
        price: 'R$ 100,00',
        description: 'Para aqueles dias em que o cansaço vence a vontade de cozinhar. Um presente que salva vidas (e estômagos).',
        funnyNote: 'Você é o herói da nossa preguiça! Obrigado por garantir que não morreremos de fome nos dias corridos.',
        imageUrl: 'https://picsum.photos/seed/gift58/400/250'
    },
    {
        id: 'gift-59',
        title: 'Assinatura de um clube do livro',
        price: 'R$ 80,00',
        description: 'Para nos incentivar a ler mais e discutir sobre algo além de contas a pagar.',
        funnyNote: 'Nossa mente agradece! Obrigado por nos dar um motivo para ler mais e expandir nossos horizontes (e nossa estante).',
        imageUrl: 'https://picsum.photos/seed/gift59/400/250'
    },
    {
        id: 'gift-60',
        title: 'Um ferro de passar (o fim das roupas amassadas)',
        price: 'R$ 150,00',
        description: 'Para parecermos profissionais apresentáveis e não como se tivéssemos acabado de sair da cama.',
        funnyNote: 'Você declarou guerra às roupas amassadas em nosso nome! Nossa aparência profissional agradece imensamente.',
        imageUrl: 'https://picsum.photos/seed/gift60/400/250'
    },
    {
        id: 'gift-61',
        title: 'Cota para os docinhos da festa',
        price: 'R$ 35,00',
        description: 'Seja o patrocinador de um brigadeiro, um beijinho ou um bem-casado. A glicose agradece.',
        funnyNote: 'Você adoçou nossa festa! Vamos pensar em você a cada docinho delicioso que comermos. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift61/400/250'
    },
    {
        id: 'gift-62',
        title: 'Kit "faça você mesmo" de coquetéis',
        price: 'R$ 220,00',
        description: 'Para tentarmos ser nossos próprios bartenders e criarmos drinks mirabolantes (ou desastrosos).',
        funnyNote: 'Nossas noites de sexta nunca mais serão as mesmas! Prepare-se para ser nossa cobaia de drinks. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift62/400/250'
    },
    {
        id: 'gift-63',
        title: 'Um passeio de balão',
        price: 'R$ 800,00',
        description: 'Para começarmos nossa vida de casados nas alturas. Uma experiência inesquecível e com uma vista incrível.',
        funnyNote: 'Você está literalmente nos fazendo voar! Mal podemos esperar por essa aventura nas nuvens. Obrigado por um presente tão incrível!',
        imageUrl: 'https://picsum.photos/seed/gift63/400/250'
    },
    {
        id: 'gift-64',
        title: 'Vale "rodízio de pizza"',
        price: 'R$ 120,00',
        description: 'Porque não há problema que uma boa pizza não resolva. Patrocine nossa terapia gastronômica.',
        funnyNote: 'Você entende nossas prioridades! Obrigado por patrocinar a solução de todos os nossos futuros problemas: pizza!',
        imageUrl: 'https://picsum.photos/seed/gift64/400/250'
    },
    {
        id: 'gift-65',
        title: 'Uma furadeira (o poder em nossas mãos)',
        price: 'R$ 300,00',
        description: 'Para pendurar quadros, prateleiras e sentirmos o poder de fazer furos na parede sem pedir ajuda.',
        funnyNote: 'O poder de furar paredes é nosso! Obrigado por esta ferramenta que nos faz sentir invencíveis (e um pouco perigosos).',
        imageUrl: 'https://picsum.photos/seed/gift65/400/250'
    },
    {
        id: 'gift-66',
        title: 'A primeira parcela do carro novo',
        price: 'R$ 1.500,00',
        description: 'Uma ajuda gigantesca para sairmos do ponto A ao B com mais conforto e menos paradas no mecânico.',
        funnyNote: 'Uau! Você acelerou nosso sonho. Cada quilômetro rodado no carro novo terá um agradecimento especial a você!',
        imageUrl: 'https://picsum.photos/seed/gift66/400/250'
    },
    {
        id: 'gift-67',
        title: 'Cota para a lua de mel na praia',
        price: 'R$ 250,00',
        description: 'Ajude-nos a trocar o barulho da cidade pelo som das ondas. Protetor solar e caipirinha inclusos.',
        funnyNote: 'O som do mar está nos chamando, e você nos ajudou a atender! Um brinde à sua generosidade com os pés na areia.',
        imageUrl: 'https://picsum.photos/seed/gift67/400/250'
    },
    {
        id: 'gift-68',
        title: 'Um filtro de água (para bebermos água, e não cloro)',
        price: 'R$ 180,00',
        description: 'Um upgrade na nossa hidratação. Porque água da torneira com gosto de piscina não está com nada.',
        funnyNote: 'Nossos rins agradecem! Obrigado por garantir que nossa água seja pura e cristalina. Saúde!',
        imageUrl: 'https://picsum.photos/seed/gift68/400/250'
    },
    {
        id: 'gift-69',
        title: 'Kit de temperos exóticos',
        price: 'R$ 90,00',
        description: 'Para viajarmos pelo mundo sem sair da cozinha. Uma aventura gastronômica para o nosso dia a dia.',
        funnyNote: 'Nossa comida nunca mais será sem graça! Obrigado por apimentar nossa vida (literalmente).',
        imageUrl: 'https://picsum.photos/seed/gift69/400/250'
    },
    {
        id: 'gift-70',
        title: 'Um ano de anuidade do cartão de crédito',
        price: 'R$ 500,00',
        description: 'A parte chata de ter um cartão. Ajude-nos a adiar essa despesa e a gastar com coisas mais divertidas.',
        funnyNote: 'Você nos livrou de uma das taxas mais chatas da vida adulta! Agora podemos usar o limite com mais alegria. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift70/400/250'
    },
    {
        id: 'gift-71',
        title: 'Aulas de um novo idioma',
        price: 'R$ 600,00',
        description: 'Para planejarmos nossa próxima viagem internacional ou apenas para impressionar os amigos com frases em outra língua.',
        funnyNote: 'Merci! Grazie! Thank you! Nossa futura poliglotice é um presente seu. Prometemos não usar para fofocar sobre você.',
        imageUrl: 'https://picsum.photos/seed/gift71/400/250'
    },
    {
        id: 'gift-72',
        title: 'Cota para os bem-casados',
        price: 'R$ 50,00',
        description: 'O doce mais tradicional e delicioso. Garanta que ninguém saia da festa sem o seu.',
        funnyNote: 'Você é a garantia de que a tradição será cumprida! Obrigado por patrocinar o doce símbolo da nossa união.',
        imageUrl: 'https://picsum.photos/seed/gift72/400/250'
    },
    {
        id: 'gift-73',
        title: 'Um projetor para noites de cinema',
        price: 'R$ 700,00',
        description: 'Transforme nossa sala em um cinema particular. Pipoca por nossa conta!',
        funnyNote: 'Você transformou nossa parede branca na maior tela de cinema do bairro! As sessões serão épicas, graças a você.',
        imageUrl: 'https://picsum.photos/seed/gift73/400/250'
    },
    {
        id: 'gift-74',
        title: 'Kit "Churrasco de Domingo"',
        price: 'R$ 350,00',
        description: 'Com tudo o que temos direito: picanha, linguicinha, e um bom carvão. Só falta a farofa.',
        funnyNote: 'O cheiro de churrasco no domingo será em sua homenagem! Você é oficialmente o padrinho da nossa churrasqueira. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift74/400/250'
    },
    {
        id: 'gift-75',
        title: 'Fundo para impostos (IPVA, IPTU...)',
        price: 'R$ 400,00',
        description: 'A parte mais emocionante da vida adulta. Ajude-nos a não sermos procurados pelo leão.',
        funnyNote: 'Você nos salvou da mordida do leão! É o presente menos glamoroso e um dos mais importantes. Nossa gratidão é isenta de imposto.',
        imageUrl: 'https://picsum.photos/seed/gift75/400/250'
    },
    {
        id: 'gift-76',
        title: 'Duas bicicletas para passeios no parque',
        price: 'R$ 1.200,00',
        description: 'Para tentarmos ser um casal mais saudável e explorarmos o bairro sobre duas rodas.',
        funnyNote: 'Nossos passeios de fim de semana acabaram de ganhar um upgrade! Obrigado por nos incentivar a sair do sofá.',
        imageUrl: 'https://picsum.photos/seed/gift76/400/250'
    },
    {
        id: 'gift-77',
        title: 'Umidificador de ar',
        price: 'R$ 180,00',
        description: 'Para sobrevivermos ao tempo seco e respirarmos melhor. Nossa rinite agradece.',
        funnyNote: 'Nossas narinas estão em festa! Obrigado por trazer um clima de floresta tropical para nosso apartamento.',
        imageUrl: 'https://picsum.photos/seed/gift77/400/250'
    },
    {
        id: 'gift-78',
        title: 'Cota para a gasolina do mês',
        price: 'R$ 300,00',
        description: 'Para irmos e virmos do trabalho sem ter um mini-infarto toda vez que olhamos para a bomba.',
        funnyNote: 'Você está literalmente nos movendo! Obrigado por garantir nossa locomoção e nossa paz de espírito no posto de gasolina.',
        imageUrl: 'https://picsum.photos/seed/gift78/400/250'
    },
    {
        id: 'gift-79',
        title: 'Máquina de lavar louça (a salvadora de casamentos)',
        price: 'R$ 2.000,00',
        description: 'A tecnologia que põe fim à eterna discussão sobre "de quem é a vez de lavar a louça".',
        funnyNote: 'Você não deu um presente, você fez uma intervenção de paz! Obrigado por salvar nosso casamento da pia suja.',
        imageUrl: 'https://picsum.photos/seed/gift79/400/250'
    },
    {
        id: 'gift-80',
        title: 'Fundo para o primeiro jantar de aniversário de casamento',
        price: 'R$ 300,00',
        description: 'Planejando com antecedência! Ajude-nos a comemorar nosso primeiro ano sem quebrar o cofrinho.',
        funnyNote: 'Você já está pensando no nosso futuro! Obrigado por garantir que nossa primeira comemoração seja especial.',
        imageUrl: 'https://picsum.photos/seed/gift80/400/250'
    },
    {
        id: 'gift-81',
        title: 'Uma Alexa (nossa nova melhor amiga)',
        price: 'R$ 350,00',
        description: 'Para nos dizer a previsão do tempo, tocar música e responder nossas perguntas mais aleatórias.',
        funnyNote: 'Agora temos alguém para conversar (e dar ordens)! Obrigado por trazer a inteligência artificial para o nosso lar.',
        imageUrl: 'https://picsum.photos/seed/gift81/400/250'
    },
    {
        id: 'gift-82',
        title: 'Cota para o vestido da noiva',
        price: 'R$ 200,00',
        description: 'O vestido dos sonhos tem seu preço. Ajude a noiva a se sentir como uma princesa por um dia.',
        funnyNote: 'A noiva se sentirá ainda mais deslumbrante sabendo que você ajudou a realizar este sonho. Muito obrigado pelo carinho!',
        imageUrl: 'https://picsum.photos/seed/gift82/400/250'
    },
    {
        id: 'gift-83',
        title: 'Cota para o traje do noivo',
        price: 'R$ 150,00',
        description: 'Para garantir que o noivo esteja (pelo menos) quase tão elegante quanto a noiva.',
        funnyNote: 'O noivo promete estar à altura da noiva! Obrigado por ajudar a compor o visual deste dia tão especial.',
        imageUrl: 'https://picsum.photos/seed/gift83/400/250'
    },
    {
        id: 'gift-84',
        title: 'Um kit de malas de viagem',
        price: 'R$ 600,00',
        description: 'Para começarmos nossas aventuras pelo mundo com estilo e sem roupas amassadas.',
        funnyNote: 'Nossas futuras viagens serão muito mais chiques! Obrigado por nos equipar para explorar o mundo.',
        imageUrl: 'https://picsum.photos/seed/gift84/400/250'
    },
    {
        id: 'gift-85',
        title: 'Pagamento da internet por 3 meses',
        price: 'R$ 300,00',
        description: 'Garanta nossa conexão com o mundo exterior (e com os memes). Um presente para a nossa sanidade.',
        funnyNote: 'Três meses de memes, séries e videochamadas garantidos! Obrigado por nos manter online e conectados.',
        imageUrl: 'https://picsum.photos/seed/gift85/400/250'
    },
    {
        id: 'gift-86',
        title: 'Um frigobar para o quarto',
        price: 'R$ 800,00',
        description: 'Para ter água geladinha e snacks a um braço de distância durante as maratonas de séries. O cúmulo do luxo.',
        funnyNote: 'Você nos proporcionou o auge do conforto e da preguiça! Obrigado por este luxo que vai mudar nossas vidas.',
        imageUrl: 'https://picsum.photos/seed/gift86/400/250'
    },
    {
        id: 'gift-87',
        title: 'Cota para o buquê da noiva',
        price: 'R$ 80,00',
        description: 'Ajude a compor o arranjo de flores que a noiva carregará (e que as solteiras irão disputar).',
        funnyNote: 'As flores do buquê serão ainda mais especiais sabendo da sua contribuição. Obrigado por este gesto tão delicado!',
        imageUrl: 'https://picsum.photos/seed/gift87/400/250'
    },
    {
        id: 'gift-88',
        title: 'Um robô aspirador que passa pano',
        price: 'R$ 2.500,00',
        description: 'O próximo nível da automação doméstica. Para um chão sempre limpo, sem nenhum esforço.',
        funnyNote: 'Você aboliu o rodo e o pano de chão da nossa vida! Nossa coluna agradece eternamente por este presente dos deuses da tecnologia.',
        imageUrl: 'https://picsum.photos/seed/gift88/400/250'
    },
    {
        id: 'gift-89',
        title: 'Fundo "Adote um Animal de Estimação"',
        price: 'R$ 400,00',
        description: 'Estamos pensando em aumentar a família com um membro de quatro patas. Ajude com os custos iniciais.',
        funnyNote: 'Você pode ser o padrinho/madrinha do nosso futuro pet! Obrigado por apoiar o crescimento da nossa família.',
        imageUrl: 'https://picsum.photos/seed/gift89/400/250'
    },
    {
        id: 'gift-90',
        title: 'Vale "Manutenção do Ar Condicionado"',
        price: 'R$ 250,00',
        description: 'Para garantir um verão fresco e sem espirros. Um investimento na nossa qualidade de vida.',
        funnyNote: 'Você garantiu nosso frescor no verão! Obrigado por nos salvar do calor e das alergias.',
        imageUrl: 'https://picsum.photos/seed/gift90/400/250'
    },
    {
        id: 'gift-91',
        title: 'Um jogo de cama chique',
        price: 'R$ 400,00',
        description: 'Para dormirmos como a realeza e acordarmos (um pouco) mais dispostos.',
        funnyNote: 'Nossas noites de sono acabaram de ficar mais luxuosas. Obrigado por nos proporcionar um sono de reis!',
        imageUrl: 'https://picsum.photos/seed/gift91/400/250'
    },
    {
        id: 'gift-92',
        title: 'Cota para o champagne do brinde',
        price: 'R$ 100,00',
        description: 'Seja parte do momento mais borbulhante da festa. Tim-tim!',
        funnyNote: 'O brinde principal da festa terá a sua energia! Ergueremos nossas taças em sua homenagem. Obrigado!',
        imageUrl: 'https://picsum.photos/seed/gift92/400/250'
    },
    {
        id: 'gift-93',
        title: 'Um liquidificador potente',
        price: 'R$ 280,00',
        description: 'Para vitaminas matinais, sopas e talvez até umas caipirinhas. Um multi-talentos na cozinha.',
        funnyNote: 'Nossas manhãs e nossas festas agradecem! Obrigado por esta ferramenta poderosa que vai liquidificar de tudo um pouco.',
        imageUrl: 'https://picsum.photos/seed/gift93/400/250'
    },
    {
        id: 'gift-94',
        title: 'Fundo para a primeira "grande" compra do mês',
        price: 'R$ 800,00',
        description: 'Aquela que enche a despensa e o carrinho. Uma ajuda e tanto para o orçamento inicial.',
        funnyNote: 'Você encheu nossa despensa e nosso coração de alegria! Obrigado por esta ajuda gigante no nosso primeiro mês.',
        imageUrl: 'https://picsum.photos/seed/gift94/400/250'
    },
    {
        id: 'gift-95',
        title: 'A inscrição em uma corrida de rua',
        price: 'R$ 180,00',
        description: 'Para nos motivar a correr juntos (ou um atrás do outro). Um empurrãozinho para a vida fitness.',
        funnyNote: 'Desafio aceito! Cruzaremos a linha de chegada pensando em você. Obrigado por nos incentivar a sermos mais saudáveis.',
        imageUrl: 'https://picsum.photos/seed/gift95/400/250'
    },
    {
        id: 'gift-96',
        title: 'Um purificador de ar',
        price: 'R$ 500,00',
        description: 'Para um ambiente mais limpo e livre de alergias. Nossa respiração agradece.',
        funnyNote: 'Respirar ar puro dentro de casa agora é uma realidade! Obrigado por cuidar da nossa saúde e bem-estar.',
        imageUrl: 'https://picsum.photos/seed/gift96/400/250'
    },
    {
        id: 'gift-97',
        title: 'Vale "lavagem completa do carro"',
        price: 'R$ 100,00',
        description: 'Para deixar nosso fiel escudeiro de quatro rodas brilhando. Porque ele também merece um dia de spa.',
        funnyNote: 'Nosso carro vai ficar um brinco! Obrigado por cuidar do nosso meio de transporte com tanto carinho.',
        imageUrl: 'https://picsum.photos/seed/gift97/400/250'
    },
    {
        id: 'gift-98',
        title: 'Cota para a lua de mel dos sonhos',
        price: 'R$ 1.000,00',
        description: 'Aquele empurrão final para uma viagem inesquecível. Sua contribuição fará história.',
        funnyNote: 'Uau! Você está nos enviando para o paraíso. Seremos eternamente gratos por esta experiência incrível que você está proporcionando.',
        imageUrl: 'https://picsum.photos/seed/gift98/400/250'
    },
    {
        id: 'gift-99',
        title: 'Kit de ferramentas de jardinagem',
        price: 'R$ 200,00',
        description: 'Para cuidarmos do nosso pequeno jardim com as ferramentas certas. Chega de usar colher como pá.',
        funnyNote: 'Nossas plantas agradecem o profissionalismo! Obrigado por nos equipar para sermos jardineiros de verdade.',
        imageUrl: 'https://picsum.photos/seed/gift99/400/250'
    },
    {
        id: 'gift-100',
        title: 'O último presente da lista!',
        price: 'R$ 1.000.000,00',
        description: 'Se você chegou até aqui, merece um prêmio. E nós merecemos este presente. 😉 Sonhar não custa nada, né?',
        funnyNote: 'A gente sabia que você era nosso convidado favorito! Mal podemos esperar para te contar o que faremos com nosso primeiro milhão. OBRIGADO!',
        imageUrl: 'https://picsum.photos/seed/gift100/400/250'
    }
];



interface GiftSectionProps {
  texts?: { [key: string]: string };
  products?: Product[];
  pixKey?: string;
}

export default function GiftSection({ texts = {}, products, pixKey }: GiftSectionProps) {
  const [selectedGift, setSelectedGift] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullListOpen, setIsFullListOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');

  const { toast } = useToast();
  
  const allGifts = products && products.length > 0 ? products : defaultGifts;
  const finalPixKey = pixKey || "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8";

  const handlePresentearClick = (gift: Product) => {
    setSelectedGift(gift);
    setPaymentConfirmed(false);
    setPixCopied(false);
    setGeneratedMessage('');
    setIsModalOpen(true);
    setIsFullListOpen(false); // Close full list if open
  };
  
  const handleCopyPix = () => {
    navigator.clipboard.writeText(finalPixKey);
    setPixCopied(true);
    toast({
        title: "PIX Copiado!",
        description: "Agora é só colar no app do seu banco e fazer a mágica.",
    });
    setTimeout(() => setPixCopied(false), 2000);
  }

  const handlePaymentConfirmation = async () => {
      setPaymentConfirmed(true);
      const message = selectedGift?.funnyNote || 'Seu presente deixou os noivos pulando de alegria! Muito obrigado!';
      setGeneratedMessage(message);
  }

  const GiftCard = ({ gift }: { gift: Product }) => {
    return (
        <Card className="text-left overflow-hidden group flex flex-col">
            <CardContent className="p-0 relative">
            {gift.imageUrl && (
                <Image
                src={gift.imageUrl}
                alt={gift.title}
                width={400}
                height={250}
                className="w-full h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
            )}
            <div className="absolute top-2 right-2 bg-background/80 text-foreground font-bold text-sm px-3 py-1 rounded-full shadow">{gift.price}</div>
            </CardContent>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg">{gift.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 h-12 flex-grow">{gift.description}</p>
                <Button className="w-full mt-4" onClick={() => handlePresentearClick(gift)}>
                    Quero dar esse!
                </Button>
            </div>
        </Card>
    );
  };


  return (
    <>
      <section id="gifts" className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-headline text-4xl md:text-5xl mb-4">{texts.gifts_title || 'Manda um PIX!'}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            {texts.gifts_subtitle || 'O melhor presente é sua presença. Mas se quiser nos ajudar a começar a vida sem dívidas, aceitamos contribuições. Nada de faqueiro, por favor!'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {allGifts.slice(0, 3).map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>

          <Button variant="outline" className="mt-12" onClick={() => setIsFullListOpen(true)}>
            {texts.gifts_button || 'Ver todos os presentes'}
          </Button>
        </div>
      </section>

      {/* Main Gift Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {!paymentConfirmed ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{selectedGift?.title}</DialogTitle>
                <DialogDescription>
                  Seu carinho em forma de PIX vai direto pro nosso cofrinho. Agradecemos de coração!
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm font-semibold">Chave PIX dos Noivos:</p>
                <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                  <p className="text-sm text-muted-foreground truncate flex-1">{finalPixKey}</p>
                  <Button variant="ghost" size="icon" onClick={handleCopyPix}>
                    {pixCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                 <div className="space-y-2">
                    <label htmlFor="payerName" className="text-sm font-medium">Seu nome (pra gente saber quem agradecer)</label>
                    <Input id="payerName" className="w-full" placeholder="Seu nome completo"/>
                </div>
              </div>
              <Button type="submit" className="w-full" onClick={handlePaymentConfirmation}>
                Já fiz o PIX!
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-success-icon">
                    <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeDasharray="24" strokeDashoffset="24" /></svg>
                </div>
                <h3 className="font-headline text-2xl">Show! Muito Obrigado!</h3>
                <p className="text-muted-foreground">{generatedMessage}</p>
                <Button onClick={() => setIsModalOpen(false)}>Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Full Gift List Modal */}
      <Dialog open={isFullListOpen} onOpenChange={setIsFullListOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline text-3xl">Nossa Lista de Desejos (Sincera)</DialogTitle>
                <DialogDescription>Escolha como você quer nos ajudar a começar essa nova fase.</DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mx-6 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allGifts.map((gift) => (
                        <GiftCard key={gift.id} gift={gift} />
                    ))}
                </div>
            </div>
             <DialogClose asChild>
                <Button variant="outline" className="mt-4">Fechar</Button>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
