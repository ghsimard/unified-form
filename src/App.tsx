import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RLT from './pages/RLT';
import DocentesForm from './components/DocentesForm';
import EstudiantesForm from './components/EstudiantesForm';
import AcudientesForm from './components/AcudientesForm';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/RLT" element={<RLT />} />
          <Route path="/docentes" element={<DocentesForm />} />
          <Route path="/estudiantes" element={<EstudiantesForm />} />
          <Route path="/acudientes" element={<AcudientesForm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 