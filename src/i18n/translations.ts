export type LangCode = "uz-Latn" | "uz-Cyrl" | "en" | "ru";

export const LANG_LABELS: Record<LangCode, string> = {
  "uz-Latn": "O'zbek",
  "uz-Cyrl": "Ўзбек",
  en: "English",
  ru: "Русский",
};

export const LANG_SHORT: Record<LangCode, string> = {
  "uz-Latn": "UZ",
  "uz-Cyrl": "ЎЗ",
  en: "EN",
  ru: "RU",
};

export interface Translations {
  appName: string;
  // Login
  loginTitle: string;
  loginSubtitle: string;
  phoneLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  forgotPassword: string;
  loginButton: string;
  noAccount: string;
  register: string;
  // Errors
  errorPhoneInvalid: string;
  errorPasswordMin: string;
  errorFullNameRequired: string;
  errorLogin: string;
  errorApiNotFound: string;
  duplicateClientPhone: string;
  // Forgot password
  resetTitle: string;
  resetSubtitle: string;
  sendCode: string;
  needHelp: string;
  support: string;
  confirmTitle: string;
  confirmSubtitle: string;
  resendCode: string;
  confirmButton: string;
  newPasswordTitle: string;
  newPasswordSubtitle: string;
  newPasswordLabel: string;
  repeatPasswordLabel: string;
  updatePassword: string;
  errorPasswordsMismatch: string;
  passwordUpdated: string;
  didntReceiveCode: string;
  sending: string;
  saving: string;
  errorCodeInvalid: string;
  errorSendCode: string;
  errorUpdatePassword: string;
  errorCurrentPasswordRequired: string;
  errorCurrentPasswordWrong: string;
  minChars: string;
  repeatPasswordPlaceholder: string;
  // Register
  registerTitle: string;
  stepPersonal: string;
  stepShop: string;
  stepVerify: string;
  personalTitle: string;
  personalSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  createPasswordLabel: string;
  next: string;
  termsPrefix: string;
  termsLink: string;
  shopTitle: string;
  shopSubtitle: string;
  shopNameLabel: string;
  shopNamePlaceholder: string;
  addressLabel: string;
  addressPlaceholder: string;
  workingHours: string;
  openAt: string;
  closeAt: string;
  otpTitle: string;
  otpSubtitle: string;
  sentCodeLabel: string;
  /** OTP Telegram orqali */
  openTelegramBot: string;
  otpTelegramHint: string;
  /** Qisqa eslatma: @qarzdaftarsms_bot */
  otpSmsTelegramNotice: string;
  confirmTelegramHint: string;
  resendIn: string;
  verifyAndContinue: string;
  back: string;
  menu: string;
  appVersion: string;
  changeProfilePhoto: string;
  // Profile
  profileTitle: string;
  myShop: string;
  personalInfo: string;
  shopSettings: string;
  tariffPlan: string;
  security: string;
  currentPasswordLabel: string;
  changePasswordSection: string;
  changePhoneSection: string;
  phoneChangeViaSecurity: string;
  changePhoneAction: string;
  selectLanguage: string;
  theme: string;
  calculateSales: string;
  calculateSalesAlwaysOn: string;
  balance: string;
  availableBalance: string;
  totalBalance: string;
  cash: string;
  card: string;
  bankAccount: string;
  paymentMethod: string;
  accounts: string;
  all: string;
  mainWallet: string;
  logout: string;
  editShopTitle: string;
  save: string;
  /** To'lovni saqlash (mijoz/yetkazuvchi) */
  savePayment: string;
  paymentNotSaved: string;
  debtNotSaved: string;
  debtCategoryGoods: string;
  debtCategoryBorrow: string;
  debtCategoryOther: string;
  close: string;
  filter: string;
  // Dashboard
  dashboardTitle: string;
  shopAnalysis: string;
  periodThisMonth: string;
  periodLastMonth: string;
  periodYearly: string;
  debtControl: string;
  debtsBalance: string;
  generalReport: string;
  debtTotalOlingan: string;
  debtTotalTolangan: string;
  debtCurrentDebt: string;
  expectedFromClients: string;
  expectedFromClientsTotal: string;
  received: string;
  paid: string;
  sales: string;
  expenses: string;
  mostActiveClient: string;
  debtToSuppliers: string;
  debtToSuppliersGo: string;
  supplierGoodsTaken: string;
  supplierPaid: string;
  supplierCurrentDebt: string;
  navMain: string;
  navDebts: string;
  navReport: string;
  navSupplier: string;
  navExpenses: string;
  navProfile: string;
  navSettings: string;
  navClients: string;
  transactionsThisMonth: string;
  volume: string;
  salesVolumeLabel: string;
  currency: string;
  stable: string;
  noData: string;
  fromPayments: string;
  salesAmountTitle: string;
  totalIncome: string;
  expensesAmountTitle: string;
  totalExpense: string;
  financialIndicators: string;
  recentActivities: string;
  operationalExpenses: string;
  monthlyGrowth: string;
  today: string;
  jamiBalans: string;
  // Mijozlar (Clients)
  clientsTitle: string;
  /** Kartada: mijoz turi */
  clientRoleLabel: string;
  searchClientPlaceholder: string;
  filterAll: string;
  filterDebtors: string;
  filterOverdue: string;
  listFilterLabel: string;
  dueDate: string;
  details: string;
  add: string;
  addSaleTitle: string;
  totalSalesAmountLabel: string;
  paymentAmounts: string;
  dateLabel: string;
  dateOptionalLabel: string;
  dateAndTime: string;
  commentOptional: string;
  saleCommentPlaceholder: string;
  statusOverdue: string;
  statusNew: string;
  statusInPayment: string;
  addClient: string;
  clientsEmpty: string;
  // Yetkazuvchilar (Suppliers)
  suppliersTitle: string;
  searchSupplierPlaceholder: string;
  addSupplier: string;
  categoryFood: string;
  categoryDrinks: string;
  categoryFruits: string;
  categoryServices: string;
  totalDebt: string;
  payBtn: string;
  recordDebtBtn: string;
  suppliersEmpty: string;
  supplierNamePlaceholder: string;
  loading: string;
  // Xarajatlar (Expenses)
  addExpense: string;
  expenseAmount: string;
  expenseAmountPlaceholder: string;
  expenseCategory: string;
  expenseCategoryPlaceholder: string;
  expenseType: string;
  expenseName: string;
  expenseNamePlaceholder: string;
  selectCategory: string;
  selectExpenseType: string;
  addCategory: string;
  addCategoryPrompt: string;
  addExpenseType: string;
  addExpenseTypeModalTitle: string;
  addExpenseTypePlaceholder: string;
  expenseDescription: string;
  expenseDescriptionPlaceholder: string;
  expenseNotePlaceholder: string;
  expenseDate: string;
  totalExpenses: string;
  expensesEmpty: string;
  deleteExpense: string;
  // Reports (hisobotlar)
  reportCardSales: string;
  reportCardExpenses: string;
  reportCardDebtHistory: string;
  reportCardSupplierHistory: string;
  reportCardActivity: string;
  reportSalesHistoryTitle: string;
  reportExpensesHistoryTitle: string;
  reportDebtHistoryTitle: string;
  reportSupplierHistoryTitle: string;
  reportActivityTitle: string;
  editSale: string;
  editExpense: string;
  salesHistoryEmpty: string;
  expensesHistoryEmpty: string;
  debtHistoryEmpty: string;
  supplierHistoryEmpty: string;
  activityEmpty: string;
  reportSectionAnalytical: string;
  reportDescSales: string;
  reportDescExpenses: string;
  reportDescDebt: string;
  reportDescSupplier: string;
  reportDescActivity: string;
  reportPremiumTitle: string;
  reportPremiumDesc: string;
  reportPremiumActivate: string;
  search: string;
  notifications: string;
  notificationsEmpty: string;
  salesReportTitle: string;
  expenseReportTitle: string;
  reportByPaymentTypes: string;
  reportPeriod: string;
  reportChangePeriod: string;
  reportPeriodFrom: string;
  reportPeriodTo: string;
  operationTypeLabel: string;
  operationTypeRepaid: string;
  operationTypeGiven: string;
  applyFilter: string;
  clearFilter: string;
  reportJamiTushum: string;
  reportComparedToLastMonth: string;
  reportCashIncome: string;
  reportCardIncome: string;
  reportBankIncome: string;
  yesterday: string;
}

const translations: Record<LangCode, Translations> = {
  "uz-Latn": {
    appName: "Qarz Daftar",
    loginTitle: "Tizimga kirish",
    loginSubtitle: "Hisobingizga kirish uchun telefon raqamingiz va parolingizni kiriting.",
    phoneLabel: "Telefon raqami",
    passwordLabel: "Parol",
    passwordPlaceholder: "........",
    showPassword: "Parolni ko‘rsatish",
    hidePassword: "Parolni yashirish",
    forgotPassword: "Parolni unutdingizmi?",
    loginButton: "Kirish",
    noAccount: "Hisobingiz yo‘qmi?",
    register: "Ro‘yxatdan o‘tish",
    errorPhoneInvalid: "Telefon raqamini to‘g‘ri kiriting (9 ta raqam)",
    errorPasswordMin: "Parol kamida 8 ta belgidan iborat bo‘lishi kerak",
    errorFullNameRequired: "Ism familiyangizni kiriting",
    errorLogin: "Kirish amalga oshmadi",
    errorApiNotFound: "Serverda login yo‘li topilmadi. Backend ni qayta ishga tushiring.",
    duplicateClientPhone: "Bu raqam allaqachon qo'shilgan",
    resetTitle: "Parolni tiklash",
    resetSubtitle: "Hisobingizga bog‘langan telefon raqamingizni kiriting. Biz sizga tasdiqlash kodini yuboramiz.",
    sendCode: "Kodni yuborish",
    needHelp: "Yordam kerakmi?",
    support: "Qo‘llab-quvvatlash",
    confirmTitle: "Tasdiqlash",
    confirmSubtitle: "Kod Telegram orqali yuboriladi. {phone}",
    resendCode: "Kodni qayta yuborish",
    confirmButton: "Tasdiqlash",
    newPasswordTitle: "Yangi parol",
    newPasswordSubtitle: "Yangi parolingizni kiriting va tasdiqlang.",
    newPasswordLabel: "Yangi parol",
    repeatPasswordLabel: "Parolni takrorlang",
    updatePassword: "Parolni yangilash",
    errorPasswordsMismatch: "Parollar mos kelmadi",
    passwordUpdated: "Parol yangilandi. Endi yangi parol bilan kiring.",
    didntReceiveCode: "Kodni olmadingizmi?",
    sending: "Yuborilmoqda...",
    saving: "Saqlanmoqda...",
    errorCodeInvalid: "6 xonali kodni kiriting",
    errorSendCode: "Kod yuborishda xato",
    errorUpdatePassword: "Parolni yangilashda xato",
    errorCurrentPasswordRequired: "Joriy parolni kiriting",
    errorCurrentPasswordWrong: "Joriy parol noto'g'ri",
    minChars: "Kamida 8 ta belgi",
    repeatPasswordPlaceholder: "Parolni qayta kiriting",
    registerTitle: "Ro‘yxatdan o‘tish",
    stepPersonal: "Shaxsiy ma’lumotlar",
    stepShop: "Do‘kon ma’lumotlari",
    stepVerify: "Tasdiqlash",
    personalTitle: "Shaxsiy ma’lumotlar",
    personalSubtitle: "Ism, telefon va parolni kiriting.",
    fullNameLabel: "Ism",
    fullNamePlaceholder: "Ism Familiya",
    createPasswordLabel: "Parol yarating",
    next: "Keyingi",
    termsPrefix: "Ro‘yxatdan o‘tish orqali siz bizning",
    termsLink: "Foydalanish shartlari",
    shopTitle: "Do‘kon ma’lumotlari",
    shopSubtitle: "Magazin nomi, manzili va ish vaqtini kiriting.",
    shopNameLabel: "Do‘kon nomi",
    shopNamePlaceholder: "Masalan: Al-Madina",
    addressLabel: "Manzil",
    addressPlaceholder: "Manzil",
    workingHours: "Ish vaqti",
    openAt: "09:00",
    closeAt: "18:00",
    otpTitle: "Tasdiqlash kodi",
    otpSubtitle: "Avval Telegram orqali kod oling, so‘ng 6 xonali kodni kiriting ({phone}).",
    sentCodeLabel: "Kod (faqat dev rejim)",
    openTelegramBot: "Telegramda ochish",
    otpTelegramHint: "Quyidagi tugma orqali botga kiring va Start bosing — kod Telegram chatga keladi.",
    otpSmsTelegramNotice: "@qarzdaftarsms_bot orqali kelgan sms kodni tasdiqlang!",
    confirmTelegramHint: "Telegramda kelgan 6 xonali kodni kiriting.",
    resendIn: "Qayta yuborish",
    verifyAndContinue: "Tasdiqlash va yakunlash",
    back: "Orqaga",
    menu: "Menyu",
    appVersion: "QARZ DAFTAR V2.4.0",
    changeProfilePhoto: "Profil rasmini o‘zgartirish",
    profileTitle: "Profil",
    myShop: "Mening Do'konim",
    personalInfo: "Shaxsiy ma'lumotlar",
    shopSettings: "Do'kon sozlamalari",
    tariffPlan: "Tarif rejasi",
    security: "Xavfsizlik",
    currentPasswordLabel: "Joriy parol",
    changePasswordSection: "Parolni almashtirish",
    changePhoneSection: "Telefon raqami",
    phoneChangeViaSecurity:
      "Raqamni o‘zgartirish Telegram orqali kod bilan amalga oshiriladi. Quyidagi tugma orqali Xavfsizlik sahifasiga o‘ting.",
    changePhoneAction: "Raqamni almashtirish",
    selectLanguage: "Tilni tanlash",
    theme: "Mavzu",
    calculateSales: "Savdoni hisoblash",
    calculateSalesAlwaysOn: "Doim yoqilgan",
    balance: "Balans",
    availableBalance: "Mavjud balans",
    totalBalance: "Umumiy balans",
    cash: "Naxt",
    card: "Karta",
    bankAccount: "Bank hisobi",
    paymentMethod: "To'lov turi",
    accounts: "Hisoblar",
    all: "Hammasi",
    mainWallet: "Asosiy hamyon",
    logout: "Chiqish",
    editShopTitle: "Do'kon ma'lumotlarini tahrirlash",
    save: "Saqlash",
    savePayment: "To'lovni saqlash",
    paymentNotSaved: "To'lov saqlanmadi",
    debtNotSaved: "Qarz saqlanmadi",
    debtCategoryGoods: "Tovarlar",
    debtCategoryBorrow: "Qarz berish",
    debtCategoryOther: "Boshqa",
    close: "Yopish",
    filter: "Filter",
    dashboardTitle: "Boshqaruv paneli",
    shopAnalysis: "Tahlil",
    periodThisMonth: "Shu oy",
    periodLastMonth: "O'tgan oy",
    periodYearly: "Yillik",
    debtControl: "Qarzlar nazorati",
    debtsBalance: "Qarzlar balansi",
    generalReport: "Umumiy hisobot",
    debtTotalOlingan: "Ja'mi olingan qarz",
    debtTotalTolangan: "To'langan qarz",
    debtCurrentDebt: "Hozirgi qarz",
    expectedFromClients: "Mijozlardan kutilayotgan mablag'",
    expectedFromClientsTotal: "Mijozlardan kutilmoqda",
    received: "Olingan",
    paid: "To'langan",
    sales: "Savdo",
    expenses: "Xarajat",
    mostActiveClient: "Eng faol mijoz",
    debtToSuppliers: "Yetkazuvchilarga qarz",
    debtToSuppliersGo: "Yetkazuvchilar",
    supplierGoodsTaken: "Mahsulot olindi",
    supplierPaid: "To'landi",
    supplierCurrentDebt: "Joriy qarz",
    navMain: "Asosiy",
    navDebts: "Qarzlar",
    navReport: "Hisobotlar",
    navSupplier: "Yetkazuvchi",
    navExpenses: "Xarajatlar",
    navProfile: "Profil",
    navSettings: "Sozlamalar",
    navClients: "Mijozlar",
    transactionsThisMonth: "Bu oyda {n} ta tranzaksiya",
    volume: "Hajm",
    salesVolumeLabel: "Savdo hajmi",
    currency: "so'm",
    stable: "Barqaror",
    noData: "Hali ma'lumot yo'q",
    fromPayments: "To'lovlar",
    salesAmountTitle: "Savdo summasi",
    totalIncome: "Umumiy tushum",
    expensesAmountTitle: "Xarajatlar summasi",
    totalExpense: "Umumiy xarajat",
    financialIndicators: "Moliyaviy ko'rsatkichlar",
    recentActivities: "So'nggi harakatlar",
    operationalExpenses: "Operatsion xarajatlar",
    monthlyGrowth: "Oylik o'sish",
    today: "bugun",
    jamiBalans: "JAMI BALANS",
    clientsTitle: "Mijozlar",
    clientRoleLabel: "Mijoz",
    searchClientPlaceholder: "Mijozni izlash...",
    filterAll: "Barchasi",
    filterDebtors: "Qarzdorlar",
    filterOverdue: "Muddati o'tgan",
    listFilterLabel: "Ro'yxat",
    dueDate: "Muddat",
    details: "Batafsil",
    add: "Qo'shish",
    addSaleTitle: "Savdo qo'shish",
    totalSalesAmountLabel: "Umumiy savdo summasi (so'm)",
    paymentAmounts: "To'lov miqdorlari",
    dateLabel: "Sana",
    dateOptionalLabel: "Sana (ixtiyoriy)",
    dateAndTime: "Sana va vaqt",
    commentOptional: "Izoh (ixtiyoriy)",
    saleCommentPlaceholder: "Savdo haqida qisqacha ma'lumot...",
    statusOverdue: "Muddati o'tgan",
    statusNew: "Yangi",
    statusInPayment: "To'lanmoqda",
    addClient: "Mijoz qo'shish",
    clientsEmpty: "Mijozlar topilmadi",
    suppliersTitle: "Yetkazuvchilar",
    searchSupplierPlaceholder: "Yetkazuvchini qidirish...",
    addSupplier: "Yetkazuvchi qo'shish",
    categoryFood: "Oziq-ovqat",
    categoryDrinks: "Ichimliklar",
    categoryFruits: "Mevalar",
    categoryServices: "Xizmatlar",
    totalDebt: "UMUMIY QARZ",
    payBtn: "To'lash",
    recordDebtBtn: "Qarz yozish",
    suppliersEmpty: "Yetkazuvchilar topilmadi",
    supplierNamePlaceholder: "Yetkazuvchi nomi",
    loading: "Yuklanmoqda...",
    addExpense: "Xarajat qo'shish",
    expenseAmount: "Summa",
    expenseAmountPlaceholder: "Summani kiriting",
    expenseCategory: "Kategoriya",
    expenseCategoryPlaceholder: "Masalan: ijara, kommunal",
    expenseType: "Xarajat turi",
    expenseName: "Xarajat nomi",
    expenseNamePlaceholder: "Masalan: Ijara, Bozorlik...",
    selectCategory: "Kategoriyani tanlang",
    selectExpenseType: "Xarajat turini tanlang",
    addCategory: "Kategoriya qo'shish",
    addCategoryPrompt: "Yangi kategoriya nomi",
    addExpenseType: "Xarajat turini qo'shish",
    addExpenseTypeModalTitle: "Yangi xarajat turi",
    addExpenseTypePlaceholder: "Masalan: Ijara, Bozorlik",
    expenseDescription: "Izoh (ixtiyoriy)",
    expenseDescriptionPlaceholder: "Qisqacha izoh",
    expenseNotePlaceholder: "Qo'shimcha ma'lumotlar...",
    expenseDate: "Sana",
    totalExpenses: "Jami xarajat",
    expensesEmpty: "Xarajatlar yo'q",
    deleteExpense: "O'chirish",
    reportCardSales: "Savdo tarixi",
    reportCardExpenses: "Xarajatlar tarixi",
    reportCardDebtHistory: "Mijozlar qarz/to'lov tarixi",
    reportCardSupplierHistory: "Yetkazuvchi tovar/pul tarixi",
    reportCardActivity: "Barcha o'zgarishlar",
    reportSalesHistoryTitle: "Savdo qo'shilganlar tarixi",
    reportExpensesHistoryTitle: "Xarajatlar tarixi",
    reportDebtHistoryTitle: "Mijozlar qarz olgan / to'lagan tarixi",
    reportSupplierHistoryTitle: "Yetkazuvchi tovar olgan / pul bergan tarixi",
    reportActivityTitle: "Har bir qilingan o'zgarishlar",
    editSale: "Savdoni tahrirlash",
    editExpense: "Xarajatni tahrirlash",
    salesHistoryEmpty: "Savdolar yo'q",
    expensesHistoryEmpty: "Xarajatlar yo'q",
    debtHistoryEmpty: "Qarz/to'lov tarixi yo'q",
    supplierHistoryEmpty: "Yetkazuvchi tarixi yo'q",
    activityEmpty: "O'zgarishlar yo'q",
    reportSectionAnalytical: "TAHLILIY HISOBOTLAR",
    reportDescSales: "Barcha savdo amallari tahlili",
    reportDescExpenses: "Operatsion va shaxsiy xarajatlar",
    reportDescDebt: "Debitorlik qarzdorligi dinamikasi",
    reportDescSupplier: "Tovar va pul aylanmasi hisobi",
    reportDescActivity: "Tizimdagi barcha loglar va audit",
    reportPremiumTitle: "Premium Hisobotlar",
    reportPremiumDesc: "Grafik va diagrammalar bilan chuqur tahlilga ega bo'ling.",
    reportPremiumActivate: "FAOLLASHTIRISH",
    search: "Qidirish",
    notifications: "Bildirishnomalar",
    notificationsEmpty: "Sizga yuborilgan bildirishnomalar yo‘q",
    salesReportTitle: "Savdo hisoboti",
    expenseReportTitle: "Xarajat hisoboti",
    reportByPaymentTypes: "To'lov turlari bo'yicha",
    reportPeriod: "Muddat",
    reportChangePeriod: "O'ZGARTIRISH",
    reportPeriodFrom: "Dan",
    reportPeriodTo: "Gacha",
    operationTypeLabel: "Amaliyot turi",
    operationTypeRepaid: "Qarz qaytargan",
    operationTypeGiven: "Qarzga bergan",
    applyFilter: "Qo'llash",
    clearFilter: "Tozalash",
    reportJamiTushum: "Jami tushum",
    reportComparedToLastMonth: "o'tgan oyga nisbatan",
    reportCashIncome: "Naqd kirim",
    reportCardIncome: "Karta kirim",
    reportBankIncome: "Bank kirim",
    yesterday: "Kecha",
  },
  "uz-Cyrl": {
    appName: "Қарз Дафтар",
    loginTitle: "Тизимга кириш",
    loginSubtitle: "Ҳисобингизга кириш учун телефон рақамингиз ва паролингизни киритинг.",
    phoneLabel: "Телефон рақами",
    passwordLabel: "Парол",
    passwordPlaceholder: "........",
    showPassword: "Паролни кўрсатиш",
    hidePassword: "Паролни яшириш",
    forgotPassword: "Паролни унутдингизми?",
    loginButton: "Кириш",
    noAccount: "Ҳисобингиз йўқми?",
    register: "Рўйхатдан ўтиш",
    errorPhoneInvalid: "Телефон рақамини тўғри киритинг (9 та рақам)",
    errorPasswordMin: "Парол камида 8 та белгидан иборат бўлиши керак",
    errorFullNameRequired: "Исм фамилиянгизни киритинг",
    errorLogin: "Кириш амалга ошмади",
    errorApiNotFound: "Серверда логин йўли топилмади. Backend ни қайта ишга туширинг.",
    duplicateClientPhone: "Бу рақам аллақачон қўшилган",
    resetTitle: "Паролни тиклаш",
    resetSubtitle: "Ҳисобингизга боғланган телефон рақамингизни киритинг. Биз сизга тасдиқлаш кодини юборамиз.",
    sendCode: "Кодни юбориш",
    needHelp: "Ёрдам керакми?",
    support: "Қўллаб-қувватлаш",
    confirmTitle: "Тасдиқлаш",
    confirmSubtitle: "Код Telegram орқали юборилади. {phone}",
    resendCode: "Кодни қайта юбориш",
    confirmButton: "Тасдиқлаш",
    newPasswordTitle: "Янги парол",
    newPasswordSubtitle: "Янги паролингизни киритинг ва тасдиқланг.",
    newPasswordLabel: "Янги парол",
    repeatPasswordLabel: "Паролни такрорланг",
    updatePassword: "Паролни янгилаш",
    errorPasswordsMismatch: "Пароллар мос келмади",
    passwordUpdated: "Парол янгиланди. Энди янги парол билан киринг.",
    didntReceiveCode: "Кодни олмадингизми?",
    sending: "Юборилмоқда...",
    saving: "Сақланмоқда...",
    errorCodeInvalid: "6 хонали кодни киритинг",
    errorSendCode: "Код юборишда хато",
    errorUpdatePassword: "Паролни янгилашда хато",
    errorCurrentPasswordRequired: "Жорий паролни киритинг",
    errorCurrentPasswordWrong: "Жорий парол нотўғри",
    minChars: "Камида 8 та белги",
    repeatPasswordPlaceholder: "Паролни қайта киритинг",
    registerTitle: "Рўйхатдан ўтиш",
    stepPersonal: "Шахсий маълумотлар",
    stepShop: "Дўкон маълумотлари",
    stepVerify: "Тасдиқлаш",
    personalTitle: "Шахсий маълумотлар",
    personalSubtitle: "Исм, телефон ва паролни киритинг.",
    fullNameLabel: "Исм",
    fullNamePlaceholder: "Исм Фамилия",
    createPasswordLabel: "Парол яратинг",
    next: "Кейинги",
    termsPrefix: "Рўйхатдан ўтиш орқали сиз бизнинг",
    termsLink: "Фойдаланиш шартлари",
    shopTitle: "Дўкон маълумотлари",
    shopSubtitle: "Магазин номи, манзили ва иш вақтини киритинг.",
    shopNameLabel: "Дўкон номи",
    shopNamePlaceholder: "Масалан: Ал-Мадина",
    addressLabel: "Манзил",
    addressPlaceholder: "Манзил",
    workingHours: "Иш вақти",
    openAt: "09:00",
    closeAt: "18:00",
    otpTitle: "Тасдиқлаш коди",
    otpSubtitle: "Аввал Telegram орқали код олинг, сўнг 6 хонали кодни киритинг ({phone}).",
    sentCodeLabel: "Код (фақат dev режим)",
    openTelegramBot: "Telegramда очиш",
    otpTelegramHint: "Қуйидаги тугма орқали ботга киринг ва Start босинг — код Telegram чатга келади.",
    otpSmsTelegramNotice: "@qarzdaftarsms_bot орқали келган sms кодни тасдиқланг!",
    confirmTelegramHint: "Telegramда келган 6 хонали кодни киритинг.",
    resendIn: "Қайта юбориш",
    verifyAndContinue: "Тасдиқлаш ва якунлаш",
    back: "Орқага",
    menu: "Меню",
    appVersion: "ҚАРЗ ДАФТАР V2.4.0",
    changeProfilePhoto: "Профил расмини ўзгартириш",
    profileTitle: "Профил",
    myShop: "Менинг Дўконим",
    personalInfo: "Шахсий маълумотлар",
    shopSettings: "Дўкон созламалари",
    tariffPlan: "Тариф режаси",
    security: "Хавфсизлик",
    currentPasswordLabel: "Жорий парол",
    changePasswordSection: "Паролни алмаштириш",
    changePhoneSection: "Телефон рақами",
    phoneChangeViaSecurity:
      "Рақамни ўзгартириш Telegram орқали код билан амалга оширилади. Қуйидаги тугма орқали Хавфсизлик саҳифасига ўтинг.",
    changePhoneAction: "Рақамни алмаштириш",
    selectLanguage: "Тилни танлаш",
    theme: "Мавзу",
    calculateSales: "Савдони ҳисоблаш",
    calculateSalesAlwaysOn: "Доим ёқилган",
    balance: "Баланс",
    availableBalance: "Мавжуд баланс",
    totalBalance: "Умумий баланс",
    cash: "Нақд",
    card: "Карта",
    bankAccount: "Банк ҳисоби",
    paymentMethod: "Тўлов тури",
    accounts: "Ҳисоблар",
    all: "Ҳаммаси",
    mainWallet: "Асосий ҳамён",
    logout: "Чиқиш",
    editShopTitle: "Дўкон маълумотларини таҳрирлаш",
    save: "Сақлаш",
    savePayment: "Тўловни сақлаш",
    paymentNotSaved: "Тўлов сақланмади",
    debtNotSaved: "Қарз сақланмади",
    debtCategoryGoods: "Товарлар",
    debtCategoryBorrow: "Қарз бериш",
    debtCategoryOther: "Бошқа",
    close: "Ёпиш",
    filter: "Филтр",
    dashboardTitle: "Бошқарув панели",
    shopAnalysis: "Таҳлил",
    periodThisMonth: "Шу ой",
    periodLastMonth: "Ўтган ой",
    periodYearly: "Йиллик",
    debtControl: "Қарзлар назорати",
    debtsBalance: "Қарзлар баланси",
    generalReport: "Умумий ҳисобот",
    debtTotalOlingan: "Жаъми олинган қарз",
    debtTotalTolangan: "Тўланган қарз",
    debtCurrentDebt: "Ҳозирги қарз",
    expectedFromClients: "Мижозлардан кутилаётган маблағ",
    expectedFromClientsTotal: "Мижозлардан кутилмоқда",
    received: "Олинган",
    paid: "Тўланган",
    sales: "Савдо",
    expenses: "Харажат",
    mostActiveClient: "Энг фаол мижоз",
    debtToSuppliers: "Етказувчиларга қарз",
    debtToSuppliersGo: "Етказувчилар",
    supplierGoodsTaken: "Маҳсулот олинди",
    supplierPaid: "Тўланди",
    supplierCurrentDebt: "Жорий қарз",
    navMain: "Асосий",
    navDebts: "Қарзлар",
    navReport: "Ҳисоботлар",
    navSupplier: "Етказувчи",
    navExpenses: "Харажатлар",
    navProfile: "Профил",
    navSettings: "Созламалар",
    navClients: "Мижозлар",
    transactionsThisMonth: "Бу ойда {n} та транзакция",
    volume: "Ҳажм",
    salesVolumeLabel: "Савдо ҳажми",
    currency: "сўм",
    stable: "Барқарор",
    noData: "Ҳали маълумот йўқ",
    fromPayments: "Тўловлар",
    salesAmountTitle: "Савдо суммаси",
    totalIncome: "Умумий тушум",
    expensesAmountTitle: "Харажатлар суммаси",
    totalExpense: "Умумий харажат",
    financialIndicators: "Молиявий кўрсаткичлар",
    recentActivities: "Сўнгги ҳаракатлар",
    operationalExpenses: "Операцион харажатлар",
    monthlyGrowth: "Ойлик ўсиш",
    today: "бугун",
    jamiBalans: "ЖАМИ БАЛАНС",
    clientsTitle: "Мижозлар",
    clientRoleLabel: "Мижоз",
    searchClientPlaceholder: "Мижозни излаш...",
    filterAll: "Барчаси",
    filterDebtors: "Қарздорлар",
    filterOverdue: "Муддати ўтган",
    listFilterLabel: "Рўйхат",
    dueDate: "Муддат",
    details: "Батафсил",
    add: "Қўшиш",
    addSaleTitle: "Савдо қўшиш",
    totalSalesAmountLabel: "Умумий савдо суммаси (сўм)",
    paymentAmounts: "Тўлов микдорлари",
    dateLabel: "Сана",
    dateOptionalLabel: "Сана (ихтиёрий)",
    dateAndTime: "Сана ва вақт",
    commentOptional: "Изоҳ (ихтиёрий)",
    saleCommentPlaceholder: "Савдо ҳақида қисқача маълумот...",
    statusOverdue: "Муддати ўтган",
    statusNew: "Янги",
    statusInPayment: "Тўланмоқда",
    addClient: "Мижоз қўшиш",
    clientsEmpty: "Мижозлар топилмади",
    suppliersTitle: "Етказувчилар",
    searchSupplierPlaceholder: "Етказувчини излаш...",
    addSupplier: "Етказувчи қўшиш",
    categoryFood: "Озиқ-овқат",
    categoryDrinks: "Ичимликлар",
    categoryFruits: "Мевалар",
    categoryServices: "Хизматлар",
    totalDebt: "УМУМИЙ ҚАРЗ",
    payBtn: "Тўлаш",
    recordDebtBtn: "Қарз ёзиш",
    suppliersEmpty: "Етказувчилар топилмади",
    supplierNamePlaceholder: "Етказувчи номи",
    loading: "Юкланмоқда...",
    addExpense: "Харажат қўшиш",
    expenseAmount: "Сумма",
    expenseAmountPlaceholder: "Суммани киритинг",
    expenseCategory: "Категория",
    expenseCategoryPlaceholder: "Масалан: ижара, коммунал",
    expenseType: "Харажат тури",
    expenseName: "Харажат номи",
    expenseNamePlaceholder: "Масалан: Ижара, Бозорлик...",
    selectCategory: "Категорияни танланг",
    selectExpenseType: "Харажат турини танланг",
    addCategory: "Категория қўшиш",
    addCategoryPrompt: "Янги категория номи",
    addExpenseType: "Харажат турини қўшиш",
    addExpenseTypeModalTitle: "Янги харажат тури",
    addExpenseTypePlaceholder: "Масалан: Ижара, Бозорлик",
    expenseDescription: "Изоҳ (ихтиёрий)",
    expenseDescriptionPlaceholder: "Қисқача изоҳ",
    expenseNotePlaceholder: "Қўшимча маълумотлар...",
    expenseDate: "Сана",
    totalExpenses: "Жами харажат",
    expensesEmpty: "Харажатлар йўқ",
    deleteExpense: "Ўчириш",
    reportCardSales: "Савдо тарихи",
    reportCardExpenses: "Харажатлар тарихи",
    reportCardDebtHistory: "Мижозлар қарз/тўлов тарихи",
    reportCardSupplierHistory: "Етказувчи товар/пул тарихи",
    reportCardActivity: "Барча ўзгаришлар",
    reportSalesHistoryTitle: "Савдо қўшилганлар тарихи",
    reportExpensesHistoryTitle: "Харажатлар тарихи",
    reportDebtHistoryTitle: "Мижозлар қарз олган / тўлаган тарихи",
    reportSupplierHistoryTitle: "Етказувчи товар олган / пул берилган тарихи",
    reportActivityTitle: "Ҳар бир қилинган ўзгаришлар",
    editSale: "Савдони таҳрирлаш",
    editExpense: "Харажатни таҳрирлаш",
    salesHistoryEmpty: "Савдолар йўқ",
    expensesHistoryEmpty: "Харажатлар йўқ",
    debtHistoryEmpty: "Қарз/тўлов тарихи йўқ",
    supplierHistoryEmpty: "Етказувчи тарихи йўқ",
    activityEmpty: "Ўзгаришлар йўқ",
    reportSectionAnalytical: "ТАҲЛИЛИЙ ҲИСОБОТЛАР",
    reportDescSales: "Барча савдо амаллари таҳлили",
    reportDescExpenses: "Операцион ва шахсий харажатлар",
    reportDescDebt: "Дебиторлик қарздорлиги динамикаси",
    reportDescSupplier: "Товар ва пул айланмаси ҳисоби",
    reportDescActivity: "Тизимдаги барча логлар ва аудит",
    reportPremiumTitle: "Premium Ҳисоботлар",
    reportPremiumDesc: "График ва диаграммалар билан чуқур таҳлилга эга бўлинг.",
    reportPremiumActivate: "ФАОЛЛАШТИРИШ",
    search: "Қидириш",
    notifications: "Билдиришномалар",
    notificationsEmpty: "Сизга юборилган билдиришномалар йўқ",
    salesReportTitle: "Савдо ҳисоботи",
    expenseReportTitle: "Харажат ҳисоботи",
    reportByPaymentTypes: "Тўлов турлари бўйича",
    reportPeriod: "Муддат",
    reportChangePeriod: "ЎЗГАРТИРИШ",
    reportPeriodFrom: "Дан",
    reportPeriodTo: "Гача",
    operationTypeLabel: "Амалиёт тури",
    operationTypeRepaid: "Қарз қайтарган",
    operationTypeGiven: "Қарзга берган",
    applyFilter: "Қўллаш",
    clearFilter: "Тозалаш",
    reportJamiTushum: "Жами тушум",
    reportComparedToLastMonth: "ўтган ойга нисбатан",
    reportCashIncome: "Нақд кирим",
    reportCardIncome: "Карта кирим",
    reportBankIncome: "Банк кирим",
    yesterday: "Кеча",
  },
  en: {
    appName: "Qarz Daftar",
    loginTitle: "Log in",
    loginSubtitle: "Enter your phone number and password to access your account.",
    phoneLabel: "Phone number",
    passwordLabel: "Password",
    passwordPlaceholder: "........",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPassword: "Forgot password?",
    loginButton: "Log in",
    noAccount: "Don't have an account?",
    register: "Register",
    errorPhoneInvalid: "Enter a valid phone number (9 digits)",
    errorPasswordMin: "Password must be at least 8 characters",
    errorFullNameRequired: "Enter your full name",
    errorLogin: "Login failed",
    errorApiNotFound: "Login route not found. Restart the backend server.",
    duplicateClientPhone: "This phone number is already added",
    resetTitle: "Password recovery",
    resetSubtitle: "Enter the phone number linked to your account. We will send you a verification code.",
    sendCode: "Send code",
    needHelp: "Need help?",
    support: "Support",
    confirmTitle: "Verification",
    confirmSubtitle: "The code is sent via Telegram. {phone}",
    resendCode: "Resend code",
    confirmButton: "Verify",
    newPasswordTitle: "New password",
    newPasswordSubtitle: "Enter and confirm your new password.",
    newPasswordLabel: "New password",
    repeatPasswordLabel: "Repeat password",
    updatePassword: "Update password",
    errorPasswordsMismatch: "Passwords do not match",
    passwordUpdated: "Password updated. You can now log in with your new password.",
    didntReceiveCode: "Didn't receive the code?",
    sending: "Sending...",
    saving: "Saving...",
    errorCodeInvalid: "Enter the 6-digit code",
    errorSendCode: "Failed to send code",
    errorUpdatePassword: "Failed to update password",
    errorCurrentPasswordRequired: "Enter your current password",
    errorCurrentPasswordWrong: "Current password is incorrect",
    minChars: "At least 8 characters",
    repeatPasswordPlaceholder: "Repeat password",
    registerTitle: "Register",
    stepPersonal: "Personal info",
    stepShop: "Shop details",
    stepVerify: "Verification",
    personalTitle: "Personal information",
    personalSubtitle: "Enter your name, phone and password.",
    fullNameLabel: "Full name",
    fullNamePlaceholder: "John Doe",
    createPasswordLabel: "Create password",
    next: "Next",
    termsPrefix: "By signing up you agree to our",
    termsLink: "Terms of Service",
    shopTitle: "Shop details",
    shopSubtitle: "Enter shop name, address and working hours.",
    shopNameLabel: "Shop name",
    shopNamePlaceholder: "e.g. Al-Madina",
    addressLabel: "Address",
    addressPlaceholder: "Address",
    workingHours: "Working hours",
    openAt: "09:00",
    closeAt: "18:00",
    otpTitle: "Verification code",
    otpSubtitle: "Get the code via Telegram first, then enter the 6-digit code ({phone}).",
    sentCodeLabel: "Code (dev only)",
    openTelegramBot: "Open in Telegram",
    otpTelegramHint: "Open the bot via the button below and press Start — the code arrives in your Telegram chat.",
    otpSmsTelegramNotice: "Confirm the code you received via @qarzdaftarsms_bot!",
    confirmTelegramHint: "Enter the 6-digit code you received in Telegram.",
    resendIn: "Resend in",
    verifyAndContinue: "Verify and continue",
    back: "Back",
    menu: "Menu",
    appVersion: "QARZ DAFTAR V2.4.0",
    changeProfilePhoto: "Change profile photo",
    profileTitle: "Profile",
    myShop: "My Shop",
    personalInfo: "Personal information",
    shopSettings: "Shop settings",
    tariffPlan: "Tariff plan",
    security: "Security",
    currentPasswordLabel: "Current password",
    changePasswordSection: "Change password",
    changePhoneSection: "Phone number",
    phoneChangeViaSecurity:
      "To change your number, confirm with a code sent via Telegram. Use the button below to open the Security page.",
    changePhoneAction: "Change phone number",
    selectLanguage: "Select language",
    theme: "Theme",
    calculateSales: "Calculate sales",
    calculateSalesAlwaysOn: "Always on",
    balance: "Balance",
    availableBalance: "Available balance",
    totalBalance: "Total balance",
    cash: "Cash",
    card: "Card",
    bankAccount: "Bank",
    paymentMethod: "Payment method",
    accounts: "Accounts",
    all: "All",
    mainWallet: "Main wallet",
    logout: "Log out",
    editShopTitle: "Edit shop details",
    save: "Save",
    savePayment: "Save payment",
    paymentNotSaved: "Payment could not be saved",
    debtNotSaved: "Debt could not be saved",
    debtCategoryGoods: "Goods",
    debtCategoryBorrow: "Lending",
    debtCategoryOther: "Other",
    close: "Close",
    filter: "Filter",
    dashboardTitle: "Control panel",
    shopAnalysis: "Analysis",
    periodThisMonth: "This month",
    periodLastMonth: "Last month",
    periodYearly: "Yearly",
    debtControl: "Debt control",
    debtsBalance: "Debts balance",
    generalReport: "General report",
    debtTotalOlingan: "Total debt received",
    debtTotalTolangan: "Paid debt",
    debtCurrentDebt: "Current debt",
    expectedFromClients: "Expected from clients",
    expectedFromClientsTotal: "Expected from clients",
    received: "Received",
    paid: "Paid",
    sales: "Sales",
    expenses: "Expenses",
    mostActiveClient: "Most active client",
    debtToSuppliers: "Debt to suppliers",
    debtToSuppliersGo: "Suppliers",
    supplierGoodsTaken: "Goods received",
    supplierPaid: "Paid",
    supplierCurrentDebt: "Current debt",
    navMain: "Main",
    navDebts: "Debts",
    navReport: "Report",
    navSupplier: "Supplier",
    navExpenses: "Expenses",
    navProfile: "Profile",
    navSettings: "Settings",
    navClients: "Clients",
    transactionsThisMonth: "{n} transactions this month",
    volume: "Volume",
    salesVolumeLabel: "Sales volume",
    currency: "UZS",
    stable: "Stable",
    noData: "No data yet",
    fromPayments: "From payments",
    salesAmountTitle: "Sales amount",
    totalIncome: "Total income",
    expensesAmountTitle: "Expenses amount",
    totalExpense: "Total expense",
    financialIndicators: "Financial indicators",
    recentActivities: "Recent activities",
    operationalExpenses: "Operational expenses",
    monthlyGrowth: "Monthly growth",
    today: "today",
    jamiBalans: "TOTAL BALANCE",
    clientsTitle: "Clients",
    clientRoleLabel: "Client",
    searchClientPlaceholder: "Search client...",
    filterAll: "All",
    filterDebtors: "Debtors",
    filterOverdue: "Overdue",
    listFilterLabel: "List",
    dueDate: "Due",
    details: "Details",
    add: "Add",
    addSaleTitle: "Add sale",
    totalSalesAmountLabel: "Total sales amount (UZS)",
    paymentAmounts: "Payment amounts",
    dateLabel: "Date",
    dateOptionalLabel: "Date (optional)",
    dateAndTime: "Date and time",
    commentOptional: "Comment (optional)",
    saleCommentPlaceholder: "Brief information about the sale...",
    statusOverdue: "Overdue",
    statusNew: "New",
    statusInPayment: "In payment",
    addClient: "Add client",
    clientsEmpty: "No clients found",
    suppliersTitle: "Suppliers",
    searchSupplierPlaceholder: "Search supplier...",
    addSupplier: "Add supplier",
    categoryFood: "Food",
    categoryDrinks: "Drinks",
    categoryFruits: "Fruits",
    categoryServices: "Services",
    totalDebt: "TOTAL DEBT",
    payBtn: "Pay",
    recordDebtBtn: "Record debt",
    suppliersEmpty: "No suppliers found",
    supplierNamePlaceholder: "Supplier name",
    loading: "Loading...",
    addExpense: "Add expense",
    expenseAmount: "Amount",
    expenseAmountPlaceholder: "Enter amount",
    expenseCategory: "Category",
    expenseCategoryPlaceholder: "e.g. rent, utilities",
    expenseType: "Expense type",
    expenseName: "Expense name",
    expenseNamePlaceholder: "e.g. Rent, Groceries...",
    selectCategory: "Select category",
    selectExpenseType: "Select expense type",
    addCategory: "Add category",
    addCategoryPrompt: "New category name",
    addExpenseType: "Add expense type",
    addExpenseTypeModalTitle: "New expense type",
    addExpenseTypePlaceholder: "e.g. Rent, Groceries",
    expenseDescription: "Note (optional)",
    expenseDescriptionPlaceholder: "Short note",
    expenseNotePlaceholder: "Additional information...",
    expenseDate: "Date",
    totalExpenses: "Total expenses",
    expensesEmpty: "No expenses",
    deleteExpense: "Delete",
    reportCardSales: "Sales history",
    reportCardExpenses: "Expenses history",
    reportCardDebtHistory: "Customer debt/payment history",
    reportCardSupplierHistory: "Supplier goods/payment history",
    reportCardActivity: "All changes",
    reportSalesHistoryTitle: "Sales history",
    reportExpensesHistoryTitle: "Expenses history",
    reportDebtHistoryTitle: "Customer debt and payment history",
    reportSupplierHistoryTitle: "Supplier goods and payment history",
    reportActivityTitle: "All changes made",
    editSale: "Edit sale",
    editExpense: "Edit expense",
    salesHistoryEmpty: "No sales",
    expensesHistoryEmpty: "No expenses",
    debtHistoryEmpty: "No debt history",
    supplierHistoryEmpty: "No supplier history",
    activityEmpty: "No changes",
    reportSectionAnalytical: "ANALYTICAL REPORTS",
    reportDescSales: "Analysis of all sales transactions",
    reportDescExpenses: "Operational and personal expenses",
    reportDescDebt: "Accounts receivable dynamics",
    reportDescSupplier: "Goods and money turnover accounting",
    reportDescActivity: "All logs and audit in the system",
    reportPremiumTitle: "Premium Reports",
    reportPremiumDesc: "Get in-depth analysis with graphs and diagrams.",
    reportPremiumActivate: "ACTIVATE",
    search: "Search",
    notifications: "Notifications",
    notificationsEmpty: "There are no notifications for you",
    salesReportTitle: "Sales report",
    expenseReportTitle: "Expense report",
    reportByPaymentTypes: "By payment types",
    reportPeriod: "Period",
    reportChangePeriod: "CHANGE",
    reportPeriodFrom: "From",
    reportPeriodTo: "To",
    operationTypeLabel: "Operation type",
    operationTypeRepaid: "Debt repaid",
    operationTypeGiven: "Debt given",
    applyFilter: "Apply",
    clearFilter: "Clear",
    reportJamiTushum: "Total income",
    reportComparedToLastMonth: "compared to last month",
    reportCashIncome: "Cash income",
    reportCardIncome: "Card income",
    reportBankIncome: "Bank income",
    yesterday: "Yesterday",
  },
  ru: {
    appName: "Қарз Дафтар",
    loginTitle: "Вход",
    loginSubtitle: "Введите номер телефона и пароль для входа в аккаунт.",
    phoneLabel: "Номер телефона",
    passwordLabel: "Пароль",
    passwordPlaceholder: "........",
    showPassword: "Показать пароль",
    hidePassword: "Скрыть пароль",
    forgotPassword: "Забыли пароль?",
    loginButton: "Войти",
    noAccount: "Нет аккаунта?",
    register: "Регистрация",
    errorPhoneInvalid: "Введите корректный номер (9 цифр)",
    errorPasswordMin: "Пароль должен быть не менее 8 символов",
    errorFullNameRequired: "Введите имя и фамилию",
    errorLogin: "Вход не выполнен",
    errorApiNotFound: "Маршрут входа не найден. Перезапустите backend-сервер.",
    duplicateClientPhone: "Этот номер уже добавлен",
    resetTitle: "Восстановление пароля",
    resetSubtitle: "Введите номер телефона, привязанный к аккаунту. Мы отправим код подтверждения.",
    sendCode: "Отправить код",
    needHelp: "Нужна помощь?",
    support: "Поддержка",
    confirmTitle: "Подтверждение",
    confirmSubtitle: "Код отправляется через Telegram. {phone}",
    resendCode: "Отправить повторно",
    confirmButton: "Подтвердить",
    newPasswordTitle: "Новый пароль",
    newPasswordSubtitle: "Введите и подтвердите новый пароль.",
    newPasswordLabel: "Новый пароль",
    repeatPasswordLabel: "Повторите пароль",
    updatePassword: "Обновить пароль",
    errorPasswordsMismatch: "Пароли не совпадают",
    passwordUpdated: "Пароль изменён. Войдите с новым паролем.",
    didntReceiveCode: "Не получили код?",
    sending: "Отправка...",
    saving: "Сохранение...",
    errorCodeInvalid: "Введите 6-значный код",
    errorSendCode: "Ошибка отправки кода",
    errorUpdatePassword: "Ошибка обновления пароля",
    errorCurrentPasswordRequired: "Введите текущий пароль",
    errorCurrentPasswordWrong: "Текущий пароль неверный",
    minChars: "Не менее 8 символов",
    repeatPasswordPlaceholder: "Повторите пароль",
    registerTitle: "Регистрация",
    stepPersonal: "Личные данные",
    stepShop: "Данные магазина",
    stepVerify: "Подтверждение",
    personalTitle: "Личная информация",
    personalSubtitle: "Введите имя, телефон и пароль.",
    fullNameLabel: "Имя",
    fullNamePlaceholder: "Имя Фамилия",
    createPasswordLabel: "Создать пароль",
    next: "Далее",
    termsPrefix: "Регистрируясь, вы соглашаетесь с",
    termsLink: "Условиями использования",
    shopTitle: "Данные магазина",
    shopSubtitle: "Введите название, адрес и часы работы.",
    shopNameLabel: "Название магазина",
    shopNamePlaceholder: "Напр. Ал-Мадина",
    addressLabel: "Адрес",
    addressPlaceholder: "Адрес",
    workingHours: "Время работы",
    openAt: "09:00",
    closeAt: "18:00",
    otpTitle: "Код подтверждения",
    otpSubtitle: "Сначала получите код в Telegram, затем введите 6 цифр ({phone}).",
    sentCodeLabel: "Код (только dev)",
    openTelegramBot: "Открыть в Telegram",
    otpTelegramHint: "Перейдите к боту по кнопке ниже и нажмите Start — код придёт в чат Telegram.",
    otpSmsTelegramNotice: "Подтвердите код, полученный через @qarzdaftarsms_bot!",
    confirmTelegramHint: "Введите 6-значный код из Telegram.",
    resendIn: "Повторная отправка",
    verifyAndContinue: "Подтвердить и продолжить",
    back: "Назад",
    menu: "Меню",
    appVersion: "QARZ DAFTAR V2.4.0",
    changeProfilePhoto: "Сменить фото профиля",
    profileTitle: "Профиль",
    myShop: "Мой магазин",
    personalInfo: "Личные данные",
    shopSettings: "Настройки магазина",
    tariffPlan: "Тарифный план",
    security: "Безопасность",
    currentPasswordLabel: "Текущий пароль",
    changePasswordSection: "Смена пароля",
    changePhoneSection: "Номер телефона",
    phoneChangeViaSecurity:
      "Смена номера подтверждается кодом в Telegram. Перейдите на страницу «Безопасность» по кнопке ниже.",
    changePhoneAction: "Сменить номер",
    selectLanguage: "Выбор языка",
    theme: "Тема",
    calculateSales: "Считать продажи",
    calculateSalesAlwaysOn: "Всегда включено",
    balance: "Баланс",
    availableBalance: "Доступный баланс",
    totalBalance: "Общий баланс",
    cash: "Наличные",
    card: "Карта",
    bankAccount: "Банк",
    paymentMethod: "Способ оплаты",
    accounts: "Счета",
    all: "Все",
    mainWallet: "Основной кошелёк",
    logout: "Выйти",
    editShopTitle: "Редактировать данные магазина",
    save: "Сохранить",
    savePayment: "Сохранить оплату",
    paymentNotSaved: "Оплата не сохранена",
    debtNotSaved: "Долг не сохранён",
    debtCategoryGoods: "Товары",
    debtCategoryBorrow: "Выдача в долг",
    debtCategoryOther: "Другое",
    close: "Закрыть",
    filter: "Фильтр",
    dashboardTitle: "Панель управления",
    shopAnalysis: "Анализ",
    periodThisMonth: "Этот месяц",
    periodLastMonth: "Прошлый месяц",
    periodYearly: "Годовой",
    debtControl: "Контроль долгов",
    debtsBalance: "Баланс долгов",
    generalReport: "Общий отчёт",
    debtTotalOlingan: "Всего выдано в долг",
    debtTotalTolangan: "Погашено",
    debtCurrentDebt: "Текущий долг",
    expectedFromClients: "Ожидается от клиентов",
    expectedFromClientsTotal: "Ожидается от клиентов",
    received: "Получено",
    paid: "Оплачено",
    sales: "Продажи",
    expenses: "Расходы",
    mostActiveClient: "Самый активный клиент",
    debtToSuppliers: "Долг поставщикам",
    debtToSuppliersGo: "Поставщики",
    supplierGoodsTaken: "Товар получено",
    supplierPaid: "Оплачено",
    supplierCurrentDebt: "Текущий долг",
    navMain: "Главная",
    navDebts: "Долги",
    navReport: "Отчёт",
    navSupplier: "Поставщик",
    navExpenses: "Расходы",
    navProfile: "Профиль",
    navSettings: "Настройки",
    navClients: "Клиенты",
    transactionsThisMonth: "{n} транзакций за месяц",
    volume: "Объём",
    salesVolumeLabel: "Объём продаж",
    currency: "сум",
    stable: "Стабильно",
    noData: "Пока нет данных",
    fromPayments: "Из платежей",
    salesAmountTitle: "Сумма продаж",
    totalIncome: "Общий доход",
    expensesAmountTitle: "Сумма расходов",
    totalExpense: "Общий расход",
    financialIndicators: "Финансовые показатели",
    recentActivities: "Последние действия",
    operationalExpenses: "Операционные расходы",
    monthlyGrowth: "Месячный рост",
    today: "сегодня",
    jamiBalans: "ОБЩИЙ БАЛАНС",
    clientsTitle: "Клиенты",
    clientRoleLabel: "Клиент",
    searchClientPlaceholder: "Поиск клиента...",
    filterAll: "Все",
    filterDebtors: "Должники",
    filterOverdue: "Просрочено",
    listFilterLabel: "Список",
    dueDate: "Срок",
    details: "Подробнее",
    add: "Добавить",
    addSaleTitle: "Добавить продажу",
    totalSalesAmountLabel: "Общая сумма продаж (сум)",
    paymentAmounts: "Суммы оплаты",
    dateLabel: "Дата",
    dateOptionalLabel: "Дата (необязательно)",
    dateAndTime: "Дата и время",
    commentOptional: "Комментарий (необязательно)",
    saleCommentPlaceholder: "Краткая информация о продаже...",
    statusOverdue: "Просрочено",
    statusNew: "Новый",
    statusInPayment: "В оплате",
    addClient: "Добавить клиента",
    clientsEmpty: "Клиенты не найдены",
    suppliersTitle: "Поставщики",
    searchSupplierPlaceholder: "Поиск поставщика...",
    addSupplier: "Добавить поставщика",
    categoryFood: "Продукты",
    categoryDrinks: "Напитки",
    categoryFruits: "Фрукты",
    categoryServices: "Услуги",
    totalDebt: "ОБЩИЙ ДОЛГ",
    payBtn: "Оплатить",
    recordDebtBtn: "Записать долг",
    suppliersEmpty: "Поставщики не найдены",
    supplierNamePlaceholder: "Название поставщика",
    loading: "Загрузка...",
    addExpense: "Добавить расход",
    expenseAmount: "Сумма",
    expenseAmountPlaceholder: "Введите сумму",
    expenseCategory: "Категория",
    expenseCategoryPlaceholder: "Напр.: аренда, коммуналка",
    expenseType: "Вид расхода",
    expenseName: "Название расхода",
    expenseNamePlaceholder: "Напр.: Аренда, Продукты...",
    selectCategory: "Выберите категорию",
    selectExpenseType: "Выберите вид расхода",
    addCategory: "Добавить категорию",
    addCategoryPrompt: "Название новой категории",
    addExpenseType: "Добавить вид расхода",
    addExpenseTypeModalTitle: "Новый вид расхода",
    addExpenseTypePlaceholder: "Напр.: Аренда, Продукты",
    expenseDescription: "Примечание (необязательно)",
    expenseDescriptionPlaceholder: "Краткое примечание",
    expenseNotePlaceholder: "Дополнительная информация...",
    expenseDate: "Дата",
    totalExpenses: "Всего расходов",
    expensesEmpty: "Нет расходов",
    deleteExpense: "Удалить",
    reportCardSales: "История продаж",
    reportCardExpenses: "История расходов",
    reportCardDebtHistory: "История долгов/платежей клиентов",
    reportCardSupplierHistory: "История товаров/платежей поставщика",
    reportCardActivity: "Все изменения",
    reportSalesHistoryTitle: "История добавленных продаж",
    reportExpensesHistoryTitle: "История расходов",
    reportDebtHistoryTitle: "История долгов и платежей клиентов",
    reportSupplierHistoryTitle: "История товаров и платежей поставщика",
    reportActivityTitle: "Все выполненные изменения",
    editSale: "Редактировать продажу",
    editExpense: "Редактировать расход",
    salesHistoryEmpty: "Нет продаж",
    expensesHistoryEmpty: "Нет расходов",
    debtHistoryEmpty: "Нет истории долгов",
    supplierHistoryEmpty: "Нет истории поставщика",
    activityEmpty: "Нет изменений",
    reportSectionAnalytical: "АНАЛИТИЧЕСКИЕ ОТЧЁТЫ",
    reportDescSales: "Анализ всех продаж",
    reportDescExpenses: "Операционные и личные расходы",
    reportDescDebt: "Динамика дебиторской задолженности",
    reportDescSupplier: "Учёт товарооборота и платежей",
    reportDescActivity: "Все логи и аудит в системе",
    reportPremiumTitle: "Премиум отчёты",
    reportPremiumDesc: "Глубокий анализ с графиками и диаграммами.",
    reportPremiumActivate: "АКТИВИРОВАТЬ",
    search: "Поиск",
    notifications: "Уведомления",
    notificationsEmpty: "У вас нет уведомлений",
    salesReportTitle: "Отчёт по продажам",
    expenseReportTitle: "Отчёт по расходам",
    reportByPaymentTypes: "По типам оплаты",
    reportPeriod: "Период",
    reportChangePeriod: "ИЗМЕНИТЬ",
    reportPeriodFrom: "С",
    reportPeriodTo: "По",
    operationTypeLabel: "Тип операции",
    operationTypeRepaid: "Вернул долг",
    operationTypeGiven: "Дал в долг",
    applyFilter: "Применить",
    clearFilter: "Сбросить",
    reportJamiTushum: "Общий доход",
    reportComparedToLastMonth: "к прошлому месяцу",
    reportCashIncome: "Наличные",
    reportCardIncome: "Карта",
    reportBankIncome: "Банк",
    yesterday: "Вчера",
  },
};

export default translations;
