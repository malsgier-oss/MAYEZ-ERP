/**
 * Simple i18n: locale from mayez-settings (language: 'en' | 'ar'), t(key) for labels.
 * After changing language in Settings, dispatch 'mayez-settings-saved' so Layout updates.
 */

const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.pos': 'POS',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.customers': 'Customers',
    'nav.invoices': 'Invoices',
    'nav.inventory': 'Inventory',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'settings.title': 'Settings',
    'settings.saved': 'Settings saved.',
    'settings.business_name': 'Business name',
    'settings.address': 'Address',
    'settings.phone': 'Phone',
    'settings.invoice_prefix': 'Invoice prefix',
    'settings.currency_symbol': 'Currency symbol',
    'settings.receipt_footer': 'Receipt footer text',
    'settings.language': 'Language',
    'settings.save': 'Save settings',
    'settings.saving': 'Saving...',
    'settings.stored_in_browser': 'Settings are stored in your browser. Backup/restore and user management will be available in Phase 2.',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.back': 'Back',
    'common.print': 'Print',
    'common.view': 'View',
    'lang.en': 'English',
    'lang.ar': 'العربية',
    'export.title': 'Export / Backup',
    'export.products': 'Export products (CSV)',
    'export.customers': 'Export customers (CSV)',
    'export.invoices': 'Export invoices (CSV)',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.pos': 'نقطة البيع',
    'nav.products': 'المنتجات',
    'nav.categories': 'التصنيفات',
    'nav.customers': 'العملاء',
    'nav.invoices': 'الفواتير',
    'nav.inventory': 'المخزون',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    'settings.title': 'الإعدادات',
    'settings.saved': 'تم حفظ الإعدادات.',
    'settings.business_name': 'اسم النشاط',
    'settings.address': 'العنوان',
    'settings.phone': 'الهاتف',
    'settings.invoice_prefix': 'بادئة الفاتورة',
    'settings.currency_symbol': 'رمز العملة',
    'settings.receipt_footer': 'نص تذييل الإيصال',
    'settings.language': 'اللغة',
    'settings.save': 'حفظ الإعدادات',
    'settings.saving': 'جاري الحفظ...',
    'settings.stored_in_browser': 'الإعدادات محفوظة في المتصفح. النسخ الاحتياطي وإدارة المستخدمين ستكون متاحة في المرحلة الثانية.',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.back': 'رجوع',
    'common.print': 'طباعة',
    'common.view': 'عرض',
    'lang.en': 'English',
    'lang.ar': 'العربية',
    'export.title': 'تصدير / نسخ احتياطي',
    'export.products': 'تصدير المنتجات (CSV)',
    'export.customers': 'تصدير العملاء (CSV)',
    'export.invoices': 'تصدير الفواتير (CSV)',
  },
}

export function getStoredLocale() {
  try {
    const stored = localStorage.getItem('mayez-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.language === 'ar' || parsed.language === 'en') return parsed.language
    }
  } catch {}
  return 'en'
}

export function t(key) {
  const locale = getStoredLocale()
  const map = translations[locale] || translations.en
  return map[key] ?? translations.en[key] ?? key
}

export function getDir() {
  return getStoredLocale() === 'ar' ? 'rtl' : 'ltr'
}

export function getLang() {
  return getStoredLocale() === 'ar' ? 'ar' : 'en'
}
