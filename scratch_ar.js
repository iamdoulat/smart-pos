const fs = require('fs');

const enFile = 'k:/personal_ac/web/src/i18n/translations/en.json';
const arFile = 'k:/personal_ac/web/src/i18n/translations/ar.json';

const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arFile, 'utf8'));

Object.keys(en).forEach(k => {
  if (!ar[k]) {
    ar[k] = en[k];
  }
});

fs.writeFileSync(arFile, JSON.stringify(ar, null, 2), 'utf8');
console.log('AR Updated successfully');
