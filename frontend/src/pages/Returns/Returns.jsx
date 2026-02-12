import { FiRefreshCw, FiPackage, FiCalendar, FiTag, FiInfo } from 'react-icons/fi';

const Returns = () => {
  const returnPolicy = [
    {
      title: '30-Day Return Policy',
      description: 'Return items within 30 days of delivery for a full refund',
      icon: <FiCalendar className="text-2xl" />
    },
    {
      title: 'Free Return Shipping',
      description: 'We provide free return shipping labels for all returns',
      icon: <FiPackage className="text-2xl" />
    },
    {
      title: 'Easy Exchange',
      description: 'Exchange items for different size or color within 30 days',
      icon: <FiRefreshCw className="text-2xl" />
    }
  ];

  const returnSteps = [
    {
      step: 1,
      title: 'Contact Us',
      description: 'Notify us about the return within 30 days of delivery'
    },
    {
      step: 2,
      title: 'Pack Item',
      description: 'Pack the item in original condition with tags attached'
    },
    {
      step: 3,
      title: 'Send Back',
      description: 'Use our free return label to send the item back'
    },
    {
      step: 4,
      title: 'Refund Processed',
      description: 'Receive refund within 3-5 business days after inspection'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiRefreshCw className="text-3xl text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Returns & Exchange Policy</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            We want you to be completely satisfied with your purchase. Our easy return process makes it simple to get a refund or exchange.
          </p>
        </div>

        {/* Return Policy Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {returnPolicy.map((policy, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-4">
                {policy.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{policy.title}</h3>
              <p className="text-gray-600">{policy.description}</p>
            </div>
          ))}
        </div>

        {/* Return Steps */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((step) => (
              <div
                key={step.step}
                className="text-center"
              >
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Return Conditions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Eligible for Return */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FiTag className="text-xl text-green-500" />
              <h3 className="text-xl font-bold text-gray-900">Eligible for Return</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Items in original condition with tags attached</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Within 30 days of delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Original packaging included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Proof of purchase required</span>
              </li>
            </ul>
          </div>

          {/* Not Eligible for Return */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FiInfo className="text-xl text-red-500" />
              <h3 className="text-xl font-bold text-gray-900">Not Eligible for Return</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                <span>Items worn or damaged by customer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                <span>Items past 30-day return window</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                <span>Underwear and swimwear for hygiene reasons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                <span>Final sale items</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Exchange Process */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Exchange Process</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Request Exchange</h3>
              <p className="text-gray-600 text-sm">Contact us with your order details and reason for exchange</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Receive New Item</h3>
              <p className="text-gray-600 text-sm">We'll send the new item before receiving the old one</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Return Original</h3>
              <p className="text-gray-600 text-sm">Return the original item using our free return label</p>
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">Important Information</h3>
          <ul className="space-y-2 text-red-700">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Refunds are processed to the original payment method</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Shipping costs are non-refundable unless item was damaged</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Refunds typically take 3-5 business days to appear in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Contact customer support for any issues with your return</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Returns;
