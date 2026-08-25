export interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
  image?: string
}

export const products: Product[] = [
  { id: 1, name: 'Redis Kitabi', price: 149.99, category: 'Kitap', stock: 150 },
  { id: 2, name: 'MacBook Pro M4', price: 74999.99, category: 'Elektronik', stock: 5 },
  { id: 3, name: 'Bluetooth Kulaklik', price: 2499.99, category: 'Elektronik', stock: 42 },
  { id: 4, name: 'Docker T-Shirt', price: 249.99, category: 'Giyim', stock: 200 },
  { id: 5, name: 'K8s Sticker Pack', price: 49.99, category: 'Aksesuar', stock: 500 },
]

export const flashSaleProduct: Product = {
  id: 42,
  name: 'RTX 5090 (Flash Sale)',
  price: 39999,
  category: 'Elektronik',
  stock: 3,
}

export const ttlScenarios = [
  { label: 'Döviz Kuru', ttl: 10, desc: 'Anlık değişebilir, cok kisa TTL', icon: '$', color: 'amber' },
  { label: 'Ürün Fiyatı', ttl: 60, desc: 'Makul gecikme kabul edilebilir', icon: 'T', color: 'cyan' },
  { label: 'Kategori Listesi', ttl: 300, desc: 'Nadiren degisir, uzun TTL', icon: 'L', color: 'green' },
]

export const e2eSteps = [
  { label: 'Ürün Arama', desc: 'Cache-Aside ile hizli arama', redis: 'Cache-Aside', icon: 'search' },
  { label: 'Ürün Detay', desc: 'Read-Through + TTL ile okuma', redis: 'Read-Through', icon: 'eye' },
  { label: 'Sepete Ekle', desc: 'Session cache ile sepet yönetimi', redis: 'Session Cache', icon: 'cart' },
  { label: 'Stok Kontrol', desc: 'Distributed Lock ile envanter', redis: 'SET NX PX', icon: 'lock' },
  { label: 'Ödeme', desc: 'Redlock ile güvenli ödeme', redis: 'Redlock', icon: 'credit-card' },
  { label: 'Sipariş Onay', desc: 'Write-Through + metrik kaydı', redis: 'Write-Through', icon: 'check' },
]
