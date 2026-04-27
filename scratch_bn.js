const fs = require('fs');
const path = require('path');

const enFile = 'k:/personal_ac/web/src/i18n/translations/en.json';
const bnFile = 'k:/personal_ac/web/src/i18n/translations/bn.json';

const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const bn = JSON.parse(fs.readFileSync(bnFile, 'utf8'));

// Bangla translations to add/update
const newBn = {
  "inventory.variants_list_title": "ভেরিয়েন্ট তালিকা",
  "inventory.variants_subtitle": "আপনার পণ্য ভেরিয়েন্ট পরিচালনা এবং সংগঠিত করুন।",
  "inventory.find_variant": "ভেরিয়েন্ট খুঁজুন...",
  "inventory.new_variant": "নতুন ভেরিয়েন্ট",
  "inventory.table_variant_name": "ভেরিয়েন্টের নাম",
  "inventory.no_variants_found": "কোনো ভেরিয়েন্ট পাওয়া যায়নি।",
  "inventory.showing_variants": "দেখানো হচ্ছে {{start}} - {{end}} এর {{total}} ভেরিয়েন্ট",
  "inventory.edit_variant": "ভেরিয়েন্ট সম্পাদনা",
  "inventory.create_variant": "নতুন ভেরিয়েন্ট",
  "inventory.variant_name_label": "ভেরিয়েন্টের নাম",
  "inventory.variant_name_placeholder": "যেমন: XL - Red",
  "inventory.delete_variant_confirm_title": "ভেরিয়েন্ট মুছে ফেলবেন?",
  "inventory.delete_variant_confirm_desc": "স্থায়ীভাবে মুছে ফেলুন {{name}}.",
  
  "inventory.warehouses_title": "গুদাম তালিকা",
  "inventory.warehouses_subtitle": "আপনার স্টোরেজ অবস্থান এবং ইনভেন্টরি বিতরণ পরিচালনা করুন।",
  "inventory.find_warehouse": "গুদাম খুঁজুন...",
  "inventory.new_warehouse": "নতুন গুদাম",
  "inventory.table_warehouse_name": "গুদামের নাম",
  "inventory.table_mobile": "মোবাইল",
  "inventory.table_email": "ইমেল",
  "inventory.table_details": "বিস্তারিত",
  "inventory.total_items": "মোট পণ্য",
  "inventory.available_quantity": "বর্তমান পরিমাণ",
  "inventory.worth": "মূল্য",
  "inventory.no_warehouses_found": "কোনো গুদাম পাওয়া যায়নি।",
  "inventory.edit_warehouse": "গুদাম সম্পাদনা",
  "inventory.create_warehouse": "গুদাম তৈরি করুন",
  "inventory.warehouse_name_label": "গুদামের নাম",
  "inventory.warehouse_name_placeholder": "যেমন: প্রধান স্টোরেজ",
  "inventory.delete_warehouse_confirm_title": "গুদাম মুছে ফেলবেন?",
  "inventory.delete_warehouse_confirm_desc": "স্থায়ীভাবে মুছে ফেলুন {{name}}.",
  
  "sales.title": "বিক্রয় ও ইনভয়েসিং",
  "sales.subtitle": "আপনার রাজস্ব এবং গ্রাহক লেনদেন পরিচালনা করুন।",
  "sales.export": "এক্সপোর্ট",
  "sales.new_invoice": "নতুন ইনভয়েস",
  "sales.gross_revenue": "মোট রাজস্ব",
  "sales.total_collected": "মোট সংগৃহীত",
  "sales.outstanding": "বকেয়া",
  "sales.total_invoices": "মোট ইনভয়েস",
  "sales.search_placeholder": "ইনভয়েস, গ্রাহক, রেফারেন্স খুঁজুন...",
  "sales.more_filters": "আরও ফিল্টার",
  "sales.table_invoice": "ইনভয়েস",
  "sales.table_customer": "গ্রাহক",
  "sales.table_date": "তারিখ",
  "sales.table_payment": "পেমেন্ট",
  "sales.table_grand_total": "সর্বমোট",
  "sales.table_actions": "অ্যাকশন",
  "sales.ref": "রেফারেন্স",
  "sales.balance": "ব্যালেন্স",
  "sales.edit_invoice": "ইনভয়েস সম্পাদনা",
  "sales.mark_as_paid": "পরিশোধিত হিসাবে চিহ্নিত করুন",
  "sales.send_via_email": "ইমেলের মাধ্যমে পাঠান",
  "sales.delete_forever": "চিরতরে মুছে ফেলুন",
  "sales.delete_confirm_title": "ইনভয়েস মুছে ফেলবেন?",
  "sales.delete_confirm_desc": "এটি ইনভয়েস {{code}} মুছে ফেলবে এবং স্টক পূর্বাবস্থায় ফিরিয়ে আনবে।",
  "sales.no_sales_found": "কোনো বিক্রয় পাওয়া যায়নি",
  "sales.add_first_invoice": "আপনার প্রথম ইনভয়েস যোগ করুন।",
  "sales.start_invoicing": "ইনভয়েসিং শুরু করুন",
  
  "bank.bank_accounts": "ব্যাংক অ্যাকাউন্টস",
  "bank.add_account": "অ্যাকাউন্ট যোগ করুন",
  "bank.account_name": "অ্যাকাউন্টের নাম",
  "bank.account_number": "অ্যাকাউন্ট নম্বর",
  "bank.bank_name": "ব্যাংকের নাম",
  "bank.current_balance": "বর্তমান ব্যালেন্স",
  "bank.opening_balance": "প্রারম্ভিক ব্যালেন্স",
  "bank.transactions": "লেনদেনসমূহ",
  "bank.deposit": "জমা",
  "bank.withdrawal": "উত্তোলন",
  "bank.transfer": "স্থানান্তর",
  
  "contacts.customers_title": "গ্রাহকগণ",
  "contacts.customers_subtitle": "আপনার গ্রাহক ডাটাবেস পরিচালনা করুন।",
  "contacts.search_customers": "নাম, ইমেল বা ফোন দিয়ে গ্রাহক খুঁজুন...",
  "contacts.table_customer_name": "গ্রাহকের নাম",
  "contacts.delete_customer_title": "গ্রাহক মুছে ফেলবেন?",
  "contacts.delete_customer_desc": "এটি {{name}} এবং সমস্ত লেনদেনের ইতিহাস মুছে ফেলবে।",
  "contacts.no_customers_found": "কোনো গ্রাহক পাওয়া যায়নি",
  "contacts.no_customers_desc": "আপনার অনুসন্ধানের সাথে কোনো গ্রাহক মেলেনি।",
  "contacts.no_customers_empty": "আপনার গ্রাহক তালিকা খালি।",
  "contacts.customer_form_desc": "গ্রাহকের তথ্য এবং বিলিং বিবরণ লিখুন।",
  
  "contacts.suppliers_title": "সরবরাহকারীগণ",
  "contacts.suppliers_subtitle": "আপনার সরবরাহকারী এবং চেইন অংশীদার পরিচালনা করুন।",
  "contacts.search_suppliers": "নাম, ইমেল বা ফোন দিয়ে সরবরাহকারী খুঁজুন...",
  "contacts.table_supplier_name": "সরবরাহকারীর নাম",
  "contacts.delete_supplier_title": "সরবরাহকারী মুছে ফেলবেন?",
  "contacts.delete_supplier_desc": "এটি {{name}} এবং সমস্ত ক্রয়ের ইতিহাস মুছে ফেলবে।",
  "contacts.no_suppliers_found": "কোনো সরবরাহকারী পাওয়া যায়নি",
  "contacts.no_suppliers_desc": "আপনার অনুসন্ধানের সাথে কোনো সরবরাহকারী মেলেনি।",
  "contacts.no_suppliers_empty": "আপনার সরবরাহকারী তালিকা খালি।",
  "contacts.supplier_form_desc_edit": "বিদ্যমান সরবরাহকারীর তথ্য আপডেট করুন",
  "contacts.supplier_form_desc_new": "একটি নতুন সরবরাহকারী প্রোফাইল তৈরি করুন",

  "imports.import_customers": "গ্রাহক ইম্পোর্ট",
  "imports.import_suppliers": "সরবরাহকারী ইম্পোর্ট"
};

// Merge translations
Object.keys(en).forEach(k => {
  if (newBn[k]) {
    bn[k] = newBn[k];
  } else if (!bn[k]) {
    // If not in bn.json and not translated, fallback to English text in bn.json
    bn[k] = en[k];
  }
});

fs.writeFileSync(bnFile, JSON.stringify(bn, null, 2), 'utf8');
console.log('BN Updated successfully');
