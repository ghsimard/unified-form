import React from 'react';

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-6">
              <img
                src="/images/rectores.jpeg"
                alt="Rectores Líderes Transformadores"
                className="h-28 w-auto object-contain"
              />
              <img
                src="/images/logoCosmo.png"
                alt="COSMO"
                className="h-28 w-auto object-contain mx-4"
              />
              <img
                src="/images/coordinadores.jpeg"
                alt="Coordinadores Líderes Transformadores"
                className="h-28 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Gracias por completar la encuesta!
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Tus respuestas son muy valiosas para nosotros y nos ayudarán a mejorar el ambiente escolar.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              La información proporcionada será tratada de manera confidencial y utilizada exclusivamente con fines de investigación y mejoramiento educativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage; 