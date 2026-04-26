import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Car, User, LogOut, ShoppingCart } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <Car className="h-8 w-8 text-orange-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="font-bold text-xl text-gray-900 transition-all duration-300 group-hover:text-orange-500">CarScrap Pro</span>
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <Link 
                to="/" 
                className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              {user?.role !== 'admin' && (
                <>
                  <Link 
                    to="/parts" 
                    className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
                  >
                    Buy Parts
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                  <Link 
                    to="/cart" 
                    className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
                  >
                    <ShoppingCart className="h-4 w-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12" />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110">
                        {cartCount}
                      </span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                </>
              )}
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
                    >
                      Admin Panel
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                    </Link>
                  ) : (
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
                    >
                      Dashboard
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                    </Link>
                  )}
                  <div className="relative group ml-2">
                    <button className="flex items-center space-x-2 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover transition-all duration-300 group-hover:ring-2 group-hover:ring-orange-500 group-hover:scale-110"
                        />
                      ) : (
                        <User className="h-6 w-6 transition-all duration-300 group-hover:scale-125" />
                      )}
                      <span className="transition-all duration-300">{user.name}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top group-hover:scale-y-100 scale-y-95">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-all duration-300 rounded-md mx-1"
                      >
                        <LogOut className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
                  >
                    Login
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;