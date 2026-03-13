// Order Status Enum
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

// Delivery Type Enum
export enum DeliveryType {
  HOME_DELIVERY = 'home_delivery',
  PICKUP = 'pickup',
}

// Escrow Status
export type EscrowStatus = 'locked' | 'released' | 'refunded';

// Order Item Interface
export interface OrderItem {
  product: {
    _id: string;
    name: string;
    images?: string[];
  };
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: {
    name: string;
    option: string;
  };
  subtotal: number;
}

// Delivery Address Interface
export interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  additionalInfo?: string;
  coordinates?: [number, number];
}

// Status History Interface
export interface StatusHistory {
  status: OrderStatus;
  note?: string;
  updatedBy: string | { _id: string; firstName: string; lastName: string };
  updatedAt: string;
}

// Order Interface
export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    vendorProfile?: {
      businessName?: string;
      rating?: number;
    };
  };
  sellerType: 'vendor' | 'admin';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: string;
  paymentReference: string;
  isPaid: boolean;
  paidAt?: string;
  payment?: string;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  trackingNumber?: string;
  courierService?: string;
  customerConfirmedDelivery: boolean;
  sellerConfirmedDelivery: boolean;
  customerConfirmedAt?: string;
  sellerConfirmedAt?: string;
  escrowStatus?: EscrowStatus;
  escrowedAmount?: number;
  escrowedAt?: string;
  escrowReleaseDate?: string;
  hasDispute: boolean;
  dispute?: string;
  disputeReason?: string;
  disputeOpenedAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Order Stats Interface
export interface OrderStats {
  pending: number;
  confirmed?: number;
  processing: number;
  shipped: number;
  delivered?: number;
  completed: number;
  cancelled: number;
  total: number;
}

// Order Filters
export interface OrderFilters {
  status?: OrderStatus;
  seller?: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
}

// Create Order Request
export interface CreateOrderRequest {
  items: Array<{
    product: string;
    quantity: number;
    selectedVariant?: { name: string; option: string };
  }>;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: string;
  customerNotes?: string;
}

// Update Order Status Request
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

// Add Tracking Request
export interface AddTrackingRequest {
  trackingNumber: string;
  courierService: string;
}

// Cancel Order Request
export interface CancelOrderRequest {
  reason: string;
}

// Confirm Delivery Request
export interface ConfirmDeliveryRequest {
  role: 'customer' | 'seller';
}