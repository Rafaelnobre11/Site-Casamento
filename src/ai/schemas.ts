import { z } from 'zod';

/**
 * Esquema para validar a resposta da IA ao gerar textos para presentes.
 * Garante que a IA retorne uma descrição e uma nota de agradecimento como strings.
 */
export const GiftTextGeneration = z.object({
  description: z.string().describe('A descrição divertida e criativa para o presente.'),
  thankYouNote: z.string().describe('A nota de agradecimento bem-humorada para quem deu o presente.'),
});
