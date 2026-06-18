import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Catalogo } from './pages/Catalogo';
import { PanelAdmin } from './pages/PanelAdmin';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('login'); 

  
  useEffect(() => {
    const dataUsuario = localStorage.getItem('usuario');
    if (dataUsuario) {
      setUsuario(JSON.parse(dataUsuario));
    }
  }, []);

  const manejarLoginExitoso = (datosUsuario) => {
    setUsuario(datosUsuario);
  };
  const manejarCerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    setVista('login');
  };

  if (usuario) {
    if (usuario.rol === 'admin') {
      return <PanelAdmin usuario={usuario} alCerrarSesion={manejarCerrarSesion} />;
    }
    return <Catalogo usuario={usuario} alCerrarSesion={manejarCerrarSesion} />;
  }


  return (
    <>
      {vista === 'login' ? (
        <Login 
          onLoginSuccess={manejarLoginExitoso} 
          AlIrARegistro={() => setVista('registro')} 
        />
      ) : (
        <Registro 
          AlIrALogin={() => setVista('login')} 
        />
      )}
    </>
  );
}

export default App;