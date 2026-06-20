import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getCart, saveCart, clearCart } from "@/src/utils/storage";
import { formatRp } from "@/src/utils/format";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CashierScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products] = useState<{ id: string; name: string; price: number }[]>([
    { id: "1", name: "Kopi Hitam", price: 15000 },
    { id: "2", name: "Teh Manis", price: 10000 },
    { id: "3", name: "Roti Bakar", price: 25000 },
    { id: "4", name: "Gorengan", price: 8000 },
    { id: "5", name: "Nasi Kuning", price: 20000 },
  ]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = async () => {
    const savedCart = await getCart();
    if (savedCart.length > 0) {
      setCart(savedCart);
    }
  };

  const addToCart = (product: { id: string; name: string; price: number }) => {
    const qty = parseInt(quantities[product.id] || "1", 10);
    if (qty <= 0 || Number.isNaN(qty)) {
      Alert.alert("Kuantitas harus lebih dari 0");
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        updated = [
          ...prevCart,
          { ...product, quantity: qty },
        ];
      }
      saveCart(updated);
      return updated;
    });

    setQuantities((prev) => ({ ...prev, [product.id]: "" }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.id !== itemId);
      saveCart(updated);
      return updated;
    });
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) => {
      const updated = prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      );
      saveCart(updated);
      return updated;
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const openReceipt = () => {
    if (cart.length === 0) {
      Alert.alert("Keranjang kosong", "Tambahkan item terlebih dahulu");
      return;
    }
    router.push("/receipt");
  };

  const handleClearCart = () => {
    Alert.alert(
      "Hapus Keranjang?",
      "Semua item akan dihapus dari keranjang.",
      [
        { text: "Batal", onPress: () => {} },
        {
          text: "Hapus",
          onPress: async () => {
            setCart([]);
            await clearCart();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Aplikasi Kasir</Text>
        <Text style={styles.subtitle}>Sederhana</Text>
      </View>

      {/* Products Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Produk</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{formatRp(item.price)}</Text>
              </View>
              <View style={styles.productInputGroup}>
                <TextInput
                  style={styles.qtyInput}
                  placeholder="Qty"
                  keyboardType="number-pad"
                  value={quantities[item.id] || ""}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({ ...prev, [item.id]: text }))
                  }
                />
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addToCart(item)}
                >
                  <Ionicons name="add-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Cart Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Keranjang</Text>
          {cart.length > 0 && (
            <TouchableOpacity onPress={handleClearCart}>
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
        {cart.length === 0 ? (
          <Text style={styles.emptyText}>Keranjang kosong</Text>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>
                      {formatRp(item.price)} × {item.quantity}
                    </Text>
                  </View>
                  <View style={styles.cartItemControls}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove-circle" size={20} color="#059669" />
                    </TouchableOpacity>
                    <Text style={styles.cartQty}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add-circle" size={20} color="#059669" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="close-circle" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatRp(total)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{formatRp(total)}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={openReceipt}
          disabled={cart.length === 0}
        >
          <Ionicons name="receipt" size={20} color="#fff" />
          <Text style={styles.buttonText}>Lihat Struk</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#059669",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Plus Jakarta Sans",
  },
  subtitle: {
    fontSize: 14,
    color: "#d1d5db",
    fontFamily: "Plus Jakarta Sans",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    fontFamily: "Plus Jakarta Sans",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    fontFamily: "Plus Jakarta Sans",
  },
  productPrice: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    fontFamily: "Plus Jakarta Sans",
  },
  productInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: "Plus Jakarta Sans",
  },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#059669",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 20,
    fontFamily: "Plus Jakarta Sans",
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
    fontFamily: "Plus Jakarta Sans",
  },
  cartItemPrice: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    fontFamily: "Plus Jakarta Sans",
  },
  cartItemControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartQty: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    width: 24,
    textAlign: "center",
    fontFamily: "Plus Jakarta Sans",
  },
  removeBtn: {
    marginLeft: 4,
  },
  totalsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#059669",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "Plus Jakarta Sans",
  },
  totalValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    fontFamily: "Plus Jakarta Sans",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
    fontFamily: "Plus Jakarta Sans",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flexDirection: "row",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: "#059669",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Plus Jakarta Sans",
  },
});
