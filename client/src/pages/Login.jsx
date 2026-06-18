import React, { useState } from 'react';

export const Login = ({ onLoginSuccess, AlIrARegistro }) => {
  const [formData, setFormData] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.correo || !formData.password) {
      setError('Por favor, llena todos los campos.');
      return;
    }

 
    const url = 'https://proyecto-tienda-8umt.onrender.com/index.php?action=login';

  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo: formData.correo,
        password: formData.password
      })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Error al iniciar sesión');
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('Respuesta del servidor PHP:', data);
        
        if (data && data.status === "success" && data.usuario) {
          setNombreUsuario(data.usuario.nombre);
          setShowToast(true);
          
          setTimeout(() => {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            if (typeof onLoginSuccess === 'function') {
              onLoginSuccess(data.usuario);
            } else {
              window.location.reload();
            }
          }, 2500);
          
        } else {
          throw new Error(data.error || 'Credenciales incorrectas o usuario no encontrado.');
        }
      })
      .catch((err) => {
        setError(err.message === 'Failed to fetch' ? 'No se pudo conectar con el servidor en Render.' : err.message);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl z-10">
        <header className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Bienvenido</h2>
          <p className="text-slate-400 text-sm mt-2">Ingresa a tu cuenta para comprar</p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/10 active:scale-[0.99]"
          >
            Iniciar Sesión
          </button>
        </form>

        <footer className="mt-8 text-center text-sm text-slate-500">
          ¿No tienes una cuenta?{' '}
          <button 
            type="button"
            onClick={AlIrARegistro}
            className="text-indigo-400 hover:underline font-medium focus:outline-none bg-transparent border-none p-0 inline align-baseline"
          >
            Regístrate aquí
          </button>
        </footer>
      </div>

      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-500 ${
          showToast ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`flex flex-col items-center justify-center w-full max-w-md p-8 rounded-3xl shadow-2xl bg-slate-900 border border-emerald-500/30 text-slate-200 transition-all duration-500 transform ${
            showToast ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
          }`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 text-3xl text-emerald-400 bg-emerald-500/10 rounded-2xl animate-bounce mb-5">
            ✓
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-emerald-400 tracking-wide">
              Acceso Autorizado
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Bienvenido, {nombreUsuario}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};