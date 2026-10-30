import * as grpc from '@grpc/grpc-js';

export enum OrderLifecycleStatus {
  ORDER_LIFECYCLE_STATUS_UNSPECIFIED = 0,
  ORDER_LIFECYCLE_STATUS_PENDING = 1,
  ORDER_LIFECYCLE_STATUS_STOCK_RESERVED = 2,
  ORDER_LIFECYCLE_STATUS_PAID = 3,
  ORDER_LIFECYCLE_STATUS_PROCESSING = 4,
  ORDER_LIFECYCLE_STATUS_SHIPPED = 5,
  ORDER_LIFECYCLE_STATUS_DELIVERED = 6,
  ORDER_LIFECYCLE_STATUS_CANCELLED = 7,
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  pricePerUnit: number;
}

export interface CreateOrderRequest {
  customerId: string;
  idempotencyKey: string;
  items: OrderItemPayload[];
  deliveryAddress: string;
}

export interface OrderResponse {
  orderId: string;
  status: OrderLifecycleStatus;
  totalAmount: number;
  createdAt?: { seconds: number; nanos: number };
}

export interface GetOrderStatusRequest {
  orderId: string;
}

export interface OrderStatusResponse {
  orderId: string;
  status: OrderLifecycleStatus;
  trackingNumber: string;
  lastUpdated?: { seconds: number; nanos: number };
}

export interface StreamOrderStatusRequest {
  orderId: string;
}

export interface OrderStatusUpdateResponse {
  orderId: string;
  previousStatus: OrderLifecycleStatus;
  newStatus: OrderLifecycleStatus;
  statusMessage: string;
  eventTime?: { seconds: number; nanos: number };
}

export interface IOrderInternalServiceClient {
  createOrder(
    request: CreateOrderRequest,
    callback: (error: grpc.ServiceError | null, response: OrderResponse) => void
  ): grpc.ClientUnaryCall;

  getOrderStatus(
    request: GetOrderStatusRequest,
    callback: (error: grpc.ServiceError | null, response: OrderStatusResponse) => void
  ): grpc.ClientUnaryCall;

  streamOrderStatus(
    request: StreamOrderStatusRequest
  ): grpc.ClientReadableStream<OrderStatusUpdateResponse>;
}
