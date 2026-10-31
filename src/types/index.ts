export interface ProductVariant {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  sku: string;
  price: number;
  originalPrice: number;
  image: string;
  inStock: boolean;
  stockCount: number;
  lowStockThreshold?: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductData {
  id: string;
  title: string;
  subtitle: string;
  discountBanner: string;
  lowStockThreshold?: number;
  specs: ProductSpec[];
  bulletPoints: string[];
  trustBadges: { icon: string; label: string }[];
  variants: ProductVariant[];
  galleryImages: {
    id: string;
    url: string;
    caption: string;
  }[];
}

export interface SelectedItem {
  variantId: string;
  quantity: number;
}

export type District =
  | 'Dhaka'
  | 'Gazipur'
  | 'Narayanganj'
  | 'Chattogram'
  | 'Cox\'s Bazar'
  | 'Sylhet'
  | 'Rajshahi'
  | 'Khulna'
  | 'Barishal'
  | 'Rangpur'
  | 'Mymensingh'
  | 'Cumilla'
  | 'Bogura'
  | 'Faridpur'
  | 'Tangail'
  | 'Jessore'
  | 'Kushtia'
  | 'Pabna'
  | 'Dinajpur'
  | 'Noakhali'
  | 'Feni'
  | 'Brahmanbaria'
  | 'Narsingdi'
  | 'Manikganj'
  | 'Munshiganj';

export interface CustomerFormData {
  name: string;
  phone: string;
  district: District;
  address: string;
}

export interface ShippingOption {
  id: 'inside_dhaka' | 'outside_dhaka';
  label: string;
  fee: number;
  estimatedDays: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerFormData;
  items: {
    variantId: string;
    name: string;
    colorName: string;
    price: number;
    quantity: number;
    total: number;
    image: string;
  }[];
  subtotal: number;
  bulkDiscount?: number;
  shippingFee: number;
  shippingOption: 'inside_dhaka' | 'outside_dhaka';
  total: number;
  paymentMethod: 'cash_on_delivery' | 'bkash' | 'nagad';
  paymentStatus: 'pending' | 'paid';
  status: OrderStatus;
  source: 'web_checkout' | 'android_pos';
  syncedToApi: boolean;
  syncedAt?: string;
  syncError?: string;
  notes?: string;
}

export interface LaravelApiConfig {
  baseUrl: string;
  bearerToken: string;
  isLiveConnection: boolean;
  lastSyncTimestamp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
