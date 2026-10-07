(() => {
  'use strict';

  const pricing = Object.freeze({
    serviceCode: 'consultation',
    currency: 'USD',
    durations: Object.freeze({
      45: Object.freeze({ base: 50 }),
      60: Object.freeze({ base: 75 }),
      90: Object.freeze({ base: 125 }),
      120: Object.freeze({ base: 175 })
    })
  });

  globalThis.OOXME_CONSULTATION_PRICING = pricing;
  if (typeof module !== 'undefined' && module.exports) module.exports = pricing;
})();
