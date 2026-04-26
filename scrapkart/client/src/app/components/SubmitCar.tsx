import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calculator, Car, Calendar, Gauge, AlertCircle, Image, FileText, CheckCircle2, Info } from 'lucide-react';
import { apiRequest } from '../lib/api';

// Indian car brands and their models with base prices (INR)
const CAR_DATA: Record<string, { models: Record<string, number> }> = {
  'Maruti Suzuki': {
    models: {
      'Alto': 180000,
      'Swift': 350000,
      'Baleno': 480000,
      'Vitara Brezza': 580000,
      'Ertiga': 650000,
      'S-Cross': 750000,
      'Ciaz': 700000,
    },
  },
  'Hyundai': {
    models: {
      'i10': 280000,
      'i20': 450000,
      'Creta': 800000,
      'Venue': 580000,
      'Grand i10 Nios': 380000,
      'Aura': 520000,
      'Kona Electric': 1500000,
    },
  },
  'Tata': {
    models: {
      'Nexon': 650000,
      'Harrier': 1200000,
      'Tigor': 380000,
      'Punch': 480000,
      'Safari': 1400000,
      'Altroz': 450000,
      'Nexon EV': 1500000,
    },
  },
  'Mahindra': {
    models: {
      'Bolero': 580000,
      'XUV300': 750000,
      'Scorpio': 900000,
      'XUV500': 1200000,
      'Thar': 1100000,
      'Marazzo': 900000,
    },
  },
  'Renault': {
    models: {
      'Kwid': 250000,
      'Duster': 700000,
      'Captur': 850000,
    },
  },
  'Kia': {
    models: {
      'Seltos': 950000,
      'Carens': 850000,
      'Sonet': 650000,
    },
  },
  'Skoda': {
    models: {
      'Rapid': 700000,
      'Superb': 1500000,
      'Slavia': 750000,
    },
  },
  'MG': {
    models: {
      'Astor': 850000,
      'Hector': 1250000,
      'ZS EV': 1700000,
    },
  },
  'Honda': {
    models: {
      'City': 850000,
      'Amaze': 480000,
      'Civic': 1150000,
      'CR-V': 1600000,
    },
  },
  'Toyota': {
    models: {
      'Fortuner': 1800000,
      'Innova': 1200000,
      'Camry': 1600000,
      'Glanza': 520000,
    },
  },
  'Nissan': {
    models: {
      'Magnite': 380000,
      'Kicks': 550000,
      'Altima': 1000000,
    },
  },
  'Citroen': {
    models: {
      'C3': 450000,
      'C5 Aircross': 1600000,
    },
  },
  'Jeep': {
    models: {
      'Compass': 1250000,
      'Wrangler': 1800000,
    },
  },
  'BYD': {
    models: {
      'Yuan Plus': 1500000,
    },
  },
  'Chevrolet': {
    models: {
      'Beat': 380000,
      'Enjoy': 580000,
      'Cruze': 850000,
    },
  },
};

const SubmitCar = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    description: '',
    expectedPrice: '',
  });
  const [carImage, setCarImage] = useState<File | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-calculate estimate when all required fields are filled
    if (name !== 'description' && name !== 'expectedPrice') {
      calculateEstimate({ ...formData, [name]: value });
    }
  };

  const calculateEstimate = (data: typeof formData) => {
    const { make, model, year, mileage, condition } = data;
    if (!make || !model || !year || !mileage || !condition) return;

    // Get base price from car data
    const basePrice = CAR_DATA[make]?.models[model] || 500000;
    
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(year);
    
    // Depreciation calculation: 15% per year
    const depreciationRate = 0.15;
    const depreciationMultiplier = Math.max(0.1, 1 - (carAge * depreciationRate));
    
    // Mileage adjustment
    let mileageMultiplier = 1;
    const mileageValue = parseInt(mileage);
    if (mileageValue < 30000) mileageMultiplier = 1.15;
    else if (mileageValue < 60000) mileageMultiplier = 1.1;
    else if (mileageValue < 100000) mileageMultiplier = 0.9;
    else if (mileageValue < 150000) mileageMultiplier = 0.75;
    else mileageMultiplier = 0.5;
    
    // Condition multiplier
    const conditionMultiplier: Record<string, number> = {
      'excellent': 1.3,
      'good': 1.1,
      'fair': 0.9,
      'poor': 0.6,
      'not-running': 0.3,
    };
    
    const estimate = Math.round(
      basePrice * depreciationMultiplier * mileageMultiplier * (conditionMultiplier[condition] || 1)
    );
    
    setEstimatedPrice(Math.max(50000, estimate)); // Minimum 50k scrap value
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error('Please login first');
      return;
    }

    if (!carImage) {
      toast.error('Please upload an image of your car');
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('make', formData.make);
      dataToSend.append('model', formData.model);
      dataToSend.append('year', formData.year);
      dataToSend.append('mileage', formData.mileage);
      dataToSend.append('condition', formData.condition);
      dataToSend.append('expectedPrice', formData.expectedPrice);
      dataToSend.append('description', formData.description);
      dataToSend.append('carImage', carImage);

      await apiRequest('/api/cars', {
        method: 'POST',
        token,
        body: dataToSend,
      });

      toast.success('Car submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-600 text-white p-2 rounded-lg">
              <Car className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Submit Your Car</h1>
          </div>
          <p className="text-lg text-gray-600">Get an instant price estimate for your scrap car in just a few steps</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Vehicle Details */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">Step 1</div>
              <h2 className="text-xl font-bold text-gray-900">Vehicle Identification</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Tell us about your car</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="make" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <Car className="h-4 w-4 text-orange-500" />
                  Car Brand *
                </label>
                <select
                  id="make"
                  name="make"
                  required
                  value={formData.make}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white hover:border-gray-300"
                >
                  <option value="">Select Brand</option>
                  {Object.keys(CAR_DATA).map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="model" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Car Model *
                </label>
                <select
                  id="model"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  disabled={!formData.make}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 bg-white hover:border-gray-300"
                >
                  <option value="">{formData.make ? 'Select Model' : 'Choose brand first'}</option>
                  {formData.make && CAR_DATA[formData.make] && 
                    Object.keys(CAR_DATA[formData.make].models).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label htmlFor="year" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Year *
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g. 2018"
                />
              </div>

              <div>
                <label htmlFor="mileage" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <Gauge className="h-4 w-4 text-orange-500" />
                  Mileage (km) *
                </label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  required
                  min="0"
                  value={formData.mileage}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Condition & Pricing */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">Step 2</div>
              <h2 className="text-xl font-bold text-gray-900">Condition & Pricing</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Help us estimate the value</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="condition" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  Vehicle Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300"
                >
                  <option value="">Select Condition</option>
                  <option value="excellent">⭐ Excellent - Runs perfectly, minor wear</option>
                  <option value="good">👍 Good - Runs well, some wear</option>
                  <option value="fair">⚠️ Fair - Runs but needs repairs</option>
                  <option value="poor">❌ Poor - Major issues, barely runs</option>
                  <option value="not-running">🛑 Not Running - Won't start</option>
                </select>
              </div>

              <div>
                <label htmlFor="expectedPrice" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  Expected Price (INR) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-700">₹</span>
                  <input
                    type="number"
                    id="expectedPrice"
                    name="expectedPrice"
                    required
                    min="0"
                    value={formData.expectedPrice}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your expected price"
                  />
                </div>
                {estimatedPrice && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Our estimate: ₹{estimatedPrice.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Additional Info */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">Step 3</div>
              <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Tell us more about your car</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Any additional details about your car? (e.g., recent repairs, parts replaced, accident history...)"
                />
              </div>

              <div>
                <label htmlFor="carImage" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                  <Image className="h-4 w-4 text-green-500" />
                  Car Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    id="carImage"
                    name="carImage"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setCarImage(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                  <label htmlFor="carImage" className="cursor-pointer block text-center">
                    <div className="flex justify-center mb-2">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {carImage ? `✓ ${carImage.name}` : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 5MB)</p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Price Display */}
          {estimatedPrice !== null && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white p-3 rounded-lg">
                  <Calculator className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Estimated Value</h3>
                  <p className="text-3xl font-bold text-orange-600 mb-2">₹{estimatedPrice.toLocaleString()}</p>
                  <div className="bg-white bg-opacity-50 rounded p-3">
                    <p className="text-xs text-gray-700">
                      <strong>📊 How it's calculated:</strong> This estimate is based on market price, car age, mileage, and condition. Your final amount may vary after our expert inspection. We'll compare your expected price with our estimate to ensure the best deal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>✓ Our expert team reviews your submission</li>
                <li>✓ We schedule an inspection at your convenience</li>
                <li>✓ Final offer made after visual assessment</li>
                <li>✓ Free towing and instant payment upon acceptance</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </span>
            ) : (
              '🚗 Submit Car for Review'
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            By submitting, you agree to our Terms & Conditions. Your information will be kept confidential.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SubmitCar;