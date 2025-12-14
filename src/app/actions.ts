'use server';
import { generateCharmingRSVPMessage } from '@/ai/flows/generate-charming-rsvp-message';
import { generateWittyDeclineMessage } from '@/ai/flows/generate-witty-decline-message';
import { generateGiftText as genGiftText } from '@/ai/flows/generate-gift-text';


// RSVP Actions
export async function getCharmingMessage(input: { guestName: string; numberOfAttendees: number; }) {
    try {
        const result = await generateCharmingRSVPMessage(input);
        return { success: true, message: result.message };
    } catch (error) {
        console.error("AI error (getCharmingMessage):", error);
        return { success: false, error: "Could not generate message. Please try again.", message: "Sua presença está confirmada e isso é o que mais importa! Nos vemos na festa!" };
    }
}

export async function getWittyDeclineMessage(input: { guestName: string; }) {
    try {
        const result = await generateWittyDeclineMessage(input);
        return { success: true, message: result.message };
    } catch (error) {
        console.error("AI error (getWittyDeclineMessage):", error);
        return { success: false, error: "Could not generate message. Please try again.", message: "Sentiremos sua falta, mas agradecemos por nos avisar. Tudo de bom!" };
    }
}


// Shop Actions
interface GenerateGiftTextProps {
    giftTitle: string;
}

export async function generateGiftText({ giftTitle }: GenerateGiftTextProps) {
    try {
        const result = await genGiftText({ giftTitle });
        return { success: true, description: result.description, thankYouNote: result.thankYouNote };
    } catch (error) {
        console.error("AI error (generateGiftText):", error);
        return { success: false, error: "Could not generate texts. Please try again." };
    }
}
