
import type { Product } from '@/types/siteConfig';
import { PlaceHolderImages } from './placeholder-images';

const getGiftImageUrl = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  return image?.imageUrl || `https://picsum.photos/seed/${id}/400/250`;
};

export const defaultGifts: Product[] = [
  {
    id: 'gift-1',
    title: 'Cota para a Lua de Mel',
    price: 'R$ 250',
    description: 'Ajude-nos a fugir de tudo (principalmente dos boletos) após a festa. Prometemos mandar um postal.',
    imageUrl: getGiftImageUrl('gift-cota-lua-de-mel'),
    funnyNote: 'Você está oficialmente no nosso "caderninho de pessoas incríveis". Cada paisagem que virmos, lembraremos de você!',
  },
  {
    id: 'gift-2',
    title: '1 Hora de Open Bar',
    price: 'R$ 100',
    description: 'Garanta a alegria com mais uma hora de bons drinks. Um investimento com retorno garantido na pista de dança.',
    imageUrl: getGiftImageUrl('gift-open-bar'),
    funnyNote: 'Boaaa! Você é um investidor-anjo da nossa felicidade etílica. O primeiro brinde será em sua homenagem!',
  },
  {
    id: 'gift-3',
    title: 'Kit Anti-Ressaca',
    price: 'R$ 50',
    description: 'Para sobreviver à nossa própria festa e começar a vida de casados sem dor de cabeça.',
    imageUrl: getGiftImageUrl('gift-anti-ressaca'),
    funnyNote: 'Herói(na)! Sua generosidade será lembrada na manhã seguinte. Prometemos não te ligar de madrugada.',
  },
   {
    id: 'gift-4',
    title: 'Jantar Romântico (sem queimar a casa)',
    price: 'R$ 150',
    description: 'Patrocine nosso primeiro jantar chique como casados. Prometemos não usar o extintor como peça de decoração.',
    imageUrl: getGiftImageUrl('gift-jantar-romantico'),
    funnyNote: 'Obrigado! Graças a você, nosso primeiro jantar não será pão com ovo. Você salvou nosso casamento do tédio gastronômico.',
  },
  {
    id: 'gift-5',
    title: 'Curso de Culinária (Urgente)',
    price: 'R$ 200',
    description: 'Um investimento para evitar uma vida inteira de delivery e miojo. A saúde do casal agradece.',
    imageUrl: getGiftImageUrl('gift-curso-culinaria'),
    funnyNote: 'Ufa! Você salvou nosso futuro de uma vida de pratos queimados. Estamos emocionados com sua generosidade!',
  },
  {
    id: 'gift-6',
    title: 'Assinatura de Streaming (para evitar brigas)',
    price: 'R$ 45',
    description: 'Para as noites de preguiça no sofá, garantindo a paz na hora de escolher o que assistir.',
    imageUrl: getGiftImageUrl('gift-streaming'),
    funnyNote: 'Agora sim! Você garantiu que teremos algo para fazer além de olhar um para a cara do outro. Obrigado!',
  },
  {
    id: 'gift-7',
    title: 'Paciência para o Noivo',
    price: 'R$ 75',
    description: 'Um item de necessidade básica para a harmonia do lar. A noiva agradece em dobro.',
    imageUrl: getGiftImageUrl('gift-paciencia-noivo'),
    funnyNote: 'Você fez uma contribuição valiosíssima para a paz deste lar. A noiva agradece em dobro. Prometemos usar com sabedoria!',
  },
  {
    id: 'gift-8',
    title: 'Um Robô Aspirador',
    price: 'R$ 300',
    description: 'Para que a discussão sobre "quem limpa a casa" não seja nossa primeira briga de casados.',
    imageUrl: getGiftImageUrl('gift-robo-aspirador'),
    funnyNote: 'Nosso casamento agradece! Menos uma briga para se preocupar. Você é um verdadeiro padrinho da paz!',
  },
];
