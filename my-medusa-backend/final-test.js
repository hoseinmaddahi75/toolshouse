// این را مستقیم در ترمینال کپی نکن، یک فایل به نام 'final-test.js' بساز
const loaded = require('./.medusa/server/src/modules/payment-zarinpal/index.js');
const services = loaded.services ?? loaded;

console.log("Is iterable?:", typeof services[Symbol.iterator] === 'function');
console.log("First element identifier:", services[0]?.identifier);