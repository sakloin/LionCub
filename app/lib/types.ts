export type Category = "conjuntos" | "bodies" | "baberos" | "mantas";

export interface Product {
  id: string;
  sku: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  price: number;
  cost: number;
  stock: number;
  sizes: string[];
  colors: string[];
  gender: string;
  material: string;
  has_offer: boolean;
  image_url: string;
  active: boolean;
  created_at: string;
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
  payment_method: "izipay" | "transferencia" | "contraentrega" | "yape" | "plin";
  payment_status: "pendiente" | "pagado" | "fallido";
  payment_proof_url: string | null;
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
  quantity: number;
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
