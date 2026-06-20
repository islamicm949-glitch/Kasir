import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "@kasir:cart";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function getCart(): Promise<CartItem[]> {
  try {
    const data = await AsyncStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
}

export async function saveCart(cart: CartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

export async function clearCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
}
