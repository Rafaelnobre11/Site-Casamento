// Função para aplicar a máscara de telefone (XX) XXXXX-XXXX
export function maskPhone(value: string): string {
  // Remove tudo que não for número
  const digits = value.replace(/\D/g, "").slice(0, 11);

  // (XX
  if (digits.length <= 2) {
    return `(${digits}`;
  }

  // (XX) XXXXX
  if (digits.length <= 7) {
    return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  }

  // (XX) XXXXX-XXXX
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}
