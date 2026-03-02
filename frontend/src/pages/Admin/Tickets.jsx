import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const statusOptions = ['open', 'in-progress', 'resolved', 'closed'];

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const loadTickets = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await chatAPI.getAllTickets(params);
      setTickets(res.data.tickets);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tickets');
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const openTicket = async (ticketId) => {
    try {
      const res = await chatAPI.getTicketById(ticketId);
      setSelected(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Unable to open ticket');
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selected) return;
    try {
      await chatAPI.postTicketMessage(selected.ticket._id, { message: messageText });
      setMessageText('');
      openTicket(selected.ticket._id); // refresh detail
      loadTickets();
    } catch (e) {
      console.error(e);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Support Tickets</h2>
      <div className="mb-4">
        <label>Status: </label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1 ml-2"
        >
          <option value="">All</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4">
        <div className="w-1/2">
          <ul className="space-y-2">
            {tickets.map(t => (
              <li
                key={t._id}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => openTicket(t._id)}
              >
                <div className="font-semibold">{t.subject}</div>
                <div className="text-sm text-gray-600">{t.category}</div>
                <div className="text-xs text-gray-500">{t.status}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/2">
          {selected ? (
            <div>
              <h3 className="text-xl font-bold mb-2">{selected.ticket.subject}</h3>
              <p className="mb-4">{selected.ticket.description}</p>
              <div className="space-y-2">
                {selected.messages.map(m => (
                  <div key={m._id} className={`p-2 rounded ${m.sender==='admin' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
                    <div className="text-sm">{m.message}</div>
                    <div className="text-[10px] text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="flex-1 border rounded px-2 py-1"
                />
                <button onClick={sendMessage} className="bg-indigo-500 text-white px-3 py-1 rounded">Send</button>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Change Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="mt-1 block w-full border rounded px-2 py-1"
                >
                  <option value="">-- select --</option>
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (!newStatus) return;
                    try {
                      await chatAPI.updateTicketStatus(selected.ticket._id, { status: newStatus });
                      openTicket(selected.ticket._id);
                      loadTickets();
                      setNewStatus('');
                      toast.success('Status updated');
                    } catch (err) {
                      console.error(err);
                      toast.error('Failed to update status');
                    }
                  }}
                  className="mt-2 btn btn-primary"
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            <p>Select a ticket to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;