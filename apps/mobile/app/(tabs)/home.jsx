import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user } = useUser();
  const { signIn } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleProductPress = (productId) => {
    router.push(`/(tabs)/product/${productId}`);
  };

  const renderProductCard = (product) => (
    <TouchableOpacity
      key={product.id}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => handleProductPress(product.id)}
    >
      <View
        style={{
          aspectRatio: 1,
          backgroundColor: "#f3f4f6",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={{
              width: "100%",
              height: "100%",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 40, color: "#9ca3af" }}>📷</Text>
            <Text style={{ color: "#9ca3af", marginTop: 8 }}>No Image</Text>
          </View>
        )}
      </View>

      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: 8,
          }}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#16a34a",
            marginBottom: 8,
          }}
        >
          ${product.price}
        </Text>
        {product.category_name && (
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
            {product.category_name}
          </Text>
        )}
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>
          Seller: {product.seller_email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "white",
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#16a34a" }}
            >
              EcoFinds
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
              Sustainable Marketplace
            </Text>
          </View>

          {!user && (
            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                backgroundColor: "#16a34a",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: 8,
            }}
          >
            {user ? `Welcome back, ${user.email}!` : "Welcome to EcoFinds"}
          </Text>
          <Text style={{ fontSize: 16, color: "#6b7280", lineHeight: 24 }}>
            Discover unique second-hand items and give them a new life. Buy
            sustainable, sell responsibly.
          </Text>
        </View>

        {/* Quick Actions */}
        {user && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/add-product")}
                style={{
                  flex: 1,
                  backgroundColor: "#16a34a",
                  padding: 16,
                  borderRadius: 12,
                  marginRight: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 16 }}
                >
                  Sell Item
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/search")}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  padding: 16,
                  borderRadius: 12,
                  marginLeft: 8,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
              >
                <Text
                  style={{ color: "#1f2937", fontWeight: "600", fontSize: 16 }}
                >
                  Browse
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Products Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#1f2937" }}>
            Latest Products
          </Text>
        </View>

        {/* Error State */}
        {error && (
          <View
            style={{
              padding: 16,
              margin: 16,
              backgroundColor: "#fef2f2",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#fecaca",
            }}
          >
            <Text style={{ color: "#dc2626", textAlign: "center" }}>
              {error}
            </Text>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={{ color: "#6b7280", marginTop: 16 }}>
              Loading products...
            </Text>
          </View>
        )}

        {/* Products List */}
        {!loading && products.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🛍️</Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: 8,
              }}
            >
              No products yet
            </Text>
            <Text
              style={{ color: "#6b7280", textAlign: "center", lineHeight: 20 }}
            >
              Be the first to list a product and start the sustainable
              marketplace!
            </Text>
            {user && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/add-product")}
                style={{
                  backgroundColor: "#16a34a",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginTop: 16,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Add First Product
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>{products.map(renderProductCard)}</View>
        )}
      </ScrollView>
    </View>
  );
}



