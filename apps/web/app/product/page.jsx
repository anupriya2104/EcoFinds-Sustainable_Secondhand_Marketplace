import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, User } from 'lucide-react';
import useUser from '@/utils/useUser';

function MainComponent({ params }) {
  const { data: user } = useUser();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/account/signin';
      return;
    }

    setAddingToCart(true);
    setMessage(null);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      setMessage({ type: 'success', text: 'Product added to cart!' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/account/signin';
      return;
    }

    setPurchasing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase product');
      }

      setMessage({ type: 'success', text: 'Purchase successful! Check your orders.' });
      
      // Refresh product to show updated status
      setTimeout(() => {
        fetchProduct();
      }, 1000);

    } catch (error) {
      console.error('Error purchasing product:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <a href="/" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === product.user_id;
  const isAvailable = product.status === 'available';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <a href="/" className="flex items-center text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} className="mr-2" />
              Back to Products
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-600' 
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <div className="text-xl">No Image Available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
                
                <div className="flex items-center justify-between mb-4">
                  <p className="text-4xl font-bold text-green-600">${product.price}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isAvailable ? 'Available' : 'Sold'}
                  </span>
                </div>

                {product.category_name && (
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Category:</span> {product.category_name}
                  </p>
                )}

                <div className="flex items-center text-gray-600 mb-6">
                  <User size={16} className="mr-2" />
                  <span>Seller: {product.seller_email}</span>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                <p className="text-sm text-gray-500 mb-6">
                  Listed on {new Date(product.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {!user ? (
                  <div className="space-y-3">
                    <a
                      href="/account/signin"
                      className="w-full block text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Sign In to Purchase
                    </a>
                  </div>
                ) : isOwner ? (
                  <div className="space-y-3">
                    <a
                      href={`/edit-product/${product.id}`}
                      className="w-full block text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Product
                    </a>
                    <p className="text-sm text-gray-500 text-center">This is your product</p>
                  </div>
                ) : isAvailable ? (
                  <div className="space-y-3">
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {purchasing ? 'Processing...' : 'Buy Now'}
                    </button>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="w-full flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart size={20} className="mr-2" />
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">This product has been sold</p>
                    <a
                      href="/"
                      className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Browse Other Products
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;


