import React, { useState } from 'react';

export const Registro = ({ AlIrALogin }) => {
  const [formData, setFormData] = useState({ nombre: '', correo: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre || !formData.correo || !formData.password) {
      setError('Por favor, llena todos los campos.');
      return;
    }

  
    const url = 'https://proyecto-tienda-8umt.onrender.com/index.php?action=registro';


    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setSuccess('¡Registro exitoso! Redirigiendo al Login...');
          setFormData({ nombre: '', correo: '', password: '' });
          setTimeout(() => {
            AlIrALogin();
          }, 2000);
        } else {
          throw new Error(data.message || 'Error al registrar usuario.');
        }
      })
      .catch((err) => {
        setError(err.message === 'Failed to fetch' ? 'No se pudo conectar con el servidor en Render.' : err.message);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <header className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Crea tu Cuenta</h2>
          <p className="text-slate-400 text-sm mt-2">Regístrate para empezar a comprar dispositivos</p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-xl mb-4 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

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
            Registrarse
          </button>
        </form>

        <footer className="mt-8 text-center text-sm text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={AlIrALogin} className="text-indigo-400 hover:underline font-medium focus:outline-none">
            Inicia sesión aquí
          </button>
        </footer>
      </div>
    </div>
  );
};