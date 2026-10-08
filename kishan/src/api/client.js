import axios from 'axios';

export const TOKEN_KEY = 'cafe_token';

function resolveApiBaseURL(value) {
  if (!value) return '/api';

  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  const path = url.pathname.replace(/\/+$/, '');
  url.pathname = path.endsWith('/api') ? path : `${path}/api`;
  return url.toString().replace(/\/$/, '');
}

const api = axios.create({ baseURL: resolveApiBaseURL(import.meta.env.VITE_API_URL?.trim()) });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isPublicCall = config.url?.startsWith('/public/');
  if (token && !isPublicCall) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// token expire / invalid -> login page
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/login') || url.startsWith('/auth/register');
    const isPublicCall = url.startsWith('/public/');
    if (error.response?.status === 401 && !isAuthCall && !isPublicCall) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export async function downloadInvoice(order) {
  if (!order) throw new Error('Completed order details are missing.');

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char]);
  const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
  const rate = order.gstRate ?? 5;
  const subtotal = Number(order.amount || 0);
  const gst = order.gstAmount ?? Number((subtotal * rate / 100).toFixed(2));
  const total = order.grandTotal ?? Number((subtotal + gst).toFixed(2));
  const rows = (order.items || []).map((item) => `<tr><td>${escapeHtml(item.itemName)}</td><td>${item.quantity}</td><td>${money(item.unitPrice)}</td><td>${money(item.lineTotal)}</td></tr>`).join('');
  const completedAt = order.approvedAt || order.updatedAt || new Date();
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(order.billNumber)}</title><style>body{font:14px Arial;color:#222;max-width:720px;margin:36px auto;padding:0 20px}h1{margin:0;color:#1f2937}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}th:last-child,td:last-child{text-align:right}.totals{margin-left:auto;width:300px}.totals p{display:flex;justify-content:space-between;margin:8px 0}.grand{font-size:18px;font-weight:bold;border-top:2px solid #222;padding-top:10px}@media print{body{margin:0;max-width:none}}</style></head><body><h1>Cafe Express</h1><p><strong>Tax Invoice:</strong> ${escapeHtml(order.billNumber)}<br><strong>Order:</strong> ${escapeHtml(order.ordername)}<br><strong>Customer No:</strong> ${escapeHtml(order.customerno)}<br><strong>Completed:</strong> ${new Date(completedAt).toLocaleString('en-IN')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><p><span>Subtotal</span><span>${money(subtotal)}</span></p><p><span>GST (${rate}%)</span><span>${money(gst)}</span></p><p class="grand"><span>Grand Total</span><span>${money(total)}</span></p></div><p>Thank you for dining with us.</p></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(order.billNumber || 'invoice').replace(/[\\/:*?"<>|]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const fieldErrors = (err) => err?.response?.data?.errors || {};
export const errorMessage = (err) => err?.response?.data?.message || err?.message || 'Something went wrong.';
