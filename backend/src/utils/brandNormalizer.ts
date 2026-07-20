export function normalizeBrand(rawBrand: string): string {
  if (!rawBrand) return 'Generic';
  const b = rawBrand.toLowerCase().trim();
  
  if (b.includes('hp') || b.includes('hewlett')) return 'HP';
  if (b.includes('dell')) return 'Dell';
  if (b.includes('lenovo') || b.includes('thinkpad') || b.includes('ideapad')) return 'Lenovo';
  if (b.includes('apple') || b.includes('macbook') || b.includes('mac')) return 'Apple';
  if (b.includes('asus')) return 'ASUS';
  if (b.includes('acer')) return 'Acer';
  if (b.includes('samsung')) return 'Samsung';
  if (b.includes('msi')) return 'MSI';
  if (b.includes('microsoft') || b.includes('surface')) return 'Microsoft';
  if (b.includes('razer')) return 'Razer';
  if (b.includes('alienware')) return 'Alienware';
  if (b.includes('lg')) return 'LG';
  if (b.includes('toshiba')) return 'Toshiba';
  if (b.includes('huawei')) return 'Huawei';
  if (b.includes('chuwi')) return 'Chuwi';
  
  // Title case fallback
  return rawBrand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
