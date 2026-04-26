import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Shield, IndianRupee, Truck, Star } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
              Get Cash for Your Old Car
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-100">
              Turn your scrap car into cash with CarScrap Pro. We buy any vehicle, no matter the condition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit-car"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Sell Your Car
              </Link>
              {!isAdmin ? (
                <Link
                  to="/parts"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                >
                  Buy Parts
                </Link>
              ) : (
                <Link
                  to="/admin"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                >
                  Manage Marketplace
                </Link>
              )}
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1771240661767-5b10be9e7d8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqdW5reWFyZCUyMHNjcmFwJTIwY2Fyc3xlbnwxfHx8fDE3NzU0ODYxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Scrap cars"
            className="rounded-lg shadow-2xl w-full h-[400px] object-cover mt-8"
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CarScrap Pro?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best service for selling your car and buying quality parts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Get the highest payout for your vehicle with our competitive pricing.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Process</h3>
              <p className="text-gray-600">Safe and transparent transaction process from start to finish.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Towing</h3>
              <p className="text-gray-600">We pick up your car for free, anywhere in the service area.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Selling your car has never been easier</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Details</h3>
              <p className="text-gray-600">Tell us about your car using our simple online form.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Estimate</h3>
              <p className="text-gray-600">Receive an instant price estimate based on your car's details.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Schedule Pickup</h3>
              <p className="text-gray-600">Choose a convenient time for us to pick up your vehicle.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
              <p className="text-gray-600">Receive your payment immediately upon vehicle inspection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parts Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality Parts Marketplace</h2>
            <p className="text-lg text-gray-600">Find the perfect parts for your vehicle</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1759419281480-bacc913c9606?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBwYXJ0cyUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzc1NDg2MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Car parts"
            className="rounded-lg shadow-xl w-full h-[400px] object-cover mb-8"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Sample parts cards */}
            <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <Car className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Engine Block</h3>
                <p className="text-gray-600 mb-2">Toyota Camry 2018</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">₹299</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <Car className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Transmission</h3>
                <p className="text-gray-600 mb-2">Honda Civic 2019</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">₹450</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">4.8</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <Car className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Brake System</h3>
                <p className="text-gray-600 mb-2">Ford Focus 2017</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">₹180</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">4.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            {!isAdmin ? (
              <Link
                to="/parts"
                className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                View All Parts
              </Link>
            ) : (
              <Link
                to="/admin"
                className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Go to Admin Panel
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-orange-100">Cars Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-orange-100">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-orange-100">Parts Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-orange-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell Your Car?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have turned their old cars into cash with CarScrap Pro.
          </p>
          <Link
            to="/submit-car"
            className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;