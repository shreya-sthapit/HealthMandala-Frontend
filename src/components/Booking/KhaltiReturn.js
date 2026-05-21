import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// This page handles the redirect from Khalti after payment.
// Khalti appends: ?pidx=...&status=...&transaction_id=...&purchase_order_id=...
const KhaltiReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your payment...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const pidx = searchParams.get('pidx');
      const status = searchParams.get('status');
      const purchaseOrderId = searchParams.get('purchase_order_id');

      if (!pidx) {
        setError('Invalid payment return. No payment reference found.');
        return;
      }

      // If Khalti says user cancelled, go back to booking
      if (status === 'User canceled') {
        setError('Payment was cancelled. Redirecting back...');
        setTimeout(() => navigate('/book-appointment'), 2500);
        return;
      }

      try {
        // Verify with backend
        const verifyRes = await fetch('http://localhost:5001/api/khalti/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pidx }),
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.success || !verifyData.paid) {
          setError(`Payment not completed. Status: ${verifyData.status || 'Unknown'}. Redirecting back...`);
          setTimeout(() => navigate('/book-appointment'), 3000);
          return;
        }

        // Payment verified — retrieve pending appointment data from sessionStorage
        const pendingStr = sessionStorage.getItem('khaltiPendingAppointment');
        if (!pendingStr) {
          setError('Payment verified but booking data was lost. Please contact support.');
          return;
        }

        const { appointmentData, bookingState } = JSON.parse(pendingStr);

        // Save appointment
        const bookRes = await fetch('http://localhost:5001/api/appointments/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...appointmentData,
            paymentMethod: 'khalti',
            paymentStatus: 'paid',
            khaltiTransactionId: verifyData.transactionId,
            khaltiPidx: pidx,
          }),
        });
        const bookData = await bookRes.json();

        sessionStorage.removeItem('khaltiPendingAppointment');

        if (bookData.success) {
          navigate('/booking-confirmed', {
            state: {
              booking: bookingState,
              appointmentId: bookData.appointment.id,
              paymentStatus: 'paid',
              paymentMethod: 'khalti',
            },
          });
        } else {
          setError(bookData.error || 'Payment succeeded but booking failed. Please contact support.');
        }
      } catch (err) {
        console.error('Khalti return error:', err);
        setError('Something went wrong verifying your payment. Please contact support.');
      }
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
    }}>
      {error ? (
        <>
          <div style={{ fontSize: '2.5rem' }}>⚠️</div>
          <p style={{ color: '#dc2626', fontWeight: 600, textAlign: 'center', maxWidth: 400 }}>{error}</p>
        </>
      ) : (
        <>
          <div style={{
            width: 48, height: 48,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #5c2d91',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#4a5568', fontWeight: 500 }}>{message}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
};

export default KhaltiReturn;
