(() => {
  const root = document.documentElement;
  const pages = [...document.querySelectorAll('[data-gallery]')];
  if (!pages.length) return;

  // Gallery sections keep the frame captured at route entry. Mobile browser
  // chrome can change the live viewport height while scrolling; that must not
  // resize or redistribute either project section after it has rendered.
  const frameProbe = document.createElement('div');
  frameProbe.setAttribute('aria-hidden', 'true');
  frameProbe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:100dvh;overflow:hidden;';
  document.documentElement.appendChild(frameProbe);
  const stableSectionHeight = Math.max(1, Math.round(frameProbe.getBoundingClientRect().height || 0));
  frameProbe.remove();
  const stableViewportHeight = Math.max(
    1,
    Math.round(window.innerHeight || document.documentElement.clientHeight || 1)
  );
  root.style.setProperty('--gallery-section-height', `${stableSectionHeight}px`);

  const projects = {
    alfares: {
    initialAsset: '07.png',
    preferredOrder: ['07.png', '02.png', '11.png', '06.png', '10.png', '01.png', '03.png', '04.png', '05.png', '08.png', '09.png'],
    en: {
      title: 'Alfares Transport',
      sectorType: 'Transport - Brand',
      descriptions: {
        '01.png': 'The brand was built as a complete visual system, preserving clarity and consistency across transport, delivery, and packaging applications.',
        '02.png': 'The brand was built as a complete visual system, preserving clarity and consistency across transport, delivery, and packaging applications.',
        '03.png': 'The brand was built as a complete visual system, preserving clarity and consistency across transport, delivery, and packaging applications.',
        '04.png': 'The brand was built as a complete visual system, preserving clarity and consistency across transport, delivery, and packaging applications.',
        '05.png': 'The brand was built as a complete visual system, preserving clarity and consistency across transport, delivery, and packaging applications.',
        '06.png': 'The logo was built on a geometric grid with balanced proportions, using connected standard units to control the composition and achieve visual precision and balance.',
        '07.png': 'The logo was designed to remain clear and cohesive in one color, working effectively across violet, indigo, black, and light backgrounds.',
        '08.png': 'A consistent Arabic and English type system was selected with aligned weights and proportions, preserving clear communication and one unified brand in both languages.',
        '09.png': 'The logo unites two letters within one geometric symbol, with connected curves reflecting movement and continuity in keeping with the transport sector.',
        '10.png': 'The pattern was derived from the logo structure and repeats its elements in a regular rhythm, expanding the brand language across different applications.',
        '11.png': 'The color system combines deep indigo and violet in a connected gradient, giving the brand a sense of movement and precision with a clear, distinctive visual presence.'
      }
    },
    ar: {
      title: 'الفارس للنقل',
      sectorType: 'قطاع النقل - علامة تجارية',
      descriptions: {
        '01.png': 'تم بناء العلامة التجارية بنظام بصري متكامل، يحافظ على وضوحها واتساقها عبر تطبيقات النقل والتوصيل والتغليف المختلفة.',
        '02.png': 'تم بناء العلامة التجارية بنظام بصري متكامل، يحافظ على وضوحها واتساقها عبر تطبيقات النقل والتوصيل والتغليف المختلفة.',
        '03.png': 'تم بناء العلامة التجارية بنظام بصري متكامل، يحافظ على وضوحها واتساقها عبر تطبيقات النقل والتوصيل والتغليف المختلفة.',
        '04.png': 'تم بناء العلامة التجارية بنظام بصري متكامل، يحافظ على وضوحها واتساقها عبر تطبيقات النقل والتوصيل والتغليف المختلفة.',
        '05.png': 'تم بناء العلامة التجارية بنظام بصري متكامل، يحافظ على وضوحها واتساقها عبر تطبيقات النقل والتوصيل والتغليف المختلفة.',
        '06.png': 'تم بناء الشعار وفق شبكة هندسية ونسب متوازنة، تعتمد وحدات قياسية مترابطة لضبط التكوين وتحقيق الدقة والاتزان البصري.',
        '07.png': 'تم تصميم الشعار ليحافظ على وضوحه وتماسكه بلون واحد، ويعمل بكفاءة على الخلفيات البنفسجية والنيلية والسوداء والفاتحة.',
        '08.png': 'تم اختيار نظام خطي عربي وانجليزي متناسق في الاوزان والنسب، ليحافظ على وضوح التواصل ووحدة العلامة في اللغتين.',
        '09.png': 'يجمع الشعار حرفين ضمن رمز هندسي واحد، بانحناءات مترابطة تعكس الحركة والاستمرارية بما ينسجم مع طبيعة قطاع النقل.',
        '10.png': 'تم اشتقاق النمط من بنية الشعار وتكرار عناصره بايقاع منتظم، لتوسيع لغة العلامة والحفاظ على حضورها عبر التطبيقات المختلفة.',
        '11.png': 'يجمع النظام اللوني النيلي الداكن والبنفسجي بتدرج مترابط، ليمنح العلامة احساسا بالحركة والدقة مع حضور بصري واضح ومميز.'
      }
    }
    },
    alsebteen: {
      initialAsset: '07.png',
      preferredOrder: ['07.png', '02.png', '11.png', '06.png', '10.png', '01.png', '03.png', '04.png', '05.png', '08.png', '09.png'],
      en: {
        title: 'Al-Sibtain',
        sectorType: 'Daily Shopping - Brand',
        descriptions: {
          '01.png': 'The identity pairs a four-part leaf mark with a grocery scene, making freshness, variety, and daily shopping visible from the first presentation.',
          '02.png': 'The identity is applied across grocery products and store materials, keeping the green-and-yellow mark clear within everyday shopping contexts.',
          '03.png': 'The green-and-yellow system carries through the produce aisle, using repeated color and branding to create a coherent retail environment.',
          '04.png': 'The identity is applied across grocery products and store materials, keeping the green-and-yellow mark clear within everyday shopping contexts.',
          '05.png': 'The identity is applied across grocery products and store materials, keeping the green-and-yellow mark clear within everyday shopping contexts.',
          '06.png': 'The logo is constructed from four rounded leaf forms on a measured grid, with repeated curves creating a balanced, memorable retail symbol.',
          '07.png': 'The mark is tested in full color, monochrome, and reversed applications so its leaf structure remains clear across brand backgrounds.',
          '08.png': 'The Arabic and English wordmarks use a coordinated geometric sans system, aligning weight and proportion for one bilingual retail identity.',
          '09.png': 'The concept connects the four-part mark with leaves and growth, expressing freshness, abundance, and positive energy for daily shopping.',
          '10.png': 'A repeating leaf pattern extends the logo into a flexible graphic texture, supporting packaging and retail applications without losing recognition.',
          '11.png': 'The palette combines deep green, fresh green, and warm yellow, with a soft green-to-yellow gradient that suggests freshness and energy.'
        }
      },
      ar: {
        title: 'السبطين',
        sectorType: 'التسوق اليومي - علامة تجارية',
        descriptions: {
          '01.png': 'يجمع النظام البصري رمزاً نباتياً من أربعة أجزاء مع مشهد للمواد الغذائية، ليظهر النضارة والتنوع وروح التسوق اليومي منذ العرض الأول.',
          '02.png': 'يطبق النظام البصري على المنتجات ومواد المتجر، مع الحفاظ على وضوح الرمز الأخضر والأصفر داخل سياقات التسوق اليومية.',
          '03.png': 'يمتد النظام الأخضر والأصفر داخل قسم الخضروات، ليوحد اللون والعلامة ويصنع بيئة متماسكة لتجربة التسوق.',
          '04.png': 'يطبق النظام البصري على المنتجات ومواد المتجر، مع الحفاظ على وضوح الرمز الأخضر والأصفر داخل سياقات التسوق اليومية.',
          '05.png': 'يطبق النظام البصري على المنتجات ومواد المتجر، مع الحفاظ على وضوح الرمز الأخضر والأصفر داخل سياقات التسوق اليومية.',
          '06.png': 'بني الشعار من أربع وحدات نباتية مستديرة على شبكة محسوبة، لتصنع الانحناءات المتكررة رمزاً متوازناً وسهل التذكر.',
          '07.png': 'اختبر الرمز بالألوان الكاملة والأحادية والمعكوسة، ليحافظ تكوينه النباتي على الوضوح فوق خلفيات العلامة المختلفة.',
          '08.png': 'اختير نظام خطي عربي وإنجليزي هندسي ومتناسق، يوحد الأوزان والنسب ويحافظ على هوية تجارية واحدة باللغتين.',
          '09.png': 'يربط المفهوم الرمز المؤلف من أربعة أجزاء بمعاني الأوراق والنمو، ليعبر عن النضارة والوفرة والطاقة الإيجابية في التسوق اليومي.',
          '10.png': 'يمد النمط النباتي لغة الشعار إلى نسيج بصري مرن، يدعم التغليف وتطبيقات المتجر مع الحفاظ على وضوح العلامة.',
          '11.png': 'يجمع النظام اللوني الأخضر الداكن والأخضر المنعش والأصفر الدافئ بتدرج أخضر إلى أصفر يوحي بالنضارة والطاقة.'
        }
      }
    },
    velvet: {
      initialAsset: '07.png',
      preferredOrder: ['07.png', '02.png', '11.png', '06.png', '10.png', '01.png', '03.png', '04.png', '05.png', '08.png', '09.png'],
      en: {
        title: 'Velvet Flora',
        sectorType: 'Online Stores - Visual Identity',
        descriptions: {
          '01.png': 'The identity presents an eight-part floral mark with a refined wordmark on a gift bag, establishing a soft, elegant language for online flower retail.',
          '02.png': 'The identity is applied across bags, baskets, bouquets, and wrapping, keeping the floral mark clear while making each flower delivery feel refined and personal.',
          '03.png': 'The identity is applied across bags, baskets, bouquets, and wrapping, keeping the floral mark clear while making each flower delivery feel refined and personal.',
          '04.png': 'The identity is applied across bags, baskets, bouquets, and wrapping, keeping the floral mark clear while making each flower delivery feel refined and personal.',
          '05.png': 'The identity is applied across bags, baskets, bouquets, and wrapping, keeping the floral mark clear while making each flower delivery feel refined and personal.',
          '06.png': 'The logo is built from eight symmetrical geometric petals converging around a shared center, creating balance, rhythm, and a recognizable floral form.',
          '07.png': 'The mark is tested in color, monochrome, and reversed forms so the eight-part structure remains clear across light and dark brand surfaces.',
          '08.png': 'The Arabic and English wordmarks use a coordinated rounded type system, aligning weight and proportion for one graceful bilingual identity.',
          '09.png': 'The concept draws from the tulip flower and its balanced symmetry, while the pink-to-burgundy gradient adds warmth, femininity, and depth.',
          '10.png': 'A repeating floral mark extends the identity into a restrained pattern, supporting wrapping and online-store touchpoints without losing recognition.',
          '11.png': 'The palette combines soft pink and deep burgundy in a connected gradient, balancing delicacy with a richer floral presence.'
        }
      },
      ar: {
        title: 'فيلفلت فلورا',
        sectorType: 'المتاجر اونلاين - هوية بصرية',
        descriptions: {
          '01.png': 'يقدم النظام البصري رمزاً نباتياً من ثمانية أجزاء مع كتابة متزنة على حقيبة هدايا، ليؤسس لغة ناعمة وأنيقة لمتجر الزهور عبر الإنترنت.',
          '02.png': 'يطبق النظام البصري على الحقائب والسلال والباقات والتغليف، مع الحفاظ على وضوح الرمز النباتي ومنح كل طلب زهور إحساساً راقياً وشخصياً.',
          '03.png': 'يطبق النظام البصري على الحقائب والسلال والباقات والتغليف، مع الحفاظ على وضوح الرمز النباتي ومنح كل طلب زهور إحساساً راقياً وشخصياً.',
          '04.png': 'يطبق النظام البصري على الحقائب والسلال والباقات والتغليف، مع الحفاظ على وضوح الرمز النباتي ومنح كل طلب زهور إحساساً راقياً وشخصياً.',
          '05.png': 'يطبق النظام البصري على الحقائب والسلال والباقات والتغليف، مع الحفاظ على وضوح الرمز النباتي ومنح كل طلب زهور إحساساً راقياً وشخصياً.',
          '06.png': 'بني الشعار من ثماني بتلات هندسية متماثلة تلتقي حول مركز واحد، لتصنع توازناً وإيقاعاً وشكلاً زهرياً واضحاً.',
          '07.png': 'اختبر الرمز بالألوان والأحادية والمعكوسة، ليحافظ تكوينه المؤلف من ثمانية أجزاء على الوضوح فوق الأسطح الفاتحة والداكنة.',
          '08.png': 'يستخدم الاسمان العربي والإنجليزي نظاماً خطياً مستديراً ومتناسقاً، يوحد الأوزان والنسب ضمن هوية ثنائية اللغة رشيقة.',
          '09.png': 'ينطلق المفهوم من زهرة التوليب وتماثلها المتوازن، بينما يضيف التدرج من الوردي إلى العنابي دفئاً وأنوثة وعمقاً بصرياً.',
          '10.png': 'يمد تكرار الرمز الزهري الهوية إلى نمط هادئ، يدعم التغليف ونقاط التواصل في المتجر الإلكتروني مع الحفاظ على وضوح العلامة.',
          '11.png': 'يجمع النظام اللوني الوردي الهادئ والعنابي الداكن بتدرج مترابط، ليوازن بين الرقة والحضور الزهري الأعمق.'
        }
      }
    },
    zone: {
      initialAsset: '07.png',
      preferredOrder: ['07.png', '02.png', '11.png', '06.png', '10.png', '01.png', '03.png', '04.png', '05.png', '08.png', '09.png'],
      en: {
        title: 'Zone',
        sectorType: 'Food & Restaurants - Visual Identity',
        descriptions: {
          '01.png': 'The identity brings the ZONE symbol, yellow accent, and repeating food icons together on packaging, making the restaurant system immediately recognizable.',
          '02.png': 'The identity moves across takeaway boxes, cups, bags, and uniforms, keeping the black, white, and yellow system bold in everyday restaurant use.',
          '03.png': 'The identity moves across takeaway boxes, cups, bags, and uniforms, keeping the black, white, and yellow system bold in everyday restaurant use.',
          '04.png': 'The identity moves across takeaway boxes, cups, bags, and uniforms, keeping the black, white, and yellow system bold in everyday restaurant use.',
          '05.png': 'The identity moves across takeaway boxes, cups, bags, and uniforms, keeping the black, white, and yellow system bold in everyday restaurant use.',
          '06.png': 'The logo combines a geometric O with a triangular pizza slice on a measured construction, creating a simple symbol for restaurant and meals.',
          '07.png': 'The mark is tested in yellow, black, white, and reversed versions so it stays clear across packaging and dark or light surfaces.',
          '08.png': 'The Arabic and English wordmarks use a strong condensed display style, keeping the identity energetic and legible across restaurant touchpoints.',
          '09.png': 'The concept turns the letter O and a pizza slice into one direct symbol, using yellow, black, and white to express a bold food identity.',
          '10.png': 'A repeating arch-and-slice motif extends the logo into a graphic pattern for packaging, adding rhythm without competing with the mark.',
          '11.png': 'The palette combines black and warm yellow in a focused gradient, giving the restaurant identity a bold, modern, energetic presence.'
        }
      },
      ar: {
        title: 'زون',
        sectorType: 'الاغذية والمطاعم - هوية بصرية',
        descriptions: {
          '01.png': 'يجمع النظام البصري رمز زون واللمسة الصفراء والرموز الغذائية المتكررة على التغليف، ليجعل هوية المطعم واضحة من النظرة الأولى.',
          '02.png': 'يمتد النظام البصري إلى علب الطلبات والأكواب والحقائب والزي، مع الحفاظ على حضور الأسود والأبيض والأصفر في استخدامات المطعم اليومية.',
          '03.png': 'يمتد النظام البصري إلى علب الطلبات والأكواب والحقائب والزي، مع الحفاظ على حضور الأسود والأبيض والأصفر في استخدامات المطعم اليومية.',
          '04.png': 'يمتد النظام البصري إلى علب الطلبات والأكواب والحقائب والزي، مع الحفاظ على حضور الأسود والأبيض والأصفر في استخدامات المطعم اليومية.',
          '05.png': 'يمتد النظام البصري إلى علب الطلبات والأكواب والحقائب والزي، مع الحفاظ على حضور الأسود والأبيض والأصفر في استخدامات المطعم اليومية.',
          '06.png': 'يجمع الشعار دائرة هندسية مع مثلث مستوحى من شريحة البيتزا ضمن بناء محسوب، ليصنع رمزاً بسيطاً للمطعم والوجبات.',
          '07.png': 'اختبر الرمز بالأصفر والأسود والأبيض وبالصيغ المعكوسة، ليبقى واضحاً فوق التغليف والأسطح الفاتحة والداكنة.',
          '08.png': 'يستخدم الاسمان العربي والإنجليزي أسلوباً خطياً قوياً ومكثفاً، ليحافظ على طاقة الهوية ووضوحها في نقاط تواصل المطعم.',
          '09.png': 'يحول المفهوم الدائرة وشريحة البيتزا إلى رمز مباشر، ويستخدم الأصفر والأسود والأبيض للتعبير عن هوية غذائية جريئة.',
          '10.png': 'يمد تكرار القوس وشريحة البيتزا الشعار إلى نمط بصري للتغليف، ويضيف إيقاعاً دون منافسة الرمز.',
          '11.png': 'يجمع النظام اللوني الأسود والأصفر الدافئ بتدرج مركز، ليمنح هوية المطعم حضوراً جريئاً وحديثاً ومليئاً بالطاقة.'
        }
      }
    },
    'sda-alrwaq': {
      assetFolder: 'sda alrwaq',
      initialAsset: '07.png',
      preferredOrder: ['07.png', '02.png', '11.png', '06.png', '10.png', '01.png', '03.png', '04.png', '05.png', '08.png', '09.png'],
      en: {
        title: 'Sada Al Riwaq',
        sectorType: 'Electronics & Technology - Visual Identity',
        descriptions: {
          '01.png': 'The identity introduces layered arch forms across retail banners, using contrast and repeated promotional messaging to make communication immediate.',
          '02.png': 'The system is applied to digital promotions, packaging, wearables, and devices, carrying the arch mark consistently across technology touchpoints.',
          '03.png': 'The system is applied to digital promotions, packaging, wearables, and devices, carrying the arch mark consistently across technology touchpoints.',
          '04.png': 'The system is applied to digital promotions, packaging, wearables, and devices, carrying the arch mark consistently across technology touchpoints.',
          '05.png': 'The system is applied to digital promotions, packaging, wearables, and devices, carrying the arch mark consistently across technology touchpoints.',
          '06.png': 'The logo is constructed from layered arch shapes with measured spacing, creating a simple form that suggests passage, connection, and signal.',
          '07.png': 'The arch mark is tested in color, monochrome, and reversed applications so its structure remains clear on varied technology surfaces.',
          '08.png': 'The Arabic and English wordmarks use a coordinated display system, aligning their proportions to keep the technology identity clear in both languages.',
          '09.png': 'The concept uses repeated arches to express echoes, passageways, and signal flow, linking the identity to electronics and technology.',
          '10.png': 'A repeated arch pattern extends the identity into a flexible graphic texture for digital and physical technology applications.',
          '11.png': 'The palette connects bright teal with deep blue through a smooth gradient, balancing digital energy with trust and technical depth.'
        }
      },
      ar: {
        title: 'صدى الرواق',
        sectorType: 'الالكترونيات والتقنية - هوية بصرية',
        descriptions: {
          '01.png': 'يقدم النظام البصري أقواساً متداخلة عبر اللوحات التجارية، ويستخدم التباين والرسائل الترويجية المتكررة لجعل التواصل فورياً.',
          '02.png': 'يطبق النظام على العروض الرقمية والتغليف والأجهزة القابلة للارتداء والمنتجات، مع توحيد حضور رمز القوس في نقاط التقنية المختلفة.',
          '03.png': 'يطبق النظام على العروض الرقمية والتغليف والأجهزة القابلة للارتداء والمنتجات، مع توحيد حضور رمز القوس في نقاط التقنية المختلفة.',
          '04.png': 'يطبق النظام على العروض الرقمية والتغليف والأجهزة القابلة للارتداء والمنتجات، مع توحيد حضور رمز القوس في نقاط التقنية المختلفة.',
          '05.png': 'يطبق النظام على العروض الرقمية والتغليف والأجهزة القابلة للارتداء والمنتجات، مع توحيد حضور رمز القوس في نقاط التقنية المختلفة.',
          '06.png': 'بني الشعار من أقواس متداخلة بمسافات محسوبة، ليصنع شكلاً بسيطاً يوحي بالمرور والاتصال والإشارة.',
          '07.png': 'اختبر رمز القوس بالألوان والأحادية والمعكوسة، ليحافظ تكوينه على الوضوح فوق أسطح التقنية المتنوعة.',
          '08.png': 'يستخدم الاسمان العربي والإنجليزي نظاماً خطياً متناسقاً، يوحد نسبهما ويحافظ على وضوح الهوية التقنية باللغتين.',
          '09.png': 'يستخدم المفهوم أقواساً متكررة للتعبير عن الصدى والممرات وتدفق الإشارة، ويربط الهوية بالإلكترونيات والتقنية.',
          '10.png': 'يمد تكرار الأقواس الهوية إلى نسيج بصري مرن للتطبيقات الرقمية والمادية في مجال التقنية.',
          '11.png': 'يربط النظام اللوني الفيروزي المشرق بالأزرق الداكن عبر تدرج ناعم، ليوازن بين الطاقة الرقمية والثقة والعمق التقني.'
        }
      }
    }
  };
  pages.forEach((page) => {
    const projectKey = page.dataset.galleryProject || 'alfares';
    const copy = projects[projectKey] || projects.alfares;
    const assetRoot = copy.assetRoot || `/assets/projects/${encodeURIComponent(copy.assetFolder || projectKey)}`;
    let activeAssetName = copy.initialAsset;
    let descriptionTextTimer = 0;
    const description = page.querySelector('.gallery-project-description');
    const descriptionClasses = ['is-description-exiting', 'is-description-entering', 'is-description-settled'];
    const getDescription = (language, assetName) => copy[language === 'en' ? 'en' : 'ar'].descriptions[assetName] || '';
  const setDescription = (language, assetName, animate = false) => {
    if (!description) return;
    const nextText = getDescription(language, assetName);
    if (!nextText || description.textContent === nextText) return;
    window.clearTimeout(descriptionTextTimer);
    description.classList.remove(...descriptionClasses);
    if (!animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      description.textContent = nextText;
      return;
    }
    description.classList.add('is-description-exiting');
    descriptionTextTimer = window.setTimeout(() => {
      description.textContent = nextText;
      description.classList.remove('is-description-exiting');
      description.classList.add('is-description-entering');
      requestAnimationFrame(() => {
        description.classList.remove('is-description-entering');
        description.classList.add('is-description-settled');
      });
    }, 180);
  };
  const applyCopy = (language) => {
    const values = copy[language === 'en' ? 'en' : 'ar'];
    page.querySelectorAll('[data-gallery-copy]').forEach((node) => {
      const value = node.dataset.galleryCopy === 'description'
        ? getDescription(language, activeAssetName)
        : values[node.dataset.galleryCopy];
      if (value) node.textContent = value;
    });
    description?.classList.remove(...descriptionClasses);
  };
  applyCopy(root.lang);
    window.addEventListener('ooxme-language-change', (event) => {
      applyCopy(event.detail?.language || root.lang);
      window.requestAnimationFrame(syncTextFrame);
    });

  const deck = page.querySelector('[data-gallery-deck]');
  const layers = [...page.querySelectorAll('[data-stack-layer]')];
  if (!deck || layers.length !== 3) return;
  let assets = [];
  let cards = [];
  let order = [];
  let busy = false;
  let pointer = null;
  let suppressNextClick = false;
  let motionFrame = 0;
  let motionToken = 0;
  let motionMode = 'idle';
  let hasRevealed = false;
  let dragMotion = { x: 0, y: 0, scale: 1, rotate: 0 };
  const readyAssets = new Map();
  let geometryWidth = 0;
  let stableDeckSize = 0;
  const setDragStyle = (x = 0, y = 0, scale = 1) => {
    const rotate = Math.max(-3.5, Math.min(3.5, x * .018));
    dragMotion = { x, y, scale, rotate };
    if (order[0] && (motionMode === 'dragging' || motionMode === 'canceling')) {
      setCardTransform(order[0], x, y, scale, rotate, 1);
    }
  };
  const syncGeometry = () => {
    const availableWidth = page.getBoundingClientRect().width;
    // Preserve the approved pre-stability card geometry at route entry, while
    // preventing later browser-chrome height changes from recalculating it.
    if (!stableDeckSize || Math.abs(availableWidth - geometryWidth) > .5) {
      geometryWidth = availableWidth;
      stableDeckSize = Math.max(88, Math.min(
        availableWidth,
        stableViewportHeight * .38,
        stableViewportHeight * .62
      ));
    }
    const size = stableDeckSize;
    const tailHeight = Math.max(10, Math.min(16, window.innerWidth * .015));
    const deckHeight = size + (tailHeight * 2);
    deck.style.setProperty('--gallery-deck-width', `${size}px`);
    deck.style.setProperty('--gallery-deck-height', `${deckHeight}px`);
    deck.parentElement?.style.setProperty('--gallery-deck-height', `${deckHeight}px`);
    deck.style.setProperty('--gallery-tail-height', `${tailHeight}px`);
    page.style.setProperty('--gallery-description-width', `${size}px`);
  };
  const syncTextFrame = () => {
    if (!description) return;
    const referenceText = {
      name: copy.en.title,
      role: copy.en.sectorType,
      description: copy.en.descriptions[copy.initialAsset]
    };
    const sourceStyle = getComputedStyle(description);
    const role = page.querySelector('.gallery-text-role');
    const roleStyle = role ? getComputedStyle(role) : sourceStyle;
    const textGroup = page.querySelector('.gallery-text-group');
    const groupWidth = textGroup?.getBoundingClientRect().width || description.getBoundingClientRect().width;
    const descriptionWidth = description.getBoundingClientRect().width;
    const measure = (text, fontSize = sourceStyle.fontSize, width = groupWidth, style = sourceStyle) => {
      const node = document.createElement('div');
      Object.assign(node.style, {
        position: 'absolute',
        visibility: 'hidden',
        pointerEvents: 'none',
        width: `${width}px`,
        maxWidth: 'none',
        margin: '0',
        fontFamily: 'OOXMEScript, Arial, sans-serif',
        fontSize,
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        textAlign: 'center',
        whiteSpace: 'normal'
      });
      node.textContent = text;
      document.body.append(node);
      const height = node.getBoundingClientRect().height;
      node.remove();
      return height;
    };
    page.style.setProperty('--gallery-project-name-height', `${measure(referenceText.name, '14px')}px`);
    page.style.setProperty('--gallery-text-role-height', `${measure(referenceText.role, roleStyle.fontSize, groupWidth, roleStyle)}px`);
    page.style.setProperty('--gallery-description-height', `${measure(referenceText.description, sourceStyle.fontSize, descriptionWidth)}px`);
  };
  const setCardPosition = (card, position) => {
    card.className = `gallery-stack-layer gallery-stack-layer--${position}`;
    card.setAttribute('aria-hidden', position === 'primary' ? 'false' : 'true');
    const asset = assets[Number(card.dataset.assetIndex)];
    card.classList.toggle('gallery-stack-layer--pattern', asset?.name === '10.png');
  };
  const setCardTransform = (card, x = 0, y = 0, scale = 1, rotate = 0, opacity = 1) => {
    card.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
    card.style.opacity = String(opacity);
  };
  const clearCardTransform = (card) => {
    card.style.removeProperty('transform');
    card.style.removeProperty('opacity');
    card.style.removeProperty('z-index');
  };
  const mix = (from, to, value) => from + ((to - from) * value);
  const preloadAsset = (index) => {
    const asset = assets[index];
    if (!asset) return Promise.resolve();
    if (readyAssets.has(index)) return readyAssets.get(index);
    const image = new Image();
    image.decoding = 'async';
    image.width = asset.width;
    image.height = asset.height;
    const promise = new Promise((resolve) => {
      const finish = () => resolve();
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
      image.src = asset.src;
      if (image.complete) finish();
    });
    readyAssets.set(index, promise);
    return promise;
  };
  const ensureCardReady = async (card) => {
    const index = Number(card.dataset.assetIndex);
    const asset = assets[index];
    if (!asset) return;
    await preloadAsset(index);
    const image = card.querySelector('img');
    if (image.getAttribute('src') !== asset.src) image.src = asset.src;
    image.width = asset.width;
    image.height = asset.height;
    if (image.decode) await image.decode().catch(() => {});
  };
  const preloadNeighbors = () => {
    [order[3], order[4], order[order.length - 1], order[order.length - 2]]
      .filter(Boolean)
      .forEach((card) => preloadAsset(Number(card.dataset.assetIndex)));
  };
  const renderStack = () => {
    if (!assets.length || order.length < 3) return;
    cards.forEach((card) => {
      card.className = 'gallery-stack-layer gallery-stack-layer--hidden';
      card.setAttribute('aria-hidden', 'true');
      clearCardTransform(card);
      const image = card.querySelector('img');
      image.alt = '';
      image.loading = 'lazy';
      image.fetchPriority = 'auto';
    });
    setCardPosition(order[0], 'primary');
    setCardPosition(order[1], 'rear-1');
    setCardPosition(order[2], 'rear-2');
    const frontImage = order[0].querySelector('img');
    const frontAsset = assets[Number(order[0].dataset.assetIndex)];
    activeAssetName = frontAsset?.name || activeAssetName;
    frontImage.alt = frontAsset?.alt || '';
    frontImage.loading = 'eager';
    frontImage.fetchPriority = 'high';
    syncGeometry();
    deck.setAttribute('aria-label', root.lang === 'ar' ? `عرض صورة ${copy.ar.title} التالية` : `View next ${copy.en.title} project image`);
  };
  const runAdvance = async (direction = 'left', startX = 0, startY = 0, startScale = 1) => {
    if (!assets.length || order.length < 3 || !busy || !['idle', 'dragging'].includes(motionMode)) return;
    const outgoing = order[0];
    const oldRearOne = order[1];
    const oldRearTwo = order[2];
    const nextRear = order[3];
    if (!nextRear) { busy = false; return; }
    await ensureCardReady(nextRear);
    const nextPrimary = oldRearOne;
    const nextPrimaryAsset = assets[Number(nextPrimary.dataset.assetIndex)];
    setDescription(root.lang, nextPrimaryAsset?.name || activeAssetName, true);

    const outgoingRect = outgoing.getBoundingClientRect();
    const exitDistance = direction === 'left'
      ? -(outgoingRect.left - startX + outgoingRect.width)
      : window.innerWidth - (outgoingRect.left - startX);
    const tail = Number(getComputedStyle(deck).getPropertyValue('--gallery-tail-height').replace('px', '')) || 10;
    const outgoingWidth = outgoingRect.width;
    const rearOneScale = .9;
    const rearTwoScale = .82 / .9;
    const startRotate = Math.max(-3.5, Math.min(3.5, startX * .018));
    const duration = 500;
    const startTime = performance.now();
    const token = ++motionToken;
    motionMode = 'transition';

    setCardPosition(outgoing, 'primary');
    setCardPosition(oldRearOne, 'primary');
    setCardPosition(oldRearTwo, 'rear-1');
    setCardPosition(nextRear, 'rear-2');
    outgoing.style.zIndex = '5';
    oldRearOne.style.zIndex = '4';
    oldRearTwo.style.zIndex = '3';
    nextRear.style.zIndex = '2';

    const ease = (value) => 1 - ((1 - value) ** 3);
    const lerp = (from, to, value) => from + ((to - from) * value);
    const frame = (now) => {
      if (token !== motionToken) return;
      const progress = Math.min(1, (now - startTime) / duration);
      if (progress < .58) {
        const phase = ease(progress / .58);
        setCardTransform(outgoing, lerp(startX, exitDistance, phase), lerp(startY, 0, phase), lerp(startScale, .985, phase), lerp(startRotate, direction === 'left' ? -3 : 3, phase), 1);
      } else {
        if (outgoing.style.zIndex !== '1') outgoing.style.zIndex = '1';
        const phase = ease((progress - .58) / .42);
        setCardTransform(outgoing, lerp(exitDistance, 0, phase), lerp(0, -tail * 2, phase), lerp(.985, .82, phase), lerp(direction === 'left' ? -3 : 3, 0, phase), 1 - phase);
      }
      const promote = ease(Math.min(1, progress / .82));
      setCardTransform(oldRearOne, 0, lerp(-tail, 0, promote), lerp(rearOneScale, 1, promote), 0, 1);
      setCardTransform(oldRearTwo, 0, lerp(-tail, 0, promote), lerp(rearTwoScale, 1, promote), 0, 1);
      const introduce = ease(Math.min(1, progress / .82));
      setCardTransform(nextRear, 0, 0, 1, 0, introduce);
      if (progress < 1) {
        motionFrame = requestAnimationFrame(frame);
        return;
      }
      order = [...order.slice(1), order[0]];
      motionMode = 'idle';
      renderStack();
      preloadNeighbors();
      busy = false;
    };
    motionFrame = requestAnimationFrame(frame);
  };
  const scheduleAdvance = (direction = 'left') => {
    if (busy || !assets.length) return;
    busy = true;
    void runAdvance(direction, 0, 0, .982);
  };
  const cancelDrag = () => {
    if (!order[0] || motionMode !== 'dragging') return;
    motionMode = 'canceling';
    const start = { ...dragMotion };
    const started = performance.now();
    const token = ++motionToken;
    const frame = (now) => {
      if (token !== motionToken) return;
      const progress = Math.min(1, (now - started) / 220);
      const eased = 1 - ((1 - progress) ** 3);
      setCardTransform(order[0], mix(start.x, 0, eased), mix(start.y, 0, eased), mix(start.scale, 1, eased), mix(start.rotate, 0, eased), 1);
      if (progress < 1) { motionFrame = requestAnimationFrame(frame); return; }
      motionMode = 'idle';
      renderStack();
    };
    motionFrame = requestAnimationFrame(frame);
  };
  deck.addEventListener('click', () => {
    if (suppressNextClick) { suppressNextClick = false; return; }
    scheduleAdvance('left');
  });
  deck.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowDown', 'Enter', ' ', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    scheduleAdvance(['ArrowLeft', 'ArrowUp'].includes(event.key) ? 'right' : 'left');
  });
  deck.addEventListener('pointerdown', (event) => {
    if (busy || pointer || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, axis: null };
    suppressNextClick = false;
  });
  deck.addEventListener('pointermove', (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    const distance = Math.hypot(dx, dy);
    if (!pointer.axis) {
      if (distance < 8) return;
      pointer.axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      pointer.moved = true;
      if (pointer.axis === 'vertical') {
        suppressNextClick = true;
        return;
      }
      deck.setPointerCapture?.(event.pointerId);
      motionMode = 'dragging';
      setDragStyle(0, 0, .982);
    }
    if (pointer.axis !== 'horizontal') return;
    suppressNextClick = true;
    event.preventDefault();
    setDragStyle(dx, 0, .982);
  }, { passive: false });
  const finishPointer = (event, cancelled = false) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    const moved = pointer.moved || dx !== 0 || dy !== 0;
    const axis = pointer.axis;
    pointer = null;
    if (!moved || axis !== 'horizontal') {
      motionMode = 'idle';
      return;
    }
    suppressNextClick = true;
    if (cancelled) { cancelDrag(); return; }
    if (busy) return;
    busy = true;
    const releaseScale = .982;
    setDragStyle(dx, 0, releaseScale);
    runAdvance(dx < 0 ? 'left' : 'right', dx, dy, releaseScale);
  };
  deck.addEventListener('pointerup', finishPointer);
  deck.addEventListener('pointercancel', (event) => finishPointer(event, true));
  window.addEventListener('resize', () => {
    syncGeometry();
    syncTextFrame();
  }, { passive: true });

  const revealOnce = () => {
    if (hasRevealed) return;
    hasRevealed = true;
    page.dataset.galleryRevealed = 'true';
    page.querySelectorAll('[data-gallery-reveal]').forEach((node) => node.classList.add('is-visible'));
    revealObserver?.disconnect();
  };
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) revealOnce();
    }, { root: null, rootMargin: '0px 0px -25% 0px', threshold: 0 })
    : null;

  fetch(`${assetRoot}/manifest.json`, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((manifest) => {
      const entries = Array.isArray(manifest?.assets) ? manifest.assets : [];
      const manifestAssets = entries.filter((asset) => asset.name && asset.width > 0 && asset.height > 0).map((asset, index) => ({
        ...asset,
        src: `${assetRoot}/${asset.name}`,
        alt: `${copy.en.title} visual identity artwork ${String(index + 1).padStart(2, '0')}`
      }));
      const preferredOrder = copy.preferredOrder;
      const preferredAssets = preferredOrder
        .map((name) => manifestAssets.find((asset) => asset.name === name))
        .filter(Boolean);
      assets = [
        ...preferredAssets,
        ...manifestAssets.filter((asset) => !preferredOrder.includes(asset.name))
      ];
      cards = layers.slice();
      cards.forEach((card, index) => {
        card.dataset.assetIndex = String(index);
        const image = card.querySelector('img');
        const asset = assets[index];
        image.width = asset.width;
        image.height = asset.height;
        image.removeAttribute('src');
        image.alt = '';
        image.loading = 'lazy';
        image.fetchPriority = 'auto';
      });
      assets.slice(3).forEach((asset, index) => {
        const card = document.createElement('figure');
        card.className = 'gallery-stack-layer gallery-stack-layer--hidden';
        card.dataset.assetIndex = String(index + 3);
        card.setAttribute('aria-hidden', 'true');
        const image = document.createElement('img');
        image.width = asset.width;
        image.height = asset.height;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        card.append(image);
        deck.append(card);
        cards.push(card);
      });
      order = cards.slice();
      Promise.all(order.slice(0, 3).map(ensureCardReady)).then(() => {
        renderStack();
        syncTextFrame();
        preloadNeighbors();
        if (revealObserver) {
          page.querySelectorAll('[data-gallery-reveal]').forEach((node) => revealObserver.observe(node));
        }
        else revealOnce();
      });
    })
    .catch(() => {});
  });
})();
