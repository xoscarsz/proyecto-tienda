import React, { useState, useEffect } from 'react';
import { BotonPayPal, BotonMercadoPago } from '../components/PasarelasReales';

export const Catalogo = () => {
  const [telefonos, setTelefonos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState('stripe'); 
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', nombre: '', exp: '', cvc: '' });
  const [estadoTransaccion, setEstadoTransaccion] = useState(null); 
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    const dataUsuario = localStorage.getItem('usuario');
    if (dataUsuario) setUsuario(JSON.parse(dataUsuario));

  
    fetch('https://proyecto-tienda-8umt.onrender.com/index.php?action=obtener_productos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTelefonos(data);
        } else {
          console.error('La API de PHP no devolvió un array válido:', data);
          setTelefonos([]);
        }
      })
      .catch((err) => {
        console.error('Error al conectar con la API de PHP:', err);
        setTelefonos([]);
      });
  }, []);

  const agregarAlCarrito = (telefono) => {
    const cantidadEnCarrito = carrito.filter((item) => item.id === telefono.id).length;

    if (cantidadEnCarrito >= telefono.stock) {
      alert(`¡Disculpas! Solo quedan ${telefono.stock} unidades disponibles de este dispositivo.`);
      return;
    }

    setCarrito([...carrito, { ...telefono, cantidad: 1, idCarrito: Date.now() }]);
  };

  const eliminarDelCarrito = (idCarrito) => {
    setCarrito(carrito.filter((item) => item.idCarrito !== idCarrito));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  const llenarTarjetaPrueba = (numero) => {
    setDatosTarjeta({
      numero: numero,
      nombre: usuario?.nombre || 'Oscar Ramirez',
      exp: '12/29',
      cvc: '123'
    });
  };

  const despacharVentaEnServidor = () => {

    fetch('https://proyecto-tienda-8umt.onrender.com/index.php?action=registrar_venta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuario?.id || 2, 
        total: total,
        carrito: carrito
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        setEstadoTransaccion('exito');
      } else {
        setEstadoTransaccion('error');
        setMensajeError(data.message || 'Error interno al procesar el inventario.');
      }
    })
    .catch(err => {
      console.error('Error al impactar base de datos:', err);
      setEstadoTransaccion('error');
      setMensajeError('La pasarela autorizó el cobro, pero tu servidor de Render no guardó la venta.');
    });
  };

  const finalizarPago = (e) => {
    if (e) e.preventDefault();
    setEstadoTransaccion('procesando');
    
    setTimeout(() => {
      if (metodoPago === 'stripe') {
        if (datosTarjeta.numero.replace(/\s/g, '') === '4242424242424242') {
          despacharVentaEnServidor(); 
        } else if (datosTarjeta.numero.replace(/\s/g, '') === '4000000000000022') {
          setEstadoTransaccion('error');
          setMensajeError('Tarjeta declinada: Fondos Insuficientes (Error simulado de Stripe).');
        } else {
          despacharVentaEnServidor();
        }
      } else {
        despacharVentaEnServidor();
      }
    }, 2000);
  };

  const limpiarYFechar = () => {
    setCarrito([]);
    setMostrarModalPago(false);
    setEstadoTransaccion(null);
    setDatosTarjeta({ numero: '', nombre: '', exp: '', cvc: '' });
    window.location.reload(); 
  };

  const total = carrito.reduce((sum, item) => sum + Number(item.precio), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 px-8 py-5 flex justify-between items-center">
        <div className="relative group">
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-widest">
            OSCAR PHONES
          </h1>
          {usuario && (
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium tracking-wide flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Comprando como: <span className="text-slate-200">{usuario.nombre}</span>
            </p>
          )}
        </div>
        <button 
          onClick={cerrarSesion}
          className="bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300"
        >
          Cerrar Sesión
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {telefonos.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
              <p className="text-sm text-amber-400 font-medium">⚠️ No se cargaron productos.</p>
              <p className="text-xs text-slate-500 mt-1">Verifica la consola de Render para asegurar que el backend esté respondiendo y que las variables de entorno de Aiven estén bien configuradas.</p>
            </div>
          ) : (
            telefonos.map((tel) => (
              <div 
                key={tel.id} 
                className="group bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:border-indigo-500/40"
              >
                <div className="overflow-hidden relative aspect-[16/11] bg-slate-950 p-6 flex items-center justify-center">
                  <img 
                    src={tel.imagen} 
                    alt={tel.nombre} 
                    className="h-full object-contain opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" 
                  />
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/10">
                        {tel.marca}
                      </span>
                      <span className={`text-[11px] font-bold ${Number(tel.stock) === 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {Number(tel.stock) === 0 ? '⚠️ Agotado' : `${tel.stock} disponibles`}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mt-3 text-slate-100 group-hover:text-indigo-400 transition-colors duration-300 truncate">
                      {tel.nombre}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed font-light">
                      {tel.descripcion}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/40">
                    <span className="text-xl font-black text-emerald-400">
                      ${Number(tel.precio).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <button 
                      disabled={Number(tel.stock) === 0}
                      onClick={() => agregarAlCarrito(tel)}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 shadow-md shadow-indigo-600/20"
                    >
                      {Number(tel.stock) === 0 ? 'Sin Stock' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl h-fit sticky top-28">
          <h2 className="text-md font-bold border-b border-slate-800/60 pb-4 flex justify-between items-center">
            <span className="tracking-wide text-slate-200">Tu Pedido</span>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-[11px] font-bold px-3 py-1 rounded-full shadow-md shadow-indigo-500/20">
              {carrito.length} ítems
            </span>
          </h2>

          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-2xl opacity-40 mb-2">🛒</span>
              <p className="text-slate-500 text-xs font-light">Agrega dispositivos a tu carrito.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {carrito.map((item) => (
                <div 
                  key={item.idCarrito} 
                  className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/50 transition-all duration-300"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.nombre}</h4>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      ${Number(item.precio).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button 
                    onClick={() => eliminarDelCarrito(item.idCarrito)}
                    className="text-slate-500 hover:text-red-400 text-[11px] font-bold tracking-wide transition-colors duration-200 px-2 py-1"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-800/60 mt-6 pt-4">
            <div className="flex justify-between items-end mb-5">
              <span className="text-xs text-slate-400 font-medium">Subtotal Neto:</span>
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button 
              disabled={carrito.length === 0}
              onClick={() => { setEstadoTransaccion(null); setMostrarModalPago(true); }}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold text-xs tracking-widest py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98]"
            >
              PROCEDER AL PAGO
            </button>
          </div>
        </div>
      </div>

      {mostrarModalPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-500">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800/80 rounded-3xl p-7 shadow-2xl relative">
            
            {estadoTransaccion === 'procesando' && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-t-indigo-500 border-slate-800 rounded-full animate-spin mb-4"></div>
                <h4 className="text-md font-bold tracking-wide text-slate-200">Procesando con la API de {metodoPago.toUpperCase()}</h4>
                <p className="text-xs text-slate-400 mt-2 font-light max-w-xs">Validando transacciones seguras con los servidores Sandbox de las plataformas integradas...</p>
              </div>
            )}

            {estadoTransaccion === 'exito' && (
              <div className="absolute inset-0 bg-slate-900 z-50 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center rounded-full text-2xl mb-4 shadow-xl">✓</div>
                <h4 className="text-lg font-black tracking-wide text-emerald-400">¡PAGO AUTORIZADO!</h4>
                <p className="text-xs text-slate-300 mt-3 font-light max-w-xs leading-relaxed">
                  {metodoPago === 'stripe' && `[Stripe API Beta] Cargo de $${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} exitoso. Venta guardada y stock descontado.`}
                  {metodoPago === 'paypal' && `[PayPal Sandbox] Orden de compra de $${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M.N. guardada síncronamente.`}
                  {metodoPago === 'mercadopago' && `[Mercado Pago Bricks] Registro completado en base de datos.`}
                </p>
                <button onClick={limpiarYFechar} className="mt-6 bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200">
                  ENTENDIDO
                </button>
              </div>
            )}

            {estadoTransaccion === 'error' && (
              <div className="absolute inset-0 bg-slate-900 z-50 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center rounded-full text-2xl mb-4">✕</div>
                <h4 className="text-md font-black tracking-wide text-red-400">TRANSACCIÓN RECHAZADA</h4>
                <p className="text-xs text-slate-400 mt-2 font-medium bg-red-500/5 border border-red-500/10 p-3 rounded-xl max-w-xs">{mensajeError}</p>
                <button onClick={() => setEstadoTransaccion(null)} className="mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200">
                  REINTENTAR
                </button>
              </div>
            )}

            <header className="flex justify-between items-center border-b border-slate-800/60 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-100 tracking-wide">Pasarela de Pagos (Sandbox)</h3>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">Entorno de testing seguro para simulación de transacciones.</p>
              </div>
              <button 
                onClick={() => setMostrarModalPago(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-950 p-2 rounded-xl border border-slate-800/50 transition-colors duration-200"
              >
                ✕ Cerrar
              </button>
            </header>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setMetodoPago('stripe')}
                className={`py-3.5 rounded-2xl text-xs font-bold border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${metodoPago === 'stripe' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 scale-[1.02]' : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
              >
                <span className="text-sm">💳</span> Stripe
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('paypal')}
                className={`py-3.5 rounded-2xl text-xs font-bold border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${metodoPago === 'paypal' ? 'bg-amber-600/10 border-amber-500 text-amber-400 scale-[1.02]' : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
              >
                <span className="text-sm">🟡</span> PayPal
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('mercadopago')}
                className={`py-3.5 rounded-2xl text-xs font-bold border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${metodoPago === 'mercadopago' ? 'bg-sky-600/10 border-sky-500 text-sky-400 scale-[1.02]' : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
              >
                <span className="text-sm">🔵</span> M. Pago
              </button>
            </div>

            <form onSubmit={finalizarPago} className="space-y-4">
              {metodoPago === 'stripe' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/80 border border-indigo-500/10 p-3.5 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tarjetas Ficticias oficiales de Stripe:</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => llenarTarjetaPrueba('4242 4242 4242 4242')} className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all">
                        🟢 Tarjeta Éxito
                      </button>
                      <button type="button" onClick={() => llenarTarjetaPrueba('4000 0000 0000 0022')} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all">
                        🔴 Tarjeta Rechazo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Número de Tarjeta</label>
                    <input required type="text" placeholder="4242 4242 4242 4242" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" value={datosTarjeta.numero} onChange={e => setDatosTarjeta({...datosTarjeta, numero: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Titular</label>
                    <input required type="text" placeholder="Oscar Ramirez" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" value={datosTarjeta.nombre} onChange={e => setDatosTarjeta({...datosTarjeta, nombre: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vencimiento</label>
                      <input required type="text" placeholder="12/29" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" value={datosTarjeta.exp} onChange={e => setDatosTarjeta({...datosTarjeta, exp: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CVC / CCV</label>
                      <input required type="text" placeholder="123" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" value={datosTarjeta.cvc} onChange={e => setDatosTarjeta({...datosTarjeta, cvc: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {metodoPago === 'paypal' && (
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 text-center space-y-3">
                  <p className="text-sm text-slate-200 font-medium">Entorno PayPal Sandbox Activo</p>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">Las ventanas emergentes son controladas por el script de PayPal externo:</p>
                  <div className="text-[11px] text-left bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1 font-mono text-slate-300">
                    <div><span className="text-amber-400">Usuario Test:</span> sb-niabz51550055@personal.example.com</div>
                    <div><span className="text-amber-400">Pass Test:</span> r.V=5wX#</div>
                  </div>
                  <div className="pt-3">
                    <BotonPayPal total={total} onPagoExitoso={() => finalizarPago(null)} />
                  </div>
                </div>
              )}

              {metodoPago === 'mercadopago' && (
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 text-center space-y-3">
                  <p className="text-sm text-slate-200 font-medium">Wallet Brick de Mercado Pago</p>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">El botón negro ejecuta la suite interactiva de Mercado Libre en ambiente controlado:</p>
                  <div className="text-[11px] text-left bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1 font-mono text-slate-300">
                    <div><span className="text-sky-400">Visa de pruebas:</span> 4000 1234 5678 9010</div>
                    <div><span className="text-sky-400">Mastercard de pruebas:</span> 5031 7500 0000 0015</div>
                  </div>
                  <div className="pt-3">
                    <BotonMercadoPago total={total} onPagoExitoso={() => finalizarPago(null)} />
                  </div>
                </div>
              )}

              {metodoPago === 'stripe' && (
                <div className="border-t border-slate-800/60 pt-4 mt-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total del Pedido</p>
                    <p className="text-xl font-black text-emerald-400 tracking-tight">
                      ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl font-black text-xs tracking-wider shadow-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10"
                  >
                    EJECUTAR PRUEBA STRIPE
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};