import React, { useRef } from 'react';
import { FileText, Download, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function InvoiceGenerator({ order, onInvoiceSaved }) {
  const invoiceRef = useRef(null);

  const generateInvoice = async () => {
    if (!invoiceRef.current) return;

    try {
      toast.info('Se generează factura...');
      
      // Show invoice for capture
      invoiceRef.current.style.display = 'block';
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Hide invoice after capture
      invoiceRef.current.style.display = 'none';
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      
      // Download the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${order.order_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Factura a fost generată și descărcată!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Eroare la generarea facturii');
    }
  };

  const saveInvoiceToOrder = async () => {
    if (!invoiceRef.current) return;

    try {
      toast.info('Se salvează factura...');
      
      // Show invoice for capture
      invoiceRef.current.style.display = 'block';
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Hide invoice after capture
      invoiceRef.current.style.display = 'none';
      
      // Convert to base64
      const base64Image = canvas.toDataURL('image/png');
      
      // Save to backend
      const response = await fetch(`${API_URL}/api/orders/${order.id}/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_image: base64Image })
      });
      
      if (response.ok) {
        toast.success('Factura a fost atașată comenzii!');
        if (onInvoiceSaved) onInvoiceSaved();
      } else {
        throw new Error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Eroare la salvarea facturii');
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="bg-white border-2 border-neutral-200 p-6">
        <h2 className="font-bold text-xl mb-4">FACTURĂ</h2>
        <div className="space-y-3">
          <button
            onClick={generateInvoice}
            className="w-full bg-black text-white py-3 px-4 font-bold uppercase text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Generează Factură</span>
          </button>
          <button
            onClick={saveInvoiceToOrder}
            className="w-full bg-[#CCFF00] text-black py-3 px-4 font-bold uppercase text-sm hover:bg-[#B3E600] transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Atașează Clientului</span>
          </button>
        </div>
        
        {/* Show existing invoice if available */}
        {order.invoice_image && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-sm text-green-600 font-bold mb-2">✓ Factură atașată</p>
            <a 
              href={order.invoice_image} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
            >
              <FileText className="w-4 h-4" />
              <span>Vezi factura</span>
            </a>
          </div>
        )}
      </div>

      {/* Hidden Invoice Template for Generation */}
      <div 
        ref={invoiceRef} 
        style={{ 
          display: 'none',
          position: 'absolute',
          left: '-9999px',
          width: '794px', // A4 width at 96 DPI
          padding: '40px',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div style={{ border: '2px solid #000', padding: '30px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #CCFF00', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                <span style={{ color: '#000' }}>AVO</span>
                <span style={{ color: '#9ACD32' }}>JERSEYS</span>
              </h1>
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>Tricouri de fotbal premium</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>FACTURĂ</h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>#{order.order_number}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
                {new Date(order.created_at).toLocaleDateString('ro-RO', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ width: '48%' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>FACTURARE</h3>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{order.customer_name}</p>
              <p style={{ fontSize: '13px', color: '#333', margin: '0 0 3px 0' }}>{order.customer_email}</p>
              <p style={{ fontSize: '13px', color: '#333', margin: '0 0 3px 0' }}>{order.customer_phone}</p>
            </div>
            <div style={{ width: '48%' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>LIVRARE</h3>
              <p style={{ fontSize: '13px', color: '#333', margin: 0, lineHeight: '1.5' }}>
                {order.customer_address}
              </p>
            </div>
          </div>

          {/* Products Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000' }}>PRODUS</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000' }}>MĂRIME</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000' }}>CANT.</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000' }}>PREȚ</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.product_name}</div>
                    {item.kit && (
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        Kit: {item.kit === 'first' ? 'First Kit' : item.kit === 'second' ? 'Second Kit' : 'Third Kit'}
                      </div>
                    )}
                    {item.version && (
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        Versiune: {item.version === 'player' ? 'Player' : 'Fan'}
                      </div>
                    )}
                    {item.customization && (
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {item.customization.name && `Nume: ${item.customization.name}`}
                        {item.customization.number && ` | Nr: ${item.customization.number}`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.size}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>{item.price_ron} RON</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>{item.price_ron * item.quantity} RON</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Subtotal:</span>
                <span style={{ fontSize: '13px' }}>{order.items.reduce((sum, item) => sum + (item.price_ron * item.quantity), 0)} RON</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Livrare:</span>
                <span style={{ fontSize: '13px' }}>{order.shipping_method === 'express' ? '40' : '20'} RON</span>
              </div>
              {order.coupon_discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', color: '#22c55e' }}>
                  <span style={{ fontSize: '13px' }}>Reducere ({order.coupon_code}):</span>
                  <span style={{ fontSize: '13px' }}>-{order.coupon_discount} RON</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', backgroundColor: '#CCFF00', marginTop: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', paddingLeft: '10px' }}>TOTAL:</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', paddingRight: '10px' }}>{order.total_ron} {order.currency}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#666', margin: '0 0 5px 0' }}>Mulțumim pentru comandă!</p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
              AVO JERSEYS | avojerseys@gmail.com | +40 123 456 789 | Salaj, România
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
