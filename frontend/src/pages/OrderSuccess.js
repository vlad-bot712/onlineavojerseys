import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    let attempts = 0;
    const maxAttempts = 5;
    const interval = 2000;

    const poll = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/payments/stripe/status/${sessionId}`);
        
        if (res.data.payment_status === 'paid') {
          // Get order details
          const orderRes = await axios.get(`${API_URL}/api/orders/${res.data.order_id}`);
          setOrder(orderRes.data);
          setChecking(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          setChecking(false);
          toast.error('Nu am putut verifica statusul plății. Te rugăm să verifici email-ul.');
        }
      } catch (err) {
        console.error(err);
        setChecking(false);
        toast.error('A apărut o eroare la verificarea plății');
      }
    };

    poll();
  };

  if (checking) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-xl">Se verifică plata...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-neutral-600">Nu am putut găsi comanda.</p>
          <Link to="/" className="inline-block mt-4 bg-black text-white px-6 py-3 font-bold">
            Înapoi Acasă
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="order-success-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">COMANDĂ PLASATĂ CU SUCCES!</h1>
        <p className="text-xl text-neutral-600 mb-8">
          Mulțumim pentru comandă! Vei primi un email de confirmare în scurt timp.
        </p>

        <div className="bg-white border border-neutral-200 p-8 mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Package className="w-6 h-6" />
            <h2 className="text-2xl font-bold">DETALII COMANDĂ</h2>
          </div>
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Număr Comandă:</span>
              <span className="font-bold">{order.order_number}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Status:</span>
              <span className="font-bold text-green-600">Plătită</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Total:</span>
              <span className="font-bold">{order.total_ron} {order.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Email:</span>
              <span className="font-bold">{order.customer_email}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/track-order"
            data-testid="track-order-btn"
            className="bg-black text-white px-8 py-3 font-bold uppercase hover:bg-neutral-800 transition-colors"
          >
            Urmărește Comanda
          </Link>
          <Link
            to="/products"
            className="bg-white text-black border-2 border-black px-8 py-3 font-bold uppercase hover:bg-neutral-100 transition-colors"
          >
            Continuă Cumpărăturile
          </Link>
        </div>

        <p className="mt-8 text-sm text-neutral-500">
          Numărul comenzii: <span className="font-bold">{order.order_number}</span>
          <br />
          Salvează acest număr pentru a urmări comanda ta.
        </p>
      </div>
    </div>
  );
}
