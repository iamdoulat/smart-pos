const fs = require('fs');

const enFile = 'k:/personal_ac/web/src/i18n/translations/en.json';
const bnFile = 'k:/personal_ac/web/src/i18n/translations/bn.json';

const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const bn = JSON.parse(fs.readFileSync(bnFile, 'utf8'));

Object.keys(en).forEach(k => {
  if (!bn[k]) {
    bn[k] = en[k]; // fallback to English if missing Bangla translation
  }
});

fs.writeFileSync(bnFile, JSON.stringify(bn, null, 2), 'utf8');
console.log('BN Updated with missing keys');
