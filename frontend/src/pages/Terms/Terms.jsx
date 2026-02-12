import { FiFileText, FiShield, FiUser, FiCreditCard, FiTruck } from 'react-icons/fi';

const Terms = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: <FiFileText className="text-2xl" />,
      content: `By accessing and using LGES Fashion ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.`
    },
    {
      title: 'User Account',
      icon: <FiUser className="text-2xl" />,
      content: `When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the security of your account and password. You are fully responsible for all activities that occur under the account and any other actions taken in connection with the account.`
    },
    {
      title: 'Purchases and Payments',
      icon: <FiCreditCard className="text-2xl" />,
      content: `We accept various payment methods including credit/debit cards, Easypaisa, JazzCash, and Cash on Delivery (COD). All purchases are subject to verification and approval. We may refuse or cancel orders at our discretion. Prices are subject to change without notice. All orders are subject to availability and confirmation.`
    },
    {
      title: 'Shipping and Delivery',
      icon: <FiTruck className="text-2xl" />,
      content: `We offer standard and express shipping options throughout Pakistan. Standard shipping typically takes 2-5 business days, while express shipping delivers within 1 day in major cities. Delivery times may vary during holidays and peak seasons. Recipient must be present to sign for COD orders.`
    },
    {
      title: 'Returns and Refunds',
      icon: <FiShield className="text-2xl" />,
      content: `We offer a 30-day return policy for unused items in original condition with tags attached. Items must be returned in original packaging. Refunds are processed to the original payment method within 3-5 business days after inspection. Shipping costs are non-refundable unless the item was damaged or incorrect.`
    }
  ];

  const additionalTerms = [
    {
      title: 'Intellectual Property',
      content: 'All content, trademarks, and data on this website are the property of LGES Fashion and are protected by applicable intellectual property laws.'
    },
    {
      title: 'Limitation of Liability',
      content: 'LGES Fashion shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use of this service or products purchased from us.'
    },
    {
      title: 'Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service constitutes acceptance of the modified terms.'
    },
    {
      title: 'Governing Law',
      content: 'These terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiFileText className="text-3xl text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Last updated: January 3, 2026
          </p>
        </div>

        {/* Main Terms */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 flex-shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Terms */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {additionalTerms.map((term, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{term.title}</h3>
              <p className="text-gray-600 text-sm">{term.content}</p>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">Important Notice</h3>
          <ul className="space-y-2 text-red-700">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>By continuing to use our services, you acknowledge that you have read, understood, and agree to these terms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>If you do not agree with any part of these terms, you must not use our services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>For questions about these terms, please contact us at support@lgesfashion.com</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Have questions about our terms? Contact our support team at{' '}
            <a href="mailto:support@lgesfashion.com" className="text-red-500 hover:text-red-600 font-medium">
              support@lgesfashion.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
