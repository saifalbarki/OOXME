(() => {
  'use strict';

  const format = (value) => {
    const text = String(value).replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
    const match = text.match(/\d[\d,.'\s]*/);
    if (!match) return { prefix: text, amount: '', currency: '' };
    const digits = match[0].replace(/\D/g, '');
    const amount = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    const suffix = text.slice(match.index + match[0].length);
    const currency = /USD|دولار|\$/i.test(suffix) ? '$' : 'IQD';
    return { prefix: text.slice(0, match.index).trimEnd(), amount, currency };
  };

  globalThis.OOXME_PRICE_FORMAT = Object.freeze({ format });
})();
