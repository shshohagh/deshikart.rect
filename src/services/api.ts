import axios, { AxiosInstance, AxiosError } from 'axios';
import { CustomerFormData, LaravelApiConfig, OrderRecord, OrderStatus, ProductVariant } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'dk_laravel_api_config',
  ORDERS: 'dk_orders_store',
  OFFLINE_QUEUE: 'dk_offline_queue',
};

const DEFAULT_CONFIG: LaravelApiConfig = {
  baseUrl: 'https://api.deshikart.store/api/v1',
  bearerToken: 'dk_pat_live_948a27c19f2048b',
  isLiveConnection: false, // Default to simulated robust offline-first mode
  lastSyncTimestamp: undefined,
};

// Initial realistic demo order data for POS management & storefront proof
const INITIAL_DEMO_ORDERS: OrderRecord[] = [
  {
    id: 'ord-1001',
    orderNumber: 'DK-2026-8941',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    customer: {
      name: 'Tanvir Hossain',
      phone: '01712345678',
      district: 'Dhaka',
      address: 'House 42, Road 11, Sector 4, Uttara, Dhaka',
    },
    items: [
      {
        variantId: 'black',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - Black',
        colorName: 'Black',
        price: 1290,
        quantity: 1,
        total: 1290,
        image: '/assets/images/variant_black.jpg',
      },
    ],
    subtotal: 1290,
    shippingFee: 70,
    shippingOption: 'inside_dhaka',
    total: 1360,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    status: 'confirmed',
    source: 'web_checkout',
    syncedToApi: true,
    syncedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'DK-2026-8942',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    customer: {
      name: 'Sabina Yasmin',
      phone: '01898765432',
      district: 'Chattogram',
      address: 'Flat 4B, Green View Tower, Nasirabad, Chattogram',
    },
    items: [
      {
        variantId: 'green',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - Green',
        colorName: 'Green',
        price: 1290,
        quantity: 1,
        total: 1290,
        image: '/assets/images/variant_green.jpg',
      },
      {
        variantId: 'white',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - White',
        colorName: 'White',
        price: 1290,
        quantity: 1,
        total: 1290,
        image: '/assets/images/variant_white.jpg',
      },
    ],
    subtotal: 2580,
    shippingFee: 130,
    shippingOption: 'outside_dhaka',
    total: 2710,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    status: 'processing',
    source: 'web_checkout',
    syncedToApi: true,
    syncedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'ord-1003',
    orderNumber: 'DK-2026-8943',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(), // ~1.5 hrs ago
    customer: {
      name: 'Dr. Rafiqul Islam',
      phone: '01755123456',
      district: 'Sylhet',
      address: 'House 14, Housing Estate, Amberkhana, Sylhet',
    },
    items: [
      {
        variantId: 'black',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - Black',
        colorName: 'Black',
        price: 1290,
        quantity: 2,
        total: 2580,
        image: '/assets/images/variant_black.jpg',
      },
      {
        variantId: 'green',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - Green',
        colorName: 'Green',
        price: 1290,
        quantity: 2,
        total: 2580,
        image: '/assets/images/variant_green.jpg',
      },
    ],
    subtotal: 5160,
    bulkDiscount: 516, // 10% bulk discount applied for 4 items!
    shippingFee: 130,
    shippingOption: 'outside_dhaka',
    total: 4774,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    status: 'pending',
    source: 'web_checkout',
    syncedToApi: true,
    syncedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'ord-1004',
    orderNumber: 'DK-2026-8944',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
    customer: {
      name: 'Farzana Chowdhury',
      phone: '01912987654',
      district: 'Dhaka',
      address: 'Road 7/A, Dhanmondi R/A, Dhaka',
    },
    items: [
      {
        variantId: 'white',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - White',
        colorName: 'White',
        price: 1290,
        quantity: 1,
        total: 1290,
        image: '/assets/images/variant_white.jpg',
      },
    ],
    subtotal: 1290,
    shippingFee: 70,
    shippingOption: 'inside_dhaka',
    total: 1360,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    status: 'shipped',
    source: 'web_checkout',
    syncedToApi: true,
  },
  {
    id: 'ord-1005',
    orderNumber: 'DK-2026-8945',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hrs ago
    customer: {
      name: 'Mahmudul Hasan',
      phone: '01678123987',
      district: 'Rajshahi',
      address: 'Near Shaheb Bazar Zero Point, Rajshahi',
    },
    items: [
      {
        variantId: 'black',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - Black',
        colorName: 'Black',
        price: 1290,
        quantity: 1,
        total: 1290,
        image: '/assets/images/variant_black.jpg',
      },
    ],
    subtotal: 1290,
    shippingFee: 130,
    shippingOption: 'outside_dhaka',
    total: 1420,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid',
    status: 'delivered',
    source: 'web_checkout',
    syncedToApi: true,
  },
  {
    id: 'ord-1006',
    orderNumber: 'DK-2026-8946',
    createdAt: new Date(Date.now() - 1000 * 60 * 520).toISOString(), // 8.6 hrs ago
    customer: {
      name: 'Nusrat Jahan',
      phone: '01711223344',
      district: 'Gazipur',
      address: 'Board Bazar, Gazipur',
    },
    items: [
      {
        variantId: 'green',
        name: '1.5L Borosilicate Glass Drinking Bottle with Straw & Removable Filter - Green',
        colorName: 'Green',
        price: 1290,
        quantity: 1,
        total: 1290,
        image: '/assets/images/variant_green.jpg',
      },
    ],
    subtotal: 1290,
    shippingFee: 70,
    shippingOption: 'inside_dhaka',
    total: 1360,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid',
    status: 'delivered',
    source: 'web_checkout',
    syncedToApi: true,
  },
];

class LaravelApiService {
  private client: AxiosInstance;
  private config: LaravelApiConfig;

  constructor() {
    this.config = this.loadConfig();
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private loadConfig(): LaravelApiConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not read API config from storage', e);
    }
    return DEFAULT_CONFIG;
  }

  public saveConfig(newConfig: Partial<LaravelApiConfig>): LaravelApiConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save config', e);
    }
    this.client.defaults.baseURL = this.config.baseUrl;
    this.setupInterceptors();
    return this.config;
  }

  public getConfig(): LaravelApiConfig {
    return { ...this.config };
  }

  private setupInterceptors() {
    this.client.interceptors.request.clear?.();
    this.client.interceptors.request.use(
      (reqConfig) => {
        if (this.config.bearerToken) {
          reqConfig.headers.Authorization = `Bearer ${this.config.bearerToken}`;
        }
        return reqConfig;
      },
      (error) => Promise.reject(error)
    );
  }

  public getOrders(): OrderRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    } catch (e) {
      console.error('Failed to retrieve orders', e);
      return INITIAL_DEMO_ORDERS;
    }
  }

  public saveOrders(orders: OrderRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }

  public getOfflineQueue(): OrderRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  public saveOfflineQueue(queue: OrderRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  /**
   * Validate Bangladeshi mobile number: exactly 11 digits starting with 013-019
   */
  public validateBangladeshiPhone(phone: string): { isValid: boolean; message?: string } {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) {
      return { isValid: false, message: 'মোবাইল নম্বর দেওয়া আবশ্যক' };
    }
    const bdRegex = /^01[3-9]\d{8}$/;
    if (!bdRegex.test(cleaned)) {
      return {
        isValid: false,
        message: 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)',
      };
    }
    return { isValid: true };
  }

  /**
   * Check order delivery status by customer phone number
   */
  public async getOrdersByPhone(phone: string): Promise<OrderRecord[]> {
    // Standardize phone number
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('880')) {
      cleaned = cleaned.slice(2);
    }
    const validation = this.validateBangladeshiPhone(cleaned);
    if (!validation.isValid) {
      throw new Error(validation.message || 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
    }

    // If live API mode is active, attempt remote lookup
    if (this.config.isLiveConnection && navigator.onLine) {
      try {
        const response = await this.client.get('/orders/track', {
          params: { phone: cleaned },
        });
        if (response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      } catch (err) {
        console.warn('Live API order lookup failed, querying local repository:', err);
      }
    }

    // Query local database
    const localOrders = this.getOrders();
    const matching = localOrders.filter((ord) => {
      let ordPhone = ord.customer.phone.replace(/\D/g, '');
      if (ordPhone.startsWith('880')) {
        ordPhone = ordPhone.slice(2);
      }
      return ordPhone === cleaned;
    });

    return matching.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get recent confirmed orders (3-5 orders) for storefront social proof
   */
  public getRecentConfirmedOrders(limit = 5): OrderRecord[] {
    const orders = this.getOrders();
    const confirmedOrders = orders.filter((o) =>
      ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status)
    );
    return confirmedOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, Math.min(5, Math.max(3, limit)));
  }

  /**
   * Submit an order either live to Laravel API or safely queue offline
   */
  public async submitOrder(orderPayload: {
    customer: CustomerFormData;
    items: {
      variant: ProductVariant;
      quantity: number;
    }[];
    shippingOption: 'inside_dhaka' | 'outside_dhaka';
    shippingFee: number;
    bulkDiscount?: number;
    paymentMethod: 'cash_on_delivery' | 'bkash' | 'nagad';
    source: 'web_checkout' | 'android_pos';
  }): Promise<{ success: boolean; order: OrderRecord; message: string }> {
    // 1. Strict validation
    if (!orderPayload.customer.name.trim()) {
      throw new Error('আপনার নাম লিখুন');
    }
    const phoneVal = this.validateBangladeshiPhone(orderPayload.customer.phone);
    if (!phoneVal.isValid) {
      throw new Error(phoneVal.message || 'ভুল মোবাইল নম্বর');
    }
    if (!orderPayload.customer.address.trim()) {
      throw new Error('আপনার সম্পূর্ণ ঠিকানা লিখুন');
    }
    if (orderPayload.items.length === 0) {
      throw new Error('কমপক্ষে একটি প্রোডাক্ট নির্বাচন করুন');
    }

    const subtotal = orderPayload.items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );
    const bulkDiscount = orderPayload.bulkDiscount || 0;
    const total = Math.max(0, subtotal - bulkDiscount + orderPayload.shippingFee);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DK-${new Date().getFullYear()}-${randomDigits}`;

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: orderPayload.customer,
      items: orderPayload.items.map((i) => ({
        variantId: i.variant.id,
        name: i.variant.name,
        colorName: i.variant.colorName,
        price: i.variant.price,
        quantity: i.quantity,
        total: i.variant.price * i.quantity,
        image: i.variant.image,
      })),
      subtotal,
      bulkDiscount,
      shippingFee: orderPayload.shippingFee,
      shippingOption: orderPayload.shippingOption,
      total,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      source: orderPayload.source,
      syncedToApi: false,
    };

    // If live API mode is activated, attempt HTTP request
    if (this.config.isLiveConnection && navigator.onLine) {
      try {
        const response = await this.client.post('/orders', {
          order_number: newOrder.orderNumber,
          customer_name: newOrder.customer.name,
          customer_phone: newOrder.customer.phone,
          customer_district: newOrder.customer.district,
          customer_address: newOrder.customer.address,
          shipping_zone: newOrder.shippingOption,
          shipping_fee: newOrder.shippingFee,
          payment_method: newOrder.paymentMethod,
          subtotal: newOrder.subtotal,
          total: newOrder.total,
          items: newOrder.items.map((it) => ({
            sku: it.variantId,
            name: it.name,
            quantity: it.quantity,
            unit_price: it.price,
            line_total: it.total,
          })),
        });

        if (response.status === 200 || response.status === 201) {
          newOrder.syncedToApi = true;
          newOrder.syncedAt = new Date().toISOString();
        }
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
        console.warn('Live API call failed, queuing offline:', axErr.message);
        newOrder.syncError = axErr.response?.data?.message || axErr.message;
        // Queue for offline sync
        const queue = this.getOfflineQueue();
        queue.push(newOrder);
        this.saveOfflineQueue(queue);
      }
    } else {
      // In offline / simulation mode: mark synced or queue
      newOrder.syncedToApi = true;
      newOrder.syncedAt = new Date().toISOString();
    }

    // Save locally
    const currentOrders = this.getOrders();
    const updatedOrders = [newOrder, ...currentOrders];
    this.saveOrders(updatedOrders);

    return {
      success: true,
      order: newOrder,
      message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
    };
  }

  /**
   * Update Order Status (Pending, Confirmed, Shipped, Delivered, etc.)
   */
  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord> {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error('Order not found');
    }

    orders[index].status = status;

    if (this.config.isLiveConnection && navigator.onLine) {
      try {
        await this.client.patch(`/orders/${orders[index].orderNumber}/status`, {
          status,
        });
        orders[index].syncedToApi = true;
      } catch (e: unknown) {
        console.warn('Status sync to API failed, saved locally');
      }
    }

    this.saveOrders(orders);
    return orders[index];
  }

  /**
   * Sync pending offline orders with Laravel API
   */
  public async syncOfflineQueue(): Promise<{ syncedCount: number; remainingCount: number }> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, remainingCount: 0 };
    }

    const remaining: OrderRecord[] = [];
    let syncedCount = 0;

    for (const order of queue) {
      try {
        if (this.config.isLiveConnection) {
          await this.client.post('/orders', order);
        }
        syncedCount++;

        // Update in main list
        const allOrders = this.getOrders();
        const ord = allOrders.find((o) => o.id === order.id);
        if (ord) {
          ord.syncedToApi = true;
          ord.syncedAt = new Date().toISOString();
          ord.syncError = undefined;
        }
        this.saveOrders(allOrders);
      } catch (e: unknown) {
        const axErr = e as AxiosError;
        order.syncError = axErr.message;
        remaining.push(order);
      }
    }

    this.saveOfflineQueue(remaining);
    this.saveConfig({ lastSyncTimestamp: new Date().toISOString() });
    return { syncedCount, remainingCount: remaining.length };
  }

  /**
   * Test API connectivity
   */
  public async testConnection(): Promise<{ success: boolean; latency: number; message: string }> {
    const start = performance.now();
    try {
      if (!this.config.isLiveConnection) {
        // Simulated latency
        await new Promise((res) => setTimeout(res, 280));
        return {
          success: true,
          latency: 28,
          message: 'Local Offline Engine Active & Ready',
        };
      }
      await this.client.get('/health', { timeout: 4000 });
      const duration = Math.round(performance.now() - start);
      return {
        success: true,
        latency: duration,
        message: 'Connected to Laravel REST API successfully',
      };
    } catch (e: unknown) {
      const duration = Math.round(performance.now() - start);
      const err = e as AxiosError;
      return {
        success: false,
        latency: duration,
        message: err.message || 'Failed to reach API endpoint',
      };
    }
  }
}

export const apiService = new LaravelApiService();
