import React from 'react';

const RLT: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2">
      <div className="w-full max-w-md sm:max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl px-4 py-8 sm:px-10 flex flex-col items-center">
          {/* Logos */}
          <div className="flex flex-row flex-nowrap justify-center items-center gap-2 sm:gap-8 w-full mb-8 min-w-0">
            <img
              src="/images/rectores.jpeg"
              alt="Rectores Líderes Transformadores"
              className="flex-1 min-w-0 w-16 sm:w-24 md:w-32 max-w-[90px] sm:max-w-[120px] h-auto object-contain"
            />
            <img
              src="/images/logoCosmo.png"
              alt="COSMO"
              className="flex-1 min-w-0 w-16 sm:w-24 md:w-32 max-w-[90px] sm:max-w-[120px] h-auto object-contain"
            />
            <img
              src="/images/coordinadores.jpeg"
              alt="Coordinadores Líderes Transformadores"
              className="flex-1 min-w-0 w-16 sm:w-24 md:w-32 max-w-[90px] sm:max-w-[120px] h-auto object-contain"
            />
          </div>
          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4 break-words">
            RECTORES LÍDERES TRANSFORMADORES
          </h1>
          {/* Description */}
          <p className="text-base sm:text-lg text-gray-700 text-center mb-8">
            El programa Rectores Líderes Transformadores (RLT) busca fortalecer las capacidades de liderazgo de los rectores y directivos docentes, promoviendo la transformación educativa y el mejoramiento del ambiente escolar en las instituciones educativas.
          </p>
          {/* Form Links */}
          <div className="flex flex-col gap-4 w-full">
            <a href="/docentes" className="w-full bg-blue-500 text-white rounded-lg py-3 font-semibold text-base sm:text-lg text-center hover:bg-blue-600 transition shadow focus:outline-none focus:ring-2 focus:ring-blue-400">Cuestionario para Docentes</a>
            <a href="/estudiantes" className="w-full bg-blue-500 text-white rounded-lg py-3 font-semibold text-base sm:text-lg text-center hover:bg-blue-600 transition shadow focus:outline-none focus:ring-2 focus:ring-blue-400">Cuestionario para Estudiantes</a>
            <a href="/acudientes" className="w-full bg-blue-500 text-white rounded-lg py-3 font-semibold text-base sm:text-lg text-center hover:bg-blue-600 transition shadow focus:outline-none focus:ring-2 focus:ring-blue-400">Cuestionario para Acudientes</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RLT; 