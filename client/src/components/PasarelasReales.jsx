import React, { useEffect, useRef, useState } from 'react';

export const BotonPayPal = ({ total, onPagoExitoso }) => {
  const paypalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const inicializarPayPal = () => {
      if (!paypalRef.current || !window.paypal) return;
      paypalRef.current.innerHTML = "";

      try {
        window.paypal.Buttons({
          style: { 
            layout: 'vertical', 
            color: 'gold', 
            shape: 'rect', 
            label: 'paypal' 
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                description: "Compra de Dispositivos - Oscar Phones",
                amount: { 
                  currency_code: "MXN", 
                  value: total.toString() 
                }
              }]
            });
          },
          onApprove: async (data, actions) => {
            await actions.order.capture();
            if (isMounted) onPagoExitoso();
          },
          onError: (err) => {
            console.error("Error en flujo de PayPal Sandbox:", err);
          }
        }).render(paypalRef.current);
      } catch (error) {
        console.error("Error al renderizar los botones de PayPal:", error);
      }
    };

    const timer = setTimeout(() => {
      inicializarPayPal();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [total]);

  return (
    <div className="w-full flex justify-center py-2">
      <div 
        id="paypal-button-container-sandbox" 
        ref={paypalRef} 
        className="w-full max-w-[350px] min-h-[150px]"
      ></div>
    </div>
  );
};


export const BotonMercadoPago = ({ total, onPagoExitoso }) => {
  const [cargando, setCargando] = useState(false);

  const manejarSimulacion = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      onPagoExitoso();
    }, 1500);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={manejarSimulacion}
        disabled={cargando}
        className="w-full bg-[#009ee3] hover:bg-[#008ad6] text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
      >
        {cargando ? (
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>Pagar con Mercado Pago</span>
            <span className="text-[10px] bg-black/20 text-white px-1.5 py-0.5 rounded font-mono font-bold">SANDBOX</span>
          </>
        )}
      </button>
    </div>
  );
};