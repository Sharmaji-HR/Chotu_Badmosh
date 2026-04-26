import { ChangeEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowLeftRight, ShoppingBag, Truck, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../lib/api';

const CartPage = () => {
  const { user, token } = useAuth();
  const { items, cartTotal, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const navigate = useNavigate();

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    return [
      address.fullName,
      address.phone,
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].every((value) => value.trim().length > 0);
  };

  const placeOrder = async () => {
    if (!token) {
      toast.error('Please log in to place an order.');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!validateAddress()) {
      toast.error('Please fill in all shipping address fields.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/orders', {
        method: 'POST',
        token,
        body: {
          paymentMethod: 'COD',
          items: items.map((item) => ({ partId: item.partId, quantity: item.quantity })),
          shippingAddress: address,
        },
      });

      toast.success('Order placed successfully! Cash on delivery selected.');
      clearCart();
      navigate('/dashboard');
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error instanceof Error ? error.message : 'Order could not be placed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg shadow-lg">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">Review and checkout your selected parts</p>
            </div>
          </div>
          <Link
            to="/parts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-300 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <ShoppingBag className="h-10 w-10 text-orange-500" />
            </div>
            <p className="text-gray-700 text-xl font-semibold mb-2">Your cart is empty</p>
            <p className="text-gray-600 mb-8">Add some quality car parts to get started!</p>
            <Link to="/parts" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg">
              Start Shopping
              <ArrowLeftRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items Section */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.partId} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                            <p className="text-sm text-gray-600 mt-1">In stock: {item.availableQuantity ?? item.quantity} units</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.partId)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar: Shipping Address & Order Summary */}
            <div className="space-y-6">
              {/* Shipping Address Card */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-gray-100">
                  <MapPin className="h-6 w-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                </div>
                <div className="space-y-3">
                  <input
                    name="fullName"
                    value={address.fullName}
                    onChange={handleAddressChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  />
                  <input
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="Phone Number"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  />
                  <input
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="Street Address"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  />
                  <input
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                    />
                    <input
                      name="postalCode"
                      value={address.postalCode}
                      onChange={handleAddressChange}
                      placeholder="Postal Code"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                    />
                  </div>
                  <input
                    name="country"
                    value={address.country}
                    onChange={handleAddressChange}
                    placeholder="Country"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-md p-6 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-orange-200">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Items ({items.length})</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 pb-4 border-b-2 border-orange-200">
                    <span className="font-medium">Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2">
                    <span>Total</span>
                    <span className="text-orange-600">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600 flex gap-3">
                <Truck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Delivery Info</p>
                  <p className="text-xs">Cash on Delivery • Free Shipping • Estimated 3-5 business days</p>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="button"
                onClick={placeOrder}
                disabled={loading || items.length === 0}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Place Order (COD)
                  </span>
                )}
              </button>

              {!user && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-900 mb-3">
                    You must be logged in to complete the order.
                  </p>
                  <Link to="/login" className="inline-block px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
                    Login to Continue
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
