import React, { useState } from 'react';
import { chatAPI } from '../../utils/api';
import toast from 'react-hot-toast';


const Support = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'order_issue',
    orderId: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k,v]) => data.append(k, v));
      if (attachment) data.append('attachments', attachment);
      // use chatAPI so we hit the unified ticket endpoint (supports attachments)
      await chatAPI.createTicket(data);
      toast.success('Ticket submitted!');
      setFormData({ subject: '', description: '', category: 'order_issue', orderId: '' });
      setAttachment(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="font-medium">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            <option value="order_issue">Order Issue</option>
            <option value="payment_issue">Payment Issue</option>
            <option value="refund">Refund</option>
            <option value="technical_issue">Technical Issue</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Order ID (optional)</label>
          <input
            type="text"
            name="orderId"
            value={formData.orderId}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Attachment (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default Support;