const fs = require('fs');

const enFile = 'k:/personal_ac/web/src/i18n/translations/en.json';
const bnFile = 'k:/personal_ac/web/src/i18n/translations/bn.json';
const arFile = 'k:/personal_ac/web/src/i18n/translations/ar.json';

const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const bn = JSON.parse(fs.readFileSync(bnFile, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arFile, 'utf8'));

const enUpdates = {
  "contacts.import_customers": "Import Customers",
  "contacts.import_suppliers": "Import Suppliers",
  "contacts.import_subtitle": "Bulk upload your directory using a CSV file.",
  "contacts.instructions": "Instructions",
  "contacts.instruction_1": "1. Download the CSV template to ensure correct format.",
  "contacts.instruction_2": "2. Fill in the columns: name (Required), email, phone, etc.",
  "contacts.instruction_3": "3. Upload the file and confirm the import.",
  "contacts.template_csv": "Template.csv",
  "contacts.choose_csv": "Choose CSV File",
  "contacts.ready_to_import": "Ready to import",
  "contacts.drag_and_drop": "Drag and drop your file here or click to browse files from your computer.",
  "contacts.max_size": "Max size 5MB • CSV Only",
  "contacts.start_import": "Start Import",
  "contacts.select_file_first": "Please select a file first",
  "contacts.customers_imported": "Customers imported successfully!",
  "contacts.suppliers_imported": "Suppliers imported successfully!",
  "contacts.import_failed": "Failed to import contacts. Please check file format."
};

const bnUpdates = {
  "contacts.import_customers": "গ্রাহক ইম্পোর্ট করুন",
  "contacts.import_suppliers": "সরবরাহকারী ইম্পোর্ট করুন",
  "contacts.import_subtitle": "একটি CSV ফাইল ব্যবহার করে আপনার ডিরেক্টরি বাল্ক আপলোড করুন।",
  "contacts.instructions": "নির্দেশাবলী",
  "contacts.instruction_1": "১. সঠিক বিন্যাস নিশ্চিত করতে CSV টেমপ্লেট ডাউনলোড করুন।",
  "contacts.instruction_2": "২. কলামগুলো পূরণ করুন: নাম (আবশ্যক), ইমেইল, ফোন, ইত্যাদি।",
  "contacts.instruction_3": "৩. ফাইল আপলোড করুন এবং ইম্পোর্ট নিশ্চিত করুন।",
  "contacts.template_csv": "টেমপ্লেট.csv",
  "contacts.choose_csv": "CSV ফাইল নির্বাচন করুন",
  "contacts.ready_to_import": "ইম্পোর্টের জন্য প্রস্তুত",
  "contacts.drag_and_drop": "আপনার ফাইলটি এখানে টেনে আনুন বা আপনার কম্পিউটার থেকে ফাইল ব্রাউজ করতে ক্লিক করুন।",
  "contacts.max_size": "সর্বোচ্চ সাইজ ৫MB • শুধুমাত্র CSV",
  "contacts.start_import": "ইম্পোর্ট শুরু করুন",
  "contacts.select_file_first": "অনুগ্রহ করে প্রথমে একটি ফাইল নির্বাচন করুন",
  "contacts.customers_imported": "গ্রাহকরা সফলভাবে ইম্পোর্ট হয়েছে!",
  "contacts.suppliers_imported": "সরবরাহকারীরা সফলভাবে ইম্পোর্ট হয়েছে!",
  "contacts.import_failed": "যোগাযোগ ইম্পোর্ট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ফাইল বিন্যাস চেক করুন।"
};

const arUpdates = {
  "contacts.import_customers": "استيراد العملاء",
  "contacts.import_suppliers": "استيراد الموردين",
  "contacts.import_subtitle": "تحميل مجمع للدليل الخاص بك باستخدام ملف CSV.",
  "contacts.instructions": "التعليمات",
  "contacts.instruction_1": "1. قم بتنزيل قالب CSV للتأكد من التنسيق الصحيح.",
  "contacts.instruction_2": "2. املأ الأعمدة: الاسم (مطلوب) ، البريد الإلكتروني ، الهاتف ، إلخ.",
  "contacts.instruction_3": "3. قم بتحميل الملف وتأكيد الاستيراد.",
  "contacts.template_csv": "Template.csv",
  "contacts.choose_csv": "اختر ملف CSV",
  "contacts.ready_to_import": "جاهز للاستيراد",
  "contacts.drag_and_drop": "اسحب الملف وأفلته هنا أو انقر لتصفح الملفات من جهاز الكمبيوتر الخاص بك.",
  "contacts.max_size": "أقصى حجم 5 ميجا بايت • CSV فقط",
  "contacts.start_import": "بدء الاستيراد",
  "contacts.select_file_first": "الرجاء تحديد ملف أولاً",
  "contacts.customers_imported": "تم استيراد العملاء بنجاح!",
  "contacts.suppliers_imported": "تم استيراد الموردين بنجاح!",
  "contacts.import_failed": "فشل استيراد جهات الاتصال. يرجى التحقق من تنسيق الملف."
};

Object.assign(en, enUpdates);
Object.assign(bn, bnUpdates);
Object.assign(ar, arUpdates);

fs.writeFileSync(enFile, JSON.stringify(en, null, 2));
fs.writeFileSync(bnFile, JSON.stringify(bn, null, 2));
fs.writeFileSync(arFile, JSON.stringify(ar, null, 2));
