(() => {
  'use strict';

  const pricing = Object.freeze({
    serviceCode: 'consultation',
    currency: 'USD',
    launchDiscountPercent: 60,
    durations: Object.freeze({
      45: Object.freeze({ base: 50, launch: 20 }),
      60: Object.freeze({ base: 75, launch: 30 }),
      90: Object.freeze({ base: 125, launch: 50 }),
      120: Object.freeze({ base: 175, launch: 70 })
    })
  });

  globalThis.OOXME_CONSULTATION_PRICING = pricing;
  if (typeof module !== 'undefined' && module.exports) module.exports = pricing;
})();
