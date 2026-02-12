import { FiShield, FiUser, FiMail, FiCreditCard, FiInfo } from 'react-icons/fi';

const Privacy = () => {
  const privacySections = [
    {
      title: 'Information We Collect',
      icon: <FiUser className="text-2xl" />,
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer service. This includes your name, email address, phone number, shipping address, payment information, and order history. We also collect information about your interactions with our website and services.`
    },
    {
      title: 'How We Use Your Information',
      icon: <FiInfo className="text-2xl" />,
      content: `We use the information we collect to process your orders, provide customer support, send you updates about your order, personalize your shopping experience, improve our services, and communicate with you about products, services, and promotions. We may also use your information to prevent fraud and enhance security.`
    },
    {
      title: 'Information Sharing',
      icon: <FiMail className="text-2xl" />,
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, conducting business, or serving our customers. We may also disclose your information if required by law or to protect our rights and safety.`
    },
    {
      title: 'Data Security',
      icon: <FiShield className="text-2xl" />,
      content: `We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information. We use secure socket layer (SSL) technology to encrypt sensitive information during transmission. However, no method of transmission over the internet is 100% secure.`
    },
    {
      title: 'Payment Information',
      icon: <FiCreditCard className="text-2xl" />,
      content: `We use trusted payment processors to handle your payment information securely. We do not store your credit card information on our servers. Payment information is processed and stored by our payment service providers in compliance with industry standards for payment security.`
    }
  ];

  const userRights = [
    {
      title: 'Access Your Information',
      content: 'You have the right to request access to the personal information we hold about you.'
    },
    {
      title: 'Correct Your Information',
      content: 'You have the right to request correction of any inaccurate or incomplete personal information.'
    },
    {
      title: 'Delete Your Information',
      content: 'You have the right to request deletion of your personal information under certain circumstances.'
    },
    {
      title: 'Opt-out of Marketing',
      content: 'You can opt-out of marketing communications at any time by following the unsubscribe link in our emails.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiShield className="text-3xl text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Last updated: January 3, 2026
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8 mb-12">
          {privacySections.map((section, index) => (
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

        {/* User Rights */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {userRights.map((right, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <h3 className="font-bold text-gray-900 mb-2">{right.title}</h3>
                <p className="text-gray-600 text-sm">{right.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar tracking technologies to enhance your experience on our website. 
            Cookies help us remember your preferences, analyze website traffic, and improve our services.
          </p>
          <p className="text-gray-600">
            You can control cookies through your browser settings. However, disabling cookies may affect 
            your ability to use certain features of our website.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">Contact Us</h3>
          <p className="text-red-700 mb-4">
            If you have questions about this privacy policy or concerns about your privacy, please contact us:
          </p>
          <div className="space-y-2">
            <p className="text-red-700">Email: <a href="mailto:privacy@lgesfashion.com" className="underline">privacy@lgesfashion.com</a></p>
            <p className="text-red-700">Phone: +92 300 1234567</p>
            <p className="text-red-700">Address: GCUF Main Campus, Faisalabad, Punjab, Pakistan</p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            This privacy policy is effective as of January 3, 2026, and will remain in effect except with respect to 
            any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
