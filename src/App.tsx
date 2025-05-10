import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import RLT from './pages/RLT';
import DocentesForm from './components/DocentesForm';
import EstudiantesForm from './components/EstudiantesForm';
import AcudientesForm from './components/AcudientesForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/RLT',
    element: <RLT />,
  },
  {
    path: '/docentes',
    element: <DocentesForm />,
  },
  {
    path: '/estudiantes',
    element: <EstudiantesForm />,
  },
  {
    path: '/acudientes',
    element: <AcudientesForm />,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App; 