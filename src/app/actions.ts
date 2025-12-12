// @/app/actions.ts
'use server';
import {
  generateCharmingRSVPMessage,
  type GenerateCharmingRSVPMessageInput,
} from '@/ai/flows/generate-charming-rsvp-message';

import {
    generateWittyDeclineMessage,
    type GenerateWittyDeclineMessageInput,
} from '@/ai/flows/generate-witty-decline-message';

import {
    generateGiftText as generateGiftTextFlow,
    type GenerateGiftTextInput,
} from '@/ai/flows/generate-gift-text';


export async function getCharmingMessage(
  input: GenerateCharmingRSVPMessageInput
) {
  try {
    const result = await generateCharmingRSVPMessage(input);
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error generating charming message:', error);
    // Provide a graceful fallback message
    return {
      success: true, // Still success, just a fallback
      message:
        input.giftName 
        ? "Uau! Seu presente é incrível e já estamos comemorando. Muito obrigado pelo carinho!"
        : "Oba! Presença confirmadíssima. Já estamos ansiosos para celebrar com você!",
    };
  }
}

export async function getWittyDeclineMessage(
    input: GenerateWittyDeclineMessageInput
) {
    try {
        const result = await generateWittyDeclineMessage(input);
        return { success: true, message: result.message };
    } catch (error) {
        console.error('Error generating witty decline message:', error);
        return {
            success: true, // Still success, just a fallback
            message:
                "Que pena! Sentiremos sua falta na festa. Esperamos poder celebrar com você em uma próxima oportunidade.",
        };
    }
}


export async function generateGiftText(input: GenerateGiftTextInput) {
  try {
    const result = await generateGiftTextFlow(input);
    return { 
        success: true, 
        description: result.description,
        thankYouNote: result.thankYouNote 
    };
  } catch (error: any) {
    console.error('Error generating gift text with AI:', error);
    return {
      success: false,
      error: 'A IA está tirando uma folga e não conseguiu criar os textos. Tente novamente.',
    };
  }
}
