(() => {
  const root = document.documentElement;
  const content = document.querySelector('[data-privacy-content]');
  const copy = {
    en: {
      title: 'Privacy Policy', label: 'OOXME', intro: 'This policy explains how OOXME handles personal information when you use our website or book a consultation.', home: 'Back to home',
      sections: [
        ['Information we collect', ['We collect the information you provide when you contact OOXME or request a consultation. This can include your name, email address, phone number, consultation topic, business sector, additional information, selected date and time, payment method, and promotion or offer details.']],
        ['How we use information', ['We use this information to respond to enquiries, arrange and manage consultations, confirm bookings, provide reminders and service communications, and maintain our business records.']],
        ['Booking and contact information', ['Booking details are used to check availability, reserve a consultation time, prepare for the conversation, and communicate with you about the booking. Please provide only information that is relevant to your request.']],
        ['Google services', ['OOXME uses Google Calendar to check availability and create consultation events. Booking information may be included in Calendar events. OOXME may use Gmail to send booking confirmations and operational messages, and Google Drive to store booking records when that storage is enabled.']],
        ['WhatsApp and Meta', ['If you contact OOXME through WhatsApp or choose WhatsApp communications, OOXME may use WhatsApp Business and Meta WhatsApp Cloud API to send booking-related messages and reminders. WhatsApp and Meta process information under their own terms and privacy policies.']],
        ['Database and storage', ['Booking records are stored in OOXME’s database and may also be stored in the Google services described above. Access is limited to people and service providers who need it to operate, support, or improve OOXME’s services.']],
        ['Cookies and local browser storage', ['The current website does not use analytics tools or advertising cookies identified in its implementation. It may use local browser storage to remember language preference and keep booking progress during your visit.']],
        ['Retention and protection', ['OOXME keeps information for as long as reasonably needed for consultations, communications, records, and legitimate operational purposes. We use reasonable administrative and technical measures to protect information, but no online service can guarantee absolute security.']],
        ['Third-party services', ['Our website and booking operations may rely on third-party providers, including Vercel for hosting, Google services for Calendar, Gmail, and Drive, and Meta/WhatsApp for messaging. Those providers process information according to their own policies and service terms.']],
        ['Your choices and contact', ['You may ask about the personal information OOXME holds about you, request correction, or ask us to delete information where appropriate. To make a request or ask a privacy question, contact ', { link: 'hello@ooxme.com' }, '.']]
      ]
    },
    ar: {
      title: 'سياسة الخصوصية', label: 'أوكسوم', intro: 'توضح هذه السياسة كيفية تعامل أوكسوم مع المعلومات الشخصية عند استخدام موقعنا أو حجز استشارة.', home: 'العودة إلى الرئيسية',
      sections: [
        ['المعلومات التي نجمعها', ['نجمع المعلومات التي تقدمها عند التواصل مع أوكسوم أو طلب استشارة. وقد تشمل الاسم والبريد الإلكتروني ورقم الهاتف وموضوع الاستشارة وقطاع العمل والمعلومات الإضافية والتاريخ والوقت المختارين وطريقة الدفع وتفاصيل العروض أو الرموز الترويجية.']],
        ['كيفية استخدام المعلومات', ['نستخدم هذه المعلومات للرد على الاستفسارات وتنظيم وإدارة الاستشارات وتأكيد الحجوزات وتقديم التذكيرات والاتصالات المتعلقة بالخدمة والاحتفاظ بسجلات أعمالنا.']],
        ['معلومات الحجز والتواصل', ['تُستخدم تفاصيل الحجز للتحقق من التوفر وحجز وقت الاستشارة والاستعداد للمحادثة والتواصل معك بشأن الحجز. يرجى تقديم المعلومات ذات الصلة بطلبك فقط.']],
        ['خدمات Google', ['تستخدم أوكسوم تقويم Google للتحقق من التوفر وإنشاء أحداث الاستشارات. قد تُدرج معلومات الحجز في أحداث التقويم. وقد نستخدم Gmail لإرسال تأكيدات الحجز والرسائل التشغيلية، وGoogle Drive لحفظ سجلات الحجز عند تفعيل هذه المساحة.']],
        ['واتساب وMeta', ['إذا تواصلت مع أوكسوم عبر واتساب أو اخترت التواصل من خلاله، فقد نستخدم WhatsApp Business وMeta WhatsApp Cloud API لإرسال الرسائل والتذكيرات المتعلقة بالحجز. تعالج WhatsApp وMeta المعلومات وفقاً لشروطهما وسياسات الخصوصية الخاصة بهما.']],
        ['قاعدة البيانات والتخزين', ['تُخزن سجلات الحجز في قاعدة بيانات أوكسوم، وقد تُخزن أيضاً في خدمات Google الموضحة أعلاه. يقتصر الوصول عليها على الأشخاص ومقدمي الخدمات الذين يحتاجون إليها لتشغيل خدمات أوكسوم أو دعمها أو تحسينها.']],
        ['ملفات تعريف الارتباط والتخزين المحلي', ['لا يستخدم الموقع الحالي أدوات تحليلات أو ملفات تعريف ارتباط إعلانية محددة في تنفيذه. وقد يستخدم التخزين المحلي في المتصفح لتذكر تفضيل اللغة والاحتفاظ بتقدم الحجز أثناء زيارتك.']],
        ['الاحتفاظ والحماية', ['تحتفظ أوكسوم بالمعلومات للمدة اللازمة بصورة معقولة للاستشارات والتواصل والسجلات والأغراض التشغيلية المشروعة. نستخدم إجراءات إدارية وتقنية معقولة لحماية المعلومات، ولكن لا يمكن لأي خدمة عبر الإنترنت ضمان الأمان المطلق.']],
        ['الخدمات الخارجية', ['قد تعتمد عمليات الموقع والحجز على مزودي خدمات خارجيين، بما في ذلك Vercel للاستضافة وخدمات Google للتقويم وGmail وDrive، وMeta/WhatsApp للمراسلة. يعالج هؤلاء المزودون المعلومات وفقاً لسياساتهم وشروط خدمتهم الخاصة.']],
        ['حقوقك والتواصل معنا', ['يمكنك الاستفسار عن المعلومات الشخصية التي تحتفظ بها أوكسوم عنك، أو طلب تصحيحها، أو طلب حذفها عند الاقتضاء. لتقديم طلب أو سؤال متعلق بالخصوصية، تواصل معنا عبر ', { link: 'hello@ooxme.com' }, '.']]
      ]
    }
  };
  const renderPart = (part) => typeof part === 'string' ? part : `<a href="mailto:${part.link}">${part.link}</a>`;
  const applyLanguage = (language) => {
    const page = copy[language];
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = `${page.title} | ${language === 'ar' ? 'أوكسوم' : 'OOXME'}`;
    content.innerHTML = `<p class="master-panel-label">${page.label}</p><h1>${page.title}</h1><p class="privacy-policy-intro">${page.intro}</p><div class="privacy-policy-sections">${page.sections.map(([heading, paragraphs]) => `<section class="privacy-policy-section"><h2>${heading}</h2>${paragraphs.map((paragraph) => `<p>${Array.isArray(paragraph) ? paragraph.map(renderPart).join('') : paragraph}</p>`).join('')}</section>`).join('')}</div><p class="privacy-policy-footer"><a href="index.html">${page.home}</a></p>`;
    document.querySelectorAll('[data-language-toggle]').forEach((button) => button.setAttribute('aria-label', language === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'));
    try { localStorage.setItem('ooxme-language', language); } catch (_) {}
  };
  let language = 'en';
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar')));
  window.addEventListener('storage', (event) => { if (event.key === 'ooxme-language') applyLanguage(event.newValue === 'ar' ? 'ar' : 'en'); });
})();
