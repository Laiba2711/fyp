import { FiInfo, FiCheckCircle, FiBox } from 'react-icons/fi';

const SizeGuide = () => {
  const sizeCharts = [
    {
      category: 'Men\'s Clothing',
      chart: [
        { size: 'S', chest: '36-38"', waist: '28-30"', hips: '34-36"' },
        { size: 'M', chest: '38-40"', waist: '30-32"', hips: '36-38"' },
        { size: 'L', chest: '40-42"', waist: '32-34"', hips: '38-40"' },
        { size: 'XL', chest: '42-44"', waist: '34-36"', hips: '40-42"' },
        { size: 'XXL', chest: '44-46"', waist: '36-38"', hips: '42-44"' },
      ]
    },
    {
      category: 'Women\'s Clothing',
      chart: [
        { size: 'XS', bust: '32-34"', waist: '24-26"', hips: '34-36"' },
        { size: 'S', bust: '34-36"', waist: '26-28"', hips: '36-38"' },
        { size: 'M', bust: '36-38"', waist: '28-30"', hips: '38-40"' },
        { size: 'L', bust: '38-40"', waist: '30-32"', hips: '40-42"' },
        { size: 'XL', bust: '40-42"', waist: '32-34"', hips: '42-44"' },
      ]
    },
    {
      category: 'Kids Clothing (Ages 2-14)',
      chart: [
        { size: '2Y', height: '34-36"', chest: '22-23"', waist: '20-21"' },
        { size: '4Y', height: '36-38"', chest: '23-24"', waist: '21-22"' },
        { size: '6Y', height: '38-40"', chest: '24-25"', waist: '22-23"' },
        { size: '8Y', height: '40-42"', chest: '25-26"', waist: '23-24"' },
        { size: '10Y', height: '42-44"', chest: '26-27"', waist: '24-25"' },
        { size: '12Y', height: '44-46"', chest: '27-28"', waist: '25-26"' },
        { size: '14Y', height: '46-48"', chest: '28-29"', waist: '26-27"' },
      ]
    }
  ];

  const shoeSizes = [
    {
      category: 'Men\'s Shoes',
      chart: [
        { us: '7', uk: '6', eu: '40', cm: '25.0' },
        { us: '8', uk: '7', eu: '41', cm: '26.0' },
        { us: '9', uk: '8', eu: '42', cm: '27.0' },
        { us: '10', uk: '9', eu: '43', cm: '28.0' },
        { us: '11', uk: '10', eu: '44', cm: '29.0' },
        { us: '12', uk: '11', eu: '45', cm: '30.0' },
      ]
    },
    {
      category: 'Women\'s Shoes',
      chart: [
        { us: '5', uk: '4', eu: '37', cm: '23.0' },
        { us: '6', uk: '5', eu: '38', cm: '24.0' },
        { us: '7', uk: '6', eu: '39', cm: '25.0' },
        { us: '8', uk: '7', eu: '40', cm: '26.0' },
        { us: '9', uk: '8', eu: '41', cm: '27.0' },
        { us: '10', uk: '9', eu: '42', cm: '28.0' },
      ]
    }
  ];

  const measuringTips = [
    'Wear minimal clothing when taking measurements',
    'Use a flexible measuring tape',
    'Stand naturally with arms at your sides',
    'Don\'t pull the tape too tight',
    'Take measurements over the fullest part of the body',
    'Have someone help you for more accurate measurements'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiBox className="text-3xl text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Size Guide</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Find your perfect fit with our comprehensive size guide. Use our measurement tips for the most accurate results.
          </p>
        </div>

        {/* Measuring Tips */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FiInfo className="text-2xl text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">How to Measure</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {measuringTips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <FiCheckCircle className="text-green-500 mt-1" />
                <span className="text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clothing Size Charts */}
        <div className="space-y-12">
          {sizeCharts.map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">Size</th>
                      {Object.keys(category.chart[0]).filter(key => key !== 'size').map(key => (
                        <th key={key} className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900 capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {category.chart.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">{row.size}</td>
                        {Object.keys(row).filter(key => key !== 'size').map(key => (
                          <td key={key} className="border border-gray-200 px-4 py-3 text-gray-700">{row[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Shoe Size Charts */}
        <div className="space-y-12 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Shoe Size Guide</h2>
          {shoeSizes.map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">US</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">UK</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">EU</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.chart.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">{row.us}</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{row.uk}</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{row.eu}</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Size Conversion */}
        <div className="mt-12 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">Important Notes</h3>
          <ul className="space-y-2 text-red-700">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Sizes may vary slightly between different brands and styles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>When in between sizes, we recommend choosing the larger size</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>For fitted items, consider going up a size if you prefer a looser fit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Check individual product pages for specific fit recommendations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
