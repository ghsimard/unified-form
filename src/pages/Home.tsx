import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2">
      <div className="w-full max-w-md sm:max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl px-4 py-8 sm:px-10 flex flex-col items-center">
          <div className="flex flex-row flex-nowrap justify-center items-center gap-2 sm:gap-8 w-full min-w-0">
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
        </div>
      </div>
    </div>
  );
};

export default Home; 