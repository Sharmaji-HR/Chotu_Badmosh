import { Home, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <div className="text-center max-w-md mx-auto">
        {/* 404 Icon */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-orange-200 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-5xl">❌</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3 mt-12">Oops! Page Not Found</h1>
        <p className="text-gray-600 text-lg mb-2">We couldn't find what you're looking for.</p>
        <p className="text-gray-500 text-sm mb-8">The page may have been moved or deleted. Let's get you back on track.</p>

        {/* CTA Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Home className="h-5 w-5" />
          Back to Home
          <ArrowRight className="h-5 w-5" />
        </a>

        {/* Footer text */}
        <p className="text-xs text-gray-500 mt-8">
          Error Code: 404 | Lost in the CarScrap Pro universe
        </p>
      </div>
    </div>
  );
};

export default NotFound;