export type Category = "conjuntos" | "bodies" | "baberos" | "mantas";

export interface ProductSize {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

export interface ProductColor {
  id: string;
  name: string;
  hex_code: string | null;
  active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_id: string;
  color_id: string;
  sku_variant: string;
  stock: number;
  cost: number | null;
  price_override: number | null;
  active: boolean;
  // Loaded via PostgREST join (`size:product_sizes(...)`) — denormalized for display.
  size?: ProductSize;
  color?: ProductColor;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  price: number;
  cost: number;
  gender: string;
  material: string;
  has_offer: boolean;
  image_url: string;
  active: boolean;
  created_at: string;
  // Loaded via PostgREST join. Empty array if the product has no variants yet.
  variants?: ProductVariant[];
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  district: string;
  city: string;
  shipping_method: "domicilio" | "shalom";
  shalom_agency: string | null;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_method: "izipay" | "transferencia" | "contraentrega" | "yape" | "plin" | "culqi";
  payment_status: "pendiente" | "pagado" | "fallido";
  payment_proof_url: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_paid_at: string | null;
  order_status: "nuevo" | "procesando" | "enviado" | "entregado" | "cancelado";
  notes: string | null;
  delivery_date: string | null;
  delivery_time_slot: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_sku: string;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  supplier: string;
  notes: string | null;
  purchased_at: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  /** Variant snapshot. Variants always exist now — the public catalog cannot
   *  surface a product without at least one. The id is the canonical link to
   *  product_variants and is what /api/orders uses to decrement stock. */
  variant: {
    id: string;
    size_name: string;
    color_name: string;
    stock_at_pick: number;
  };
  quantity: number;
  /** Legacy mirrors retained because the cart-drawer + checkout UI still read
   *  these. Always equal to variant.size_name / variant.color_name. */
  selectedSize: string;
  selectedColor: string;
}

export interface WaitlistEntry {
  id: string;
  product_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  size: string | null;
  color: string | null;
  notified: boolean;
  created_at: string;
}
