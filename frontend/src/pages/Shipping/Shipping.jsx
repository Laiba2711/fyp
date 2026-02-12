import { FiTruck, FiClock, FiMapPin, FiTag, FiPackage } from 'react-icons/fi';

const Shipping = () => {
  const shippingOptions = [
    {
      title: 'Standard Shipping',
      description: '2-5 business days within Pakistan',
      cost: 'Free for orders over Rs. 5000',
      time: '2-5 days',
      icon: <FiTruck className="text-2xl" />
    },
    {
      title: 'Express Shipping',
      description: 'Next-day delivery in major cities',
      cost: 'Rs. 300',
      time: '1 day',
      icon: <FiClock className="text-2xl" />
    },
    {
      title: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      cost: 'Rs. 100 handling fee',
      time: '2-5 days',
      icon: <FiPackage className="text-2xl" />
    }
  ];

  const deliveryAreas = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 
    'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot', 'Sargodha', 'Bahawalpur'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiTruck className="text-3xl text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Shipping Information</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            We offer fast and reliable shipping across Pakistan. Get your orders delivered safely and on time.
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-4">
                {option.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-gray-600 mb-4">{option.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Cost:</span>
                  <span className="font-semibold text-gray-900">{option.cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Delivery Time:</span>
                  <span className="font-semibold text-gray-900">{option.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Areas */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FiMapPin className="text-2xl text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Delivery Areas</h2>
          </div>
          <p className="text-gray-600 mb-6">
            We deliver to all major cities across Pakistan. Here are the areas we currently serve:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryAreas.map((city, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{city}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Policy */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Processing */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FiClock className="text-xl text-red-500" />
              <h3 className="text-xl font-bold text-gray-900">Order Processing</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Orders are processed within 24 hours on business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Orders placed after 3 PM will be processed the next business day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Weekend orders will be processed on Monday</span>
              </li>
            </ul>
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FiTag className="text-xl text-red-500" />
              <h3 className="text-xl font-bold text-gray-900">Order Tracking</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Tracking number sent via email after dispatch</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Track your order on our website or with courier</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Real-time updates via SMS</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Important Info */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">Important Information</h3>
          <ul className="space-y-2 text-red-700">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Delivery times may vary during holidays and peak seasons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Recipient must be present to sign for COD orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>We're not responsible for delays caused by courier services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Contact us immediately if your package is lost or damaged</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
