import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

interface Part {
  _id: string;
  name: string;
  category: string;
  carMake: string;
  carModel: string;
  year: number;
  price: number;
  condition: string;
  image?: string;
  quantity?: number;
  inStock: boolean;
  rating: number;
  description: string;
}

const MOCK_PARTS = [
  {
    _id: "1",
    name: "Engine Assembly 2.5L",
    image: "https://images.unsplash.com/photo-1653491887161-aaf72d4514f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FyJTIwZW5naW5lfGVufDF8fHx8MTc3NTQ4NjEwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Engine",
    carMake: "Toyota",
    carModel: "Camry",
    year: 2018,
    price: 299,
    condition: "used",    quantity: 5,    inStock: true,
    rating: 4.5,
    description: "High-quality engine assembly"
  },
  {
    _id: "2",
    name: "Front Bumper Assembly",
    image: "https://images.unsplash.com/photo-1759419281480-bacc913c9606?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBwYXJ0cyUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzc1NDg2MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Body",
    carMake: "Honda",
    carModel: "Civic",
    year: 2019,
    price: 450,
    condition: "new",
    quantity: 3,
    inStock: true,
    rating: 4.8,
    description: "Durable front bumper assembly"
  },
  {
    _id: "3",
    name: "LED Headlight Set",
    image: "https://images.unsplash.com/photo-1637640125496-31852f042a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pYyUyMHdvcmtzaG9wJTIwdG9vbHN8ZW58MXx8fHwxNzc1NDE4MzgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Lighting",
    carMake: "Ford",
    carModel: "Focus",
    year: 2017,
    price: 180,
    condition: "used",
    quantity: 8,
    inStock: true,
    rating: 4.2,
    description: "Bright LED headlight set"
  },
  // Alternate between these 3 images for remaining parts
];

const PartsShop = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const data = await apiRequest<Part[]>('/api/parts');
      setParts(data);
    } catch (error) {
      console.error('Error fetching parts:', error);
      // Fallback to mock data if API fails
      setParts(MOCK_PARTS as Part[]);
    } finally {
      setLoading(false);
    }
  };

  const filteredParts = parts.filter((part) => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.carMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.carModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedParts = [...filteredParts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const categories = [...new Set(parts.map(part => part.category))];

  const handleAddToCart = (part: Part) => {
    addToCart({
      partId: part._id,
      name: part.name,
      price: part.price,
      image: part.image,
      quantity: 1,
      inStock: part.inStock,
      availableQuantity: part.quantity ?? 1,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading parts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parts Marketplace</h1>
          <p className="text-gray-600">Find quality parts for your vehicle</p>
        </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search parts, make, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedParts.map((part) => (
          <div key={part._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                {part.image ? (
                  <img src={part.image} alt={part.name} className="w-full h-full object-cover rounded-t-lg" />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">🔧</div>
                    <div className="text-sm">No Image</div>
                  </div>
                )}
              </div>
              {!part.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{part.name}</h3>
              <p className="text-gray-600 text-sm mb-2">
                {part.carMake} {part.carModel} {part.year}
              </p>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-2xl font-bold text-orange-600">₹{part.price}</span>
                  <p className="text-xs text-gray-500">Available: {part.quantity ?? 1}</p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{part.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{part.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  part.condition === 'new' ? 'bg-green-100 text-green-800' :
                  part.condition === 'used' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {part.condition}
                </span>
                <button
                  onClick={() => handleAddToCart(part)}
                  disabled={!part.inStock}
                  className="flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedParts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No parts found matching your criteria.</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default PartsShop;