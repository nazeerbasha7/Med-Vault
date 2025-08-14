// Environment test - check what Vite is loading
console.log('=== ENVIRONMENT CHECK ===');
console.log('VITE_DEV_MODE:', import.meta.env.VITE_DEV_MODE);
console.log('VITE_MODULE_ADDR:', import.meta.env.VITE_MODULE_ADDR);
console.log('VITE_NETWORK:', import.meta.env.VITE_NETWORK);
console.log('DEV_MODE evaluation:', import.meta.env.VITE_DEV_MODE === 'true');
console.log('Production mode:', import.meta.env.VITE_DEV_MODE === 'false');
console.log('========================');
