(() => {
  'use strict';

  const source = [
    { name: { ar: 'وضوح المشروع', en: 'Business Clarity' }, questions: [
      { ar: 'هل تستطيع شرح ما يقدمه مشروعك ولمن، بجملة واضحة ومباشرة؟', en: 'Can you explain what your business offers and who it is for in one clear, direct sentence?', options: [
        { ar: 'نعم، أستطيع شرحه بوضوح وباختصار.', en: 'Yes, I can explain it clearly and concisely.' },
        { ar: 'أستطيع، لكن الشرح يحتاج بعض التفاصيل.', en: 'I can, but the explanation needs some detail.' },
        { ar: 'لا، يصعب علي شرحه بشكل واضح.', en: 'No, it is difficult for me to explain it clearly.' }
      ] },
      { ar: 'هل تعرف المشكلة او الحاجة الأساسية التي تجعل العميل يبحث عن منتجك او خدمتك؟', en: 'Do you know the core problem or need that makes a customer look for your product or service?', options: [
        { ar: 'نعم، وهي واضحة ومثبتة من تعاملنا مع العملاء.', en: 'Yes, it is clear and validated through our interactions with customers.' },
        { ar: 'لدي فكرة جيدة عنها، لكن ليست مؤكدة بالكامل.', en: 'I have a good idea, but it is not fully confirmed.' },
        { ar: 'لا، لا أعرفها بشكل واضح.', en: 'No, I do not know it clearly.' }
      ] },
      { ar: 'هل تعرف بالضبط من هو العميل الأنسب لمشروعك؟', en: 'Do you know exactly who the best-fit customer is for your business?', options: [
        { ar: 'نعم، نعرف صفاته واحتياجاته وسلوكه بشكل واضح.', en: 'Yes, we clearly understand their characteristics, needs, and behavior.' },
        { ar: 'نعرفه بصورة عامة، لكن بدون تحديد دقيق.', en: 'We know them generally, but without precise definition.' },
        { ar: 'لا، نستهدف شريحة واسعة او الجميع تقريباً.', en: 'No, we target a broad segment or almost everyone.' }
      ] },
      { ar: 'هل لديك سبب واضح يجعل العميل يختارك بدلاً من البدائل المتاحة؟', en: 'Do you have a clear reason for customers to choose you over the available alternatives?', options: [
        { ar: 'نعم، ولدينا فرق واضح يشعر به العميل.', en: 'Yes, we have a clear difference that customers can feel.' },
        { ar: 'يوجد فرق، لكنه ليس واضحاً او قوياً بما يكفي.', en: 'There is a difference, but it is not clear or strong enough.' },
        { ar: 'لا، عرضنا مشابه جداً لما هو موجود في السوق.', en: 'No, our offering is very similar to what is already in the market.' }
      ] },
      { ar: 'عندما تتخذ قراراً مهماً في المشروع، على ماذا تعتمد غالباً؟', en: 'When you make an important business decision, what do you usually rely on?', options: [
        { ar: 'على بيانات، تجارب، ومعلومات فعلية.', en: 'Data, experiments, and real information.' },
        { ar: 'على مزيج من المعلومات والخبرة الشخصية.', en: 'A mix of information and personal experience.' },
        { ar: 'على الحدس والتوقعات غالباً.', en: 'Mostly intuition and expectations.' }
      ] }
    ] },
    { name: { ar: 'العميل والعرض', en: 'Customer & Offering' }, questions: [
      { ar: 'هل تعرف أي نوع من العملاء يحقق لك أفضل قيمة؟', en: 'Do you know which type of customer creates the most value for you?', options: [
        { ar: 'نعم، ونعرف من يشتري أكثر او يحقق ربحية أفضل.', en: 'Yes, we know who buys more or generates better profitability.' },
        { ar: 'لدينا تصور، لكن لا نقيس ذلك بوضوح.', en: 'We have a view, but we do not measure it clearly.' },
        { ar: 'لا، نتعامل مع جميع العملاء بنفس الطريقة.', en: 'No, we treat all customers the same way.' }
      ] },
      { ar: 'هل يستطيع العميل فهم ما سيحصل عليه مقابل السعر بسهولة؟', en: 'Can the customer easily understand what they will receive for the price?', options: [
        { ar: 'نعم، العرض واضح ولا يحتاج شرحاً طويلاً.', en: 'Yes, the offering is clear and does not need a long explanation.' },
        { ar: 'غالباً، لكن بعض العملاء يحتاجون توضيحاً إضافياً.', en: 'Usually, but some customers need additional clarification.' },
        { ar: 'لا، نحتاج عادة الى شرح طويل قبل أن يفهم العميل العرض.', en: 'No, we usually need a long explanation before the customer understands the offering.' }
      ] },
      { ar: 'هل تعرف ما الذي يقدره العميل فعلياً في منتجك او خدمتك؟', en: 'Do you know what customers actually value in your product or service?', options: [
        { ar: 'نعم، ونعرف ذلك من سلوك وملاحظات العملاء.', en: 'Yes, we know from customer behavior and feedback.' },
        { ar: 'لدينا تصور مبني على التجربة.', en: 'We have a view based on experience.' },
        { ar: 'لا، نفترض غالباً ما الذي يريده العميل.', en: 'No, we usually assume what the customer wants.' }
      ] },
      { ar: 'هل عدد المنتجات او الخدمات او الباقات لديك يساعد العميل على اتخاذ القرار؟', en: 'Does the number of products, services, or packages you offer help customers make a decision?', options: [
        { ar: 'نعم، الخيارات واضحة ومنظمة.', en: 'Yes, the options are clear and organized.' },
        { ar: 'توجد بعض الخيارات التي قد تربك العميل.', en: 'Some options may confuse the customer.' },
        { ar: 'الخيارات كثيرة او غير واضحة ويصعب المقارنة بينها.', en: 'There are too many or unclear options, making them difficult to compare.' }
      ] },
      { ar: 'هل تجمع بشكل منتظم معلومات من العملاء حول أسباب الشراء او عدم الشراء؟', en: 'Do you regularly collect customer information about why they buy or do not buy?', options: [
        { ar: 'نعم، ولدينا طريقة واضحة لجمع هذه المعلومات.', en: 'Yes, we have a clear way to collect this information.' },
        { ar: 'أحياناً، لكن بشكل غير منتظم.', en: 'Sometimes, but not consistently.' },
        { ar: 'لا، لا نجمع هذه المعلومات.', en: 'No, we do not collect this information.' }
      ] }
    ] },
    { name: { ar: 'التسعير والربحية', en: 'Pricing & Profitability' }, questions: [
      { ar: 'هل تعرف التكلفة الحقيقية لتقديم منتجاتك او خدماتك الرئيسية؟', en: 'Do you know the true cost of delivering your main products or services?', options: [
        { ar: 'نعم، ونحسب جميع التكاليف المهمة المرتبطة بها.', en: 'Yes, we calculate all important related costs.' },
        { ar: 'أعرف التكلفة الأساسية، لكن قد توجد تكاليف غير محسوبة بدقة.', en: 'I know the core cost, but some costs may not be calculated accurately.' },
        { ar: 'لا، لا أعرف التكلفة الحقيقية بشكل واضح.', en: 'No, I do not clearly know the true cost.' }
      ] },
      { ar: 'كيف يتم تحديد أسعارك حالياً؟', en: 'How are your prices currently determined?', options: [
        { ar: 'بناءً على التكلفة والقيمة والسوق والربحية المطلوبة.', en: 'Based on cost, value, the market, and the required profitability.' },
        { ar: 'نعتمد بشكل أساسي على أسعار السوق والمنافسين.', en: 'We mainly rely on market and competitor prices.' },
        { ar: 'السعر تقديري او تم اختياره بدون حساب واضح.', en: 'The price is estimated or was chosen without clear calculation.' }
      ] },
      { ar: 'هل تعرف هامش الربح لكل منتج او خدمة رئيسية؟', en: 'Do you know the profit margin for each main product or service?', options: [
        { ar: 'نعم، وأعرفه من أرقام فعلية ومحدثة.', en: 'Yes, I know it from actual, up-to-date figures.' },
        { ar: 'أعرفه بشكل تقريبي.', en: 'I know it approximately.' },
        { ar: 'لا، لا أعرف الهامش بدقة.', en: 'No, I do not know the margin accurately.' }
      ] },
      { ar: 'هل تعرف تأثير الخصومات والعمولات والتوصيل والإعلان وغيرها على ربحك؟', en: 'Do you know how discounts, commissions, delivery, advertising, and other costs affect your profit?', options: [
        { ar: 'نعم، نحسب تأثيرها قبل اتخاذ القرار.', en: 'Yes, we calculate their impact before making a decision.' },
        { ar: 'نحسب بعضها، لكن ليس جميعها.', en: 'We calculate some of them, but not all.' },
        { ar: 'لا، غالباً ننظر الى قيمة البيع فقط.', en: 'No, we usually look only at the sale value.' }
      ] },
      { ar: 'هل تعرف ما الذي يحقق لك أفضل ربح، وليس فقط أعلى مبيعات؟', en: 'Do you know what generates the best profit for you, not just the highest sales?', options: [
        { ar: 'نعم، ونفرق بوضوح بين حجم المبيعات والربحية.', en: 'Yes, we clearly distinguish sales volume from profitability.' },
        { ar: 'لدينا فكرة تقريبية.', en: 'We have an approximate idea.' },
        { ar: 'لا، نركز غالباً على المنتجات او الخدمات الأكثر مبيعاً فقط.', en: 'No, we usually focus only on the best-selling products or services.' }
      ] }
    ] },
    { name: { ar: 'المبيعات والتحويل', en: 'Sales & Conversion' }, questions: [
      { ar: 'هل لديك خطوات واضحة من أول استفسار للعميل حتى إتمام البيع؟', en: 'Do you have clear steps from the first customer inquiry through to completing the sale?', options: [
        { ar: 'نعم، ولدينا عملية بيع واضحة ومتكررة.', en: 'Yes, we have a clear, repeatable sales process.' },
        { ar: 'توجد طريقة عامة، لكنها تختلف من شخص الى آخر.', en: 'There is a general approach, but it varies from person to person.' },
        { ar: 'لا، كل عملية بيع تتم بطريقة مختلفة.', en: 'No, every sale is handled differently.' }
      ] },
      { ar: 'عندما يتواصل عميل جديد، هل توجد طريقة واضحة للرد وفهم احتياجه وتقديم العرض؟', en: 'When a new customer reaches out, is there a clear way to respond, understand their need, and present the offering?', options: [
        { ar: 'نعم، ولدينا أسلوب واضح ومتسق.', en: 'Yes, we have a clear, consistent approach.' },
        { ar: 'توجد طريقة عامة، لكن التطبيق غير ثابت.', en: 'There is a general approach, but execution is inconsistent.' },
        { ar: 'لا، يعتمد ذلك بالكامل على الشخص الذي يرد.', en: 'No, it depends entirely on the person responding.' }
      ] },
      { ar: 'ماذا يحدث إذا أبدى العميل اهتماماً ثم لم يشترِ؟', en: 'What happens if a customer shows interest and then does not buy?', options: [
        { ar: 'تتم متابعته بطريقة منظمة وفي الوقت المناسب.', en: 'They are followed up with in an organized and timely way.' },
        { ar: 'تتم المتابعة أحياناً.', en: 'Follow-up sometimes happens.' },
        { ar: 'غالباً لا تتم متابعته.', en: 'They are usually not followed up with.' }
      ] },
      { ar: 'هل تعرف أكثر الأسباب التي تمنع العملاء من إتمام الشراء؟', en: 'Do you know the main reasons that stop customers from completing a purchase?', options: [
        { ar: 'نعم، نعرف الاعتراضات الرئيسية ونتعامل معها بوضوح.', en: 'Yes, we know the main objections and address them clearly.' },
        { ar: 'نعرف بعضها من التجربة.', en: 'We know some of them from experience.' },
        { ar: 'لا، لا نعرف لماذا ينسحب معظم العملاء.', en: 'No, we do not know why most customers drop out.' }
      ] },
      { ar: 'هل تعرف تقريباً نسبة العملاء المحتملين الذين يتحولون الى مشترين؟', en: 'Do you roughly know the percentage of prospects who convert into buyers?', options: [
        { ar: 'نعم، نقيس التحويل بشكل منتظم.', en: 'Yes, we measure conversion regularly.' },
        { ar: 'لدينا تقدير تقريبي فقط.', en: 'We only have an approximate estimate.' },
        { ar: 'لا، لا نقيس ذلك.', en: 'No, we do not measure it.' }
      ] }
    ] },
    { name: { ar: 'التسويق', en: 'Marketing' }, questions: [
      { ar: 'هل لكل نشاط تسويقي لديك هدف تجاري واضح؟', en: 'Does each marketing activity have a clear business objective?', options: [
        { ar: 'نعم، نعرف ماذا نريد من كل نشاط وكيف نقيسه.', en: 'Yes, we know what we want from each activity and how to measure it.' },
        { ar: 'بعض الأنشطة لها أهداف واضحة وبعضها لا.', en: 'Some activities have clear objectives and some do not.' },
        { ar: 'لا، ننشر او نعلن بدون هدف محدد غالباً.', en: 'No, we often publish or advertise without a specific objective.' }
      ] },
      { ar: 'هل تعرف أي القنوات تجلب لك عملاء فعليين؟', en: 'Do you know which channels bring you actual customers?', options: [
        { ar: 'نعم، نعرف مصادر العملاء ونقارن أداءها.', en: 'Yes, we know customer sources and compare their performance.' },
        { ar: 'نعرف بعضها بشكل تقريبي.', en: 'We know some of them approximately.' },
        { ar: 'لا، لا نستطيع تحديد مصدر معظم العملاء.', en: 'No, we cannot identify the source of most customers.' }
      ] },
      { ar: 'هل المحتوى الذي تنشره يساعد العميل على الفهم او الثقة او اتخاذ القرار؟', en: 'Does the content you publish help customers understand, trust, or make a decision?', options: [
        { ar: 'نعم، لكل محتوى وظيفة واضحة.', en: 'Yes, every piece of content has a clear purpose.' },
        { ar: 'بعض المحتوى مفيد وبعضه للنشاط والاستمرارية فقط.', en: 'Some content is useful and some is only for activity and consistency.' },
        { ar: 'لا، نركز غالباً على النشر بدون هدف محدد.', en: 'No, we usually focus on publishing without a specific objective.' }
      ] },
      { ar: 'إذا انخفضت المبيعات، هل تستطيع معرفة إن كانت المشكلة في التسويق او العرض او السعر او المبيعات؟', en: 'If sales decline, can you tell whether the problem is marketing, the offering, pricing, or sales?', options: [
        { ar: 'نعم، نراجع المؤشرات ونحدد مصدر المشكلة.', en: 'Yes, we review the indicators and identify the source of the problem.' },
        { ar: 'نستطيع التخمين، لكن ليس لدينا قياس واضح.', en: 'We can guess, but we do not have clear measurement.' },
        { ar: 'لا، غالباً نفترض أن المشكلة في التسويق.', en: 'No, we usually assume the problem is marketing.' }
      ] },
      { ar: 'قبل زيادة ميزانية الإعلان، هل تتأكد أن العرض ومسار البيع يعملان بشكل جيد؟', en: 'Before increasing the advertising budget, do you make sure the offering and sales path work well?', options: [
        { ar: 'نعم، نختبر ونقيس قبل زيادة الإنفاق.', en: 'Yes, we test and measure before increasing spend.' },
        { ar: 'أحياناً، لكن ليس دائماً.', en: 'Sometimes, but not always.' },
        { ar: 'لا، نزيد الإعلان غالباً عندما نحتاج مبيعات أكثر.', en: 'No, we usually increase advertising when we need more sales.' }
      ] }
    ] },
    { name: { ar: 'التشغيل', en: 'Operations' }, questions: [
      { ar: 'هل الأعمال المتكررة المهمة في المشروع لها طريقة واضحة للتنفيذ؟', en: 'Do the important recurring tasks in the business have a clear way of being performed?', options: [
        { ar: 'نعم، وهي منظمة ويمكن تكرارها بنفس المستوى.', en: 'Yes, they are organized and can be repeated at the same standard.' },
        { ar: 'بعضها منظم وبعضها يعتمد على الخبرة الشخصية.', en: 'Some are organized and some depend on personal experience.' },
        { ar: 'لا، معظم العمل يعتمد على الاجتهاد والذاكرة.', en: 'No, most work depends on individual effort and memory.' }
      ] },
      { ar: 'هل يعرف كل شخص في المشروع ما المسؤوليات والقرارات التي تقع ضمن دوره؟', en: 'Does everyone in the business know which responsibilities and decisions fall within their role?', options: [
        { ar: 'نعم، المسؤوليات والصلاحيات واضحة.', en: 'Yes, responsibilities and authority are clear.' },
        { ar: 'المسؤوليات واضحة جزئياً.', en: 'Responsibilities are partially clear.' },
        { ar: 'لا، يحدث تداخل او ارتباك بشكل متكرر.', en: 'No, overlap or confusion happens frequently.' }
      ] },
      { ar: 'إذا غبت أنت او شخص رئيسي عدة أيام، ماذا يحدث للمشروع؟', en: 'If you or a key person were away for several days, what would happen to the business?', options: [
        { ar: 'تستمر الأعمال الأساسية بصورة طبيعية.', en: 'Core operations continue normally.' },
        { ar: 'يستمر العمل لكن مع بعض المشاكل او التأخير.', en: 'Work continues, but with some problems or delays.' },
        { ar: 'تتعطل أجزاء مهمة من المشروع.', en: 'Important parts of the business stop.' }
      ] },
      { ar: 'عندما يتكرر خطأ تشغيلي، كيف تتعاملون معه؟', en: 'When an operational error repeats, how do you handle it?', options: [
        { ar: 'نبحث عن السبب ونعدل العملية لمنع تكراره.', en: 'We look for the cause and adjust the process to prevent it from recurring.' },
        { ar: 'نحل المشكلة الحالية، وأحياناً نراجع السبب.', en: 'We solve the current problem and sometimes review the cause.' },
        { ar: 'نعالج الخطأ كل مرة عندما يحدث.', en: 'We deal with the error each time it occurs.' }
      ] },
      { ar: 'هل توجد أعمال يدوية متكررة يمكن تنظيمها او أتمتتها او تفويضها؟', en: 'Are there repetitive manual tasks that could be organized, automated, or delegated?', options: [
        { ar: 'راجعنا هذه الأعمال ونظمنا ما يمكن تنظيمه.', en: 'We reviewed these tasks and organized what could be organized.' },
        { ar: 'توجد فرص للتحسين لكن لم نعمل عليها بالكامل.', en: 'There are opportunities to improve, but we have not fully acted on them.' },
        { ar: 'نعم، لدينا الكثير من الأعمال اليدوية المتكررة بدون تنظيم.', en: 'Yes, we have many repetitive manual tasks without organization.' }
      ] }
    ] },
    { name: { ar: 'تجربة العميل والاحتفاظ', en: 'Customer Experience & Retention' }, questions: [
      { ar: 'بعد أن يشتري العميل، هل يعرف بوضوح ماذا سيحدث بعد ذلك؟', en: 'After the customer buys, do they clearly know what will happen next?', options: [
        { ar: 'نعم، الخطوات والتوقيت والتوقعات واضحة.', en: 'Yes, the steps, timing, and expectations are clear.' },
        { ar: 'غالباً، لكن توجد بعض النقاط غير الواضحة.', en: 'Usually, but some points are unclear.' },
        { ar: 'لا، العميل يحتاج للسؤال والمتابعة لمعرفة ما سيحدث.', en: 'No, the customer has to ask and follow up to know what will happen.' }
      ] },
      { ar: 'هل التجربة الفعلية التي يحصل عليها العميل تطابق الوعد الذي قدمته قبل البيع؟', en: 'Does the customer’s actual experience match the promise made before the sale?', options: [
        { ar: 'نعم، ونراقب جودة التجربة باستمرار.', en: 'Yes, and we continuously monitor the quality of the experience.' },
        { ar: 'في أغلب الحالات، مع بعض الاختلافات.', en: 'In most cases, with some differences.' },
        { ar: 'لا، توجد فجوة واضحة بين الوعد والتنفيذ.', en: 'No, there is a clear gap between the promise and delivery.' }
      ] },
      { ar: 'إذا واجه العميل مشكلة او قدم شكوى، هل توجد طريقة واضحة لمعالجتها؟', en: 'If a customer has a problem or makes a complaint, is there a clear way to handle it?', options: [
        { ar: 'نعم، وهناك خطوات ومسؤوليات واضحة.', en: 'Yes, there are clear steps and responsibilities.' },
        { ar: 'توجد معالجة، لكنها تعتمد على الحالة والشخص.', en: 'There is a response, but it depends on the situation and person.' },
        { ar: 'لا، لا توجد طريقة محددة.', en: 'No, there is no defined method.' }
      ] },
      { ar: 'هل تتواصل مع العملاء بعد البيع عندما يكون ذلك مناسباً؟', en: 'Do you communicate with customers after the sale when appropriate?', options: [
        { ar: 'نعم، لدينا متابعة واضحة ومفيدة للعميل.', en: 'Yes, we have clear and useful follow-up for the customer.' },
        { ar: 'أحياناً، لكن ليست منتظمة.', en: 'Sometimes, but it is not regular.' },
        { ar: 'لا، ينتهي التواصل غالباً بعد إتمام البيع.', en: 'No, communication usually ends after the sale is completed.' }
      ] },
      { ar: 'هل تعرف لماذا يعود بعض العملاء ولماذا لا يعود آخرون؟', en: 'Do you know why some customers return and others do not?', options: [
        { ar: 'نعم، نتابع إعادة الشراء والاحتفاظ وملاحظات العملاء.', en: 'Yes, we track repeat purchases, retention, and customer feedback.' },
        { ar: 'لدينا فكرة عامة فقط.', en: 'We only have a general idea.' },
        { ar: 'لا، لا نتابع ذلك.', en: 'No, we do not track it.' }
      ] }
    ] },
    { name: { ar: 'المال والسيطرة على المشروع', en: 'Financial Management & Control' }, questions: [
      { ar: 'هل تعرف بشكل منتظم كم يحقق المشروع من إيرادات ومصروفات ونتيجة مالية؟', en: 'Do you regularly know the business’s revenue, expenses, and financial result?', options: [
        { ar: 'نعم، لدي أرقام واضحة ومحدثة.', en: 'Yes, I have clear, up-to-date figures.' },
        { ar: 'أعرف الأرقام بشكل تقريبي او غير منتظم.', en: 'I know the figures approximately or inconsistently.' },
        { ar: 'لا، لا أملك صورة مالية واضحة.', en: 'No, I do not have a clear financial picture.' }
      ] },
      { ar: 'هل أموال المشروع منفصلة عن أموالك ومصروفاتك الشخصية؟', en: 'Are the business’s funds separate from your personal money and expenses?', options: [
        { ar: 'نعم، الفصل واضح ومنظم.', en: 'Yes, the separation is clear and organized.' },
        { ar: 'يوجد فصل جزئي لكن تحدث بعض الاختلاطات.', en: 'There is partial separation, but some mixing occurs.' },
        { ar: 'لا، الأموال مختلطة بشكل كبير.', en: 'No, the funds are largely mixed.' }
      ] },
      { ar: 'هل تعرف المبالغ المستحقة لك والمبالغ التي يجب عليك دفعها ومواعيدها؟', en: 'Do you know the amounts owed to you, the amounts you must pay, and their due dates?', options: [
        { ar: 'نعم، وأتابعها بشكل منتظم.', en: 'Yes, I track them regularly.' },
        { ar: 'أعرف معظمها، لكن المتابعة ليست منظمة.', en: 'I know most of them, but tracking is not organized.' },
        { ar: 'لا، أكتشف الالتزامات غالباً عند موعدها.', en: 'No, I often discover obligations when they are due.' }
      ] },
      { ar: 'هل تستطيع توقع احتياجات المشروع النقدية خلال الفترة القادمة؟', en: 'Can you forecast the business’s cash needs for the coming period?', options: [
        { ar: 'نعم، لدي رؤية واضحة للتدفقات والالتزامات القادمة.', en: 'Yes, I have a clear view of upcoming cash flows and obligations.' },
        { ar: 'أستطيع التقدير بشكل عام.', en: 'I can estimate them generally.' },
        { ar: 'لا، نتعامل مع الوضع المالي عند حدوثه.', en: 'No, we deal with the financial situation as it happens.' }
      ] },
      { ar: 'عندما تفكر في التوسع او التوظيف او شراء شيء جديد، كيف تتخذ القرار؟', en: 'When considering expansion, hiring, or buying something new, how do you make the decision?', options: [
        { ar: 'أراجع القدرة المالية والعائد والمخاطر قبل القرار.', en: 'I review financial capacity, return, and risk before deciding.' },
        { ar: 'أراجع بعض الأرقام ثم أعتمد على التقدير.', en: 'I review some figures and then rely on estimation.' },
        { ar: 'أتخذ القرار غالباً لأن المبيعات جيدة او لأن المشروع يحتاجه.', en: 'I usually decide because sales are good or because the business needs it.' }
      ] }
    ] }
  ];

  window.OOXME_ASSESSMENT = {
    version: 1,
    sectionCount: 8,
    questionsPerSection: 5,
    optionCount: 3,
    sections: source.map((section, sectionIndex) => ({
      id: `section-${sectionIndex + 1}`,
      number: sectionIndex + 1,
      name: section.name,
      questions: section.questions.map((question, questionIndex) => ({
        id: `section-${sectionIndex + 1}-question-${questionIndex + 1}`,
        number: questionIndex + 1,
        prompt: { ar: question.ar, en: question.en },
        options: question.options.map((option, optionIndex) => ({
          id: `option-${optionIndex + 1}`,
          number: optionIndex + 1,
          label: { ar: option.ar, en: option.en }
        }))
      }))
    }))
  };
})();
