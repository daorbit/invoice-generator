const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const SCALES = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

const CURRENCY_WORDS: Record<string, [string, string]> = {
  INR: ['Rupees', 'Paise'],
  USD: ['US Dollars', 'Cents'],
  EUR: ['Euros', 'Cents'],
  GBP: ['Pounds', 'Pence'],
  AED: ['UAE Dirhams', 'Fils'],
  AUD: ['Australian Dollars', 'Cents'],
  CAD: ['Canadian Dollars', 'Cents'],
  SGD: ['Singapore Dollars', 'Cents'],
};

function belowHundred(n: number): string {
  if (n < 20) return ONES[n];
  return [TENS[Math.floor(n / 10)], ONES[n % 10]].filter(Boolean).join(' ');
}

function belowThousand(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return [hundreds ? `${ONES[hundreds]} Hundred` : '', rest ? belowHundred(rest) : ''].filter(Boolean).join(' ');
}

function indianWords(n: number): string {
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thousand = Math.floor((n % 100_000) / 1000);
  const rest = n % 1000;
  return [
    crore ? `${indianWords(crore)} Crore` : '',
    lakh ? `${belowHundred(lakh)} Lakh` : '',
    thousand ? `${belowHundred(thousand)} Thousand` : '',
    rest ? belowThousand(rest) : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function internationalWords(n: number): string {
  const parts: string[] = [];
  let scale = 0;
  let remaining = n;
  while (remaining > 0 && scale < SCALES.length) {
    const group = remaining % 1000;
    if (group) parts.unshift([belowThousand(group), SCALES[scale]].filter(Boolean).join(' '));
    remaining = Math.floor(remaining / 1000);
    scale += 1;
  }
  return parts.join(' ');
}

export function amountInWords(value: number, currency: string): string {
  const [major, minor] = CURRENCY_WORDS[currency] ?? [currency, 'Cents'];
  const cents = Math.round(Math.abs(value) * 100);
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  const spell = currency === 'INR' ? indianWords : internationalWords;
  const words = whole === 0 ? 'Zero' : spell(whole);
  const fractionText = fraction ? ` and ${belowHundred(fraction)} ${minor}` : '';
  return `${value < 0 ? 'Minus ' : ''}${major} ${words}${fractionText} Only`;
}
