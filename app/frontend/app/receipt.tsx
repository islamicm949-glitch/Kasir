import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Share,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getCart, clearCart } from "@/src/utils/storage";
import { formatRp, formatDate } from "@/src/utils/format";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function ReceiptScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptTime] = useState<Date>(new Date());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const savedCart = await getCart();
    setCart(savedCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const generateReceiptText = (): string => {
    const lines = [
      "=".repeat(40),
      "APLIKASI KASIR SEDERHANA",
      "=".repeat(40),
      "",
      `Tanggal: ${formatDate(receiptTime)}`,
      "",
      "-".repeat(40),
      "Item                    Qty    Harga",
      "-".repeat(40),
    ];

    cart.forEach((item) => {
      const subtotal = item.price * item.quantity;
      const itemLine = `${item.name.padEnd(16)} ${String(item.quantity).padEnd(4)} ${formatRp(subtotal)}`;
      lines.push(itemLine);
    });

    lines.push("-".repeat(40));
    lines.push(`Total: ${formatRp(total)}`);
    lines.push("=".repeat(40));
    lines.push("Terima kasih atas pembelian Anda!");
    lines.push("=".repeat(40));

    return lines.join("\n");
  };

  const handleShare = async () => {
    try {
      const receiptText = generateReceiptText();
      await Share.share({
        message: receiptText,
        title: "Struk Pembelian",
      });
    } catch (error) {
      Alert.alert("Error", "Gagal membagikan struk");
    }
  };

  const handleNewTransaction = async () => {
    await clearCart();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Struk Pembelian</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.receiptContainer}>
        <View style={styles.receiptHeader}>
          <Text style={styles.storeName}>APLIKASI KASIR</Text>
          <Text style={styles.storeSubtitle}>Sederhana</Text>
        </View>

        <View style={styles.receiptDivider} />

        <Text style={styles.receiptDate}>
          {formatDate(receiptTime)}
        </Text>

        <View style={styles.receiptDivider} />

        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const subtotal = item.price * item.quantity;
            return (
              <View style={styles.receiptItem}>
                <View style={styles.receiptItemName}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQtyPrice}>
                    {item.quantity} × {formatRp(item.price)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatRp(subtotal)}</Text>
              </View>
            );
          }}
        />

        <View style={styles.receiptDivider} />

        <View style={styles.receiptTotal}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>{formatRp(total)}</Text>
        </View>

        <View style={styles.receiptDivider} />

        <Text style={styles.thankYou}>Terima kasih atas pembelian Anda!</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={20} color="#059669" />
          <Text style={styles.buttonTextSecondary}>Bagikan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleNewTransaction}
        >
          <Ionicons name="checkmark-done" size={20} color="#fff" />
          <Text style={styles.buttonText}>Transaksi Baru</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", fontFamily: "Plus Jakarta Sans" },
  receiptContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginVertical: 12,
    marginHorizontal: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  receiptHeader: { alignItems: "center", marginBottom: 12 },
  storeName: { fontSize: 20, fontWeight: "700", color: "#059669", fontFamily: "Plus Jakarta Sans", letterSpacing: 1 },
  storeSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 4, fontFamily: "Plus Jakarta Sans" },
  receiptDivider: { height: 1, backgroundColor: "#d1d5db", marginVertical: 12 },
  receiptDate: { fontSize: 12, color: "#6b7280", textAlign: "center", fontFamily: "Plus Jakarta Sans" },
  receiptItem: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  receiptItemName: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "500", color: "#1f2937", fontFamily: "Plus Jakarta Sans" },
  itemQtyPrice: { fontSize: 12, color: "#6b7280", marginTop: 2, fontFamily: "Plus Jakarta Sans" },
  itemTotal: { fontSize: 14, fontWeight: "600", color: "#1f2937", textAlign: "right", fontFamily: "Plus Jakarta Sans" },
  receiptTotal: { marginVertical: 8 },
  totalLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600", fontFamily: "Plus Jakarta Sans" },
  totalAmount: { fontSize: 24, fontWeight: "700", color: "#059669", marginTop: 4, fontFamily: "Plus Jakarta Sans" },
  thankYou: { fontSize: 12, color: "#6b7280", textAlign: "center", fontStyle: "italic", fontFamily: "Plus Jakarta Sans" },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  button: { flex: 1, flexDirection: "row", height: 44, borderRadius: 8, justifyContent: "center", alignItems: "center", gap: 8 },
  buttonPrimary: { backgroundColor: "#059669" },
  buttonSecondary: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#059669" },
  buttonText: { fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "Plus Jakarta Sans" },
  buttonTextSecondary: { fontSize: 14, fontWeight: "600", color: "#059669", fontFamily: "Plus Jakarta Sans" },
});
