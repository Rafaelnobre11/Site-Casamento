// Funções para gerar o BR Code do PIX (Copia e Cola)
// Baseado na documentação oficial do Banco Central do Brasil
// https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf

type BRCodeParams = {
    pixKey: string;
    merchantName: string;
    merchantCity: string;
    txid?: string;
    value?: number;
    description?: string;
}

const formatValue = (id: string, value: string): string => {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
}

const formatDescription = (description: string | undefined): string => {
    if (!description) return '';

    const id = '05'; // Additional Data Field Template
    const template = formatValue('5F20', description); // Transaction description
    const length = template.length.toString().padStart(2, '0');

    return `${id}${length}${template}`;
}

const generateCRC16 = (payload: string): string => {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) & 0xFF) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) & 0xFFFF) ^ polynomial;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}


export const generateBRCode = ({
    pixKey,
    merchantName,
    merchantCity,
    txid = '***', // Default to a static transaction ID if not provided
    value,
    description
}: BRCodeParams): string => {

    // Payload Format Indicator (ID 00) - Obrigatório
    const payloadFormatIndicator = '000201';

    // Merchant Account Information (ID 26) - Obrigatório
    const gui = formatValue('00', 'br.gov.bcb.pix');
    const key = formatValue('01', pixKey);
    const merchantAccountInfo = formatValue('26', `${gui}${key}${formatDescription(description)}`);
    
    // Merchant Category Code (ID 52) - Obrigatório
    const merchantCategoryCode = '52040000';

    // Transaction Currency (ID 53) - Obrigatório (986 = BRL)
    const transactionCurrency = '5303986';

    // Transaction Amount (ID 54) - Opcional
    const transactionAmount = value ? formatValue('54', value.toFixed(2)) : '';
    
    // Country Code (ID 58) - Obrigatório
    const countryCode = '5802BR';

    // Merchant Name (ID 59) - Obrigatório
    const merchantNameFormatted = formatValue('59', merchantName.substring(0, 25));

    // Merchant City (ID 60) - Obrigatório
    const merchantCityFormatted = formatValue('60', merchantCity.substring(0, 15));

    // Additional Data Field Template (ID 62) - Obrigatório
    const txidFormatted = formatValue('05', txid);
    const additionalData = formatValue('62', txidFormatted);

    // Concatena tudo
    const payload = `${payloadFormatIndicator}${merchantAccountInfo}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantNameFormatted}${merchantCityFormatted}${additionalData}6304`;

    // Calcula o CRC16 e adiciona ao final
    const crc = generateCRC16(payload);

    return `${payload}${crc}`;
}
