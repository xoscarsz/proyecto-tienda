import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export const PanelAdmin = ({ usuario, alCerrarSesion }) => {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mostrarModalAlta, setMostrarModalAlta] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    marca: '',
    descripcion: '',
    precio: '',
    stock: '100',
    imagen: ''
  });

  const cargarDatos = () => {
    setLoading(true);
    Promise.all([
      fetch('https://proyecto-tienda-8umt.onrender.com/index.php?action=obtener_ventas').then(res => res.json()),
      fetch('https://proyecto-tienda-8umt.onrender.com/index.php?action=obtener_productos').then(res => res.json())
    ])
      .then(([dataVentas, dataProductos]) => {
        if (Array.isArray(dataVentas)) setVentas(dataVentas);
        if (Array.isArray(dataProductos)) setProductos(dataProductos);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar datos de administracion:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarAltaProducto = (e) => {
    e.preventDefault();

    fetch('https://proyecto-tienda-8umt.onrender.com/index.php?action=crear_producto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProducto)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        Swal.fire({
          title: '¡Éxito total!',
          text: 'El dispositivo se insertó en el clúster de Aiven.',
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc',
          confirmButtonColor: '#4f46e5',
          confirmButtonText: 'Entendido',
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
          }
        });

        setMostrarModalAlta(false);
        setNuevoProducto({ nombre: '', marca: '', descripcion: '', precio: '', stock: '100', imagen: '' });
        cargarDatos(); 
      } else {
        Swal.fire({
          title: 'Error del Servidor',
          text: data.message,
          icon: 'error',
          background: '#0f172a',
          color: '#f8fafc',
          confirmButtonColor: '#ef4444'
        });
      }
    })
    .catch(err => {
      console.error('Error en el fetch de alta:', err);
      Swal.fire({
        title: 'Error de Red',
        text: 'No se pudo conectar con el servidor de Render.',
        icon: 'warning',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#f59e0b'
      });
    });
  };

  const totalVentasNumero = ventas.length;
  const dineroTotalRecaudado = ventas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const totalDispositivosStock = productos.reduce((sum, prod) => sum + Number(prod.stock), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-indigo-500 border-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
            PANEL DE ADMINISTRACIÓN
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Sesión activa: <span className="text-slate-200">{usuario?.nombre || 'Administrador'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMostrarModalAlta(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 shadow-lg shadow-indigo-600/10"
          >
            📦 Añadir Producto
          </button>
          <button 
            onClick={alCerrarSesion}
            className="bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Totales</p>
              <h3 className="text-4xl font-black text-indigo-400 mt-2 tracking-tight">
                {totalVentasNumero}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Órdenes procesadas en tienda</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-xl text-indigo-400">
              📦
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Brutos</p>
              <h3 className="text-4xl font-black text-emerald-400 mt-2 tracking-tight">
                ${dineroTotalRecaudado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Caja total acumulada MXN</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-xl text-emerald-400">
              💵
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventario Total</p>
              <h3 className="text-4xl font-black text-amber-400 mt-2 tracking-tight">
                {totalDispositivosStock} <span className="text-sm font-normal text-slate-500">piezas</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Dispositivos disponibles</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-xl text-amber-400">
              📱
            </div>
          </div>

        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/20">
            <h2 className="text-md font-bold text-slate-200">Historial Reciente de Transacciones</h2>
          </div>
          
          <div className="overflow-x-auto">
            {ventas.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No se han registrado ventas en el sistema todavía.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">ID Venta</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Dispositivo</th>
                    <th className="px-6 py-4 text-center">Cantidad</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                    <th className="px-6 py-4 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">#{venta.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-200">{venta.cliente}</td>
                      <td className="px-6 py-4 text-indigo-400 font-medium">{venta.dispositivo}</td>
                      <td className="px-6 py-4 text-center text-slate-400">{venta.cantidad}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">
                        ${Number(venta.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500">{venta.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {mostrarModalAlta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl relative">
            <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-100 tracking-wide">Nuevo Dispositivo</h3>
                <p className="text-[11px] text-indigo-400 font-medium mt-0.5">Almacenamiento directo en Clúster de Aiven</p>
              </div>
              <button 
                onClick={() => setMostrarModalAlta(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-950 p-2 rounded-xl border border-slate-800 transition-colors"
              >
                ✕ Cerrar
              </button>
            </header>

            <form onSubmit={manejarAltaProducto} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre Comercial</label>
                  <input required type="text" placeholder="Ej. iPhone 16 Pro Max" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Marca / Fabricante</label>
                  <input required type="text" placeholder="Ej. Apple" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" value={nuevoProducto.marca} onChange={e => setNuevoProducto({...nuevoProducto, marca: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descripción Técnica</label>
                <textarea required rows="2" placeholder="Características del dispositivo..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Precio Base (MXN)</label>
                  <input required type="number" step="0.01" placeholder="25999" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Unidades Stock</label>
                  <input required type="number" placeholder="100" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">URL de Imagen del Catálogo</label>
                <input type="url" placeholder="https://images.unsplash.com/..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" value={nuevoProducto.imagen} onChange={e => setNuevoProducto({...nuevoProducto, imagen: e.target.value})} />
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs tracking-widest py-3.5 rounded-xl transition-all duration-300"
              >
                SUBIR REGISTRO NUEVO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};