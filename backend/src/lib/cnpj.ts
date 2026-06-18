// Validação de CNPJ (formato + dígitos verificadores). Só PJ — não aceitamos CPF.
export function onlyDigits(s: string): string {
  return (s || '').replace(/\D/g, '');
}

export function isValidCnpj(input: string): boolean {
  const c = onlyDigits(input);
  if (c.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(c)) return false; // todos iguais

  const calc = (base: string, weights: number[]) => {
    const sum = base.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(c.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(c.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === parseInt(c[12]) && d2 === parseInt(c[13]);
}

/** Formata 14 dígitos como 00.000.000/0000-00 */
export function formatCnpj(input: string): string {
  const c = onlyDigits(input);
  if (c.length !== 14) return input;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}
