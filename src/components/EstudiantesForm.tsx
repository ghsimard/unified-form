import React, { useState } from 'react';
import { estudiantesFrequencyQuestions5, estudiantesFrequencyQuestions6, estudiantesFrequencyQuestions7, frequencyOptions } from '../data/questions';
import ThankYouPage from './ThankYouPage';
import { searchSchools } from '../lib/api';

type FrequencySection = 'comunicacion' | 'practicas_pedagogicas' | 'convivencia';

interface EstudiantesFormData {
  schoolName: string;
  yearsOfExperience: string;
  currentGrade: string;
  schedule: string;
  frequencyRatings: {
    [key in FrequencySection]: {
      [key: string]: string;
    };
  };
}

const EstudiantesForm = () => {
  const [formData, setFormData] = useState<EstudiantesFormData>({
    schoolName: '',
    yearsOfExperience: '',
    currentGrade: '',
    schedule: '',
    frequencyRatings: {
      comunicacion: {},
      practicas_pedagogicas: {},
      convivencia: {}
    }
  });

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFrequencyChange = (section: FrequencySection, question: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      frequencyRatings: {
        ...prev.frequencyRatings,
        [section]: {
          ...prev.frequencyRatings[section],
          [question]: value
        }
      }
    }));
  };

  const validateFrequencySection = (questions: string[], section: FrequencySection) => {
    return questions.every(question => formData.frequencyRatings[section][question] !== undefined);
  };

  const handleSchoolNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, schoolName: value }));
    
    // Always reset suggestions when input changes
    setSchoolSuggestions([]);
    setShowSuggestions(false);

    // Only fetch new suggestions if we have 3 or more characters
    if (value.length >= 3) {
      try {
        console.log('Fetching suggestions for:', value);
        const schools = await searchSchools(value);
        console.log('Received suggestions:', schools);
        if (schools.length > 0) {
          setSchoolSuggestions(schools);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching school suggestions:', error);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, schoolName: suggestion }));
    setShowSuggestions(false);
    setSchoolSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const handleSchoolNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && schoolSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = activeSuggestionIndex < schoolSuggestions.length - 1
          ? activeSuggestionIndex + 1
          : 0;
        setActiveSuggestionIndex(newIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = activeSuggestionIndex > 0
          ? activeSuggestionIndex - 1
          : schoolSuggestions.length - 1;
        setActiveSuggestionIndex(newIndex);
      } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(schoolSuggestions[activeSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Validate all frequency sections
    const isComunicacionValid = validateFrequencySection(estudiantesFrequencyQuestions5, 'comunicacion');
    const isPracticasValid = validateFrequencySection(estudiantesFrequencyQuestions6, 'practicas_pedagogicas');
    const isConvivenciaValid = validateFrequencySection(estudiantesFrequencyQuestions7, 'convivencia');

    if (!isComunicacionValid || !isPracticasValid || !isConvivenciaValid) {
      return;
    }

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'estudiantes',
          schoolName: formData.schoolName,
          yearsInSchool: formData.yearsOfExperience,
          currentGrade: formData.currentGrade,
          schedule: formData.schedule,
          comunicacion: formData.frequencyRatings.comunicacion,
          practicas_pedagogicas: formData.frequencyRatings.practicas_pedagogicas,
          convivencia: formData.frequencyRatings.convivencia
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Error submitting form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const FrequencyMatrix = ({ section, questions, title }: { section: FrequencySection; questions: string[]; title: string }) => {
    const isAnswered = (question: string) => formData.frequencyRatings[section][question] !== undefined;
    
    return (
      <div className="space-y-8 mt-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Seleccione con qué frecuencia ocurren las siguientes situaciones
          </p>
          <p className="mt-1 text-sm text-red-500">
            * Todas las preguntas son obligatorias
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="w-1/3 py-3 text-left text-sm font-medium text-gray-500"></th>
                {frequencyOptions.map((option) => (
                  <th key={option} className="px-3 py-3 text-center text-sm font-medium text-gray-500">
                    {option}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question, qIndex) => {
                const showError = hasAttemptedSubmit && !isAnswered(question);
                return (
                  <tr key={qIndex} className={qIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className={`py-4 text-sm align-top ${showError ? 'text-red-600' : 'text-gray-900'}`}>
                      {question}
                      {showError && <span className="text-red-600 ml-1">*</span>}
                    </td>
                    {frequencyOptions.map((option) => (
                      <td key={option} className="px-3 py-4 text-center">
                        <input
                          type="radio"
                          name={`frequency-${section}-${qIndex}`}
                          value={option}
                          checked={formData.frequencyRatings[section][question] === option}
                          onChange={() => handleFrequencyChange(section, question, option)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          required
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return <ThankYouPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 sm:gap-8 mb-6">
              <div className="w-20 sm:w-40">
                <img
                  src="/images/rectores.jpeg"
                  alt="Rectores Líderes Transformadores"
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="w-20 sm:w-40">
                <img
                  src="/images/logoCosmo.png"
                  alt="COSMO"
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="w-20 sm:w-40">
                <img
                  src="/images/coordinadores.jpeg"
                  alt="Coordinadores Líderes Transformadores"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ENCUESTA DE AMBIENTE ESCOLAR
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">
              CUESTIONARIO PARA ESTUDIANTES
            </h2>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <p className="text-sm text-blue-700">
              Con el propósito de brindar insumos valiosos a los directivos docentes sobre su Institución Educativa y apoyar la identificación de retos y oportunidades de mejora, el Programa Rectores Líderes Transformadores y Coordinadores Líderes Transformadores ha diseñado la "Encuesta de Ambiente Escolar", centrada en tres aspectos clave: la comunicación, la convivencia y las prácticas pedagógicas.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Las respuestas de los participantes son fundamentales para generar información que permita a rectores y coordinadores fortalecer su gestión institucional y avanzar en procesos de transformación, sustentados en la toma de decisiones basada en datos.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              La información recolectada será tratada de manera confidencial y utilizada exclusivamente con fines estadísticos y de mejoramiento continuo.
            </p>
            <p className="text-sm font-semibold text-blue-700 mt-2">
              Te invitamos a responder con sinceridad y a completar todas las preguntas de la encuesta. ¡Gracias!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* School Name */}
            <div className="space-y-6">
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                  Nombre de la Institución Educativa
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleSchoolNameChange}
                    onKeyDown={handleSchoolNameKeyDown}
                    placeholder="Escriba el nombre de la institución..."
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-2 border-gray-400 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 hover:bg-white focus:bg-white transition-colors"
                    required
                  />
                  {showSuggestions && schoolSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {schoolSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          id={`suggestion-${index}`}
                          className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                            index === activeSuggestionIndex ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Years of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                2. ¿Cuántos años llevas estudiando en el colegio? <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {['Menos de 1', '1', '2', '3', '4', '5', 'Más de 5'].map((year) => (
                  <div key={year} className="flex items-center">
                    <input
                      type="radio"
                      id={`year-${year}`}
                      name="yearsOfExperience"
                      value={year}
                      required
                      checked={formData.yearsOfExperience === year}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`year-${year}`} className="ml-3 block text-sm text-gray-700">
                      {year}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                3. ¿En qué grado estás actualmente? <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {['5°', '8°', '9°', '10°', '11°'].map((grade) => (
                  <div key={grade} className="flex items-center">
                    <input
                      type="radio"
                      id={`grade-${grade}`}
                      name="currentGrade"
                      value={grade}
                      required
                      checked={formData.currentGrade === grade}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`grade-${grade}`} className="ml-3 block text-sm text-gray-700">
                      {grade}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                4. ¿En qué jornada tienes clases? <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {['Mañana', 'Tarde', 'Noche', 'Única'].map((schedule) => (
                  <div key={schedule} className="flex items-center">
                    <input
                      type="radio"
                      id={`schedule-${schedule}`}
                      name="schedule"
                      value={schedule}
                      required
                      checked={formData.schedule === schedule}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`schedule-${schedule}`} className="ml-3 block text-sm text-gray-700">
                      {schedule}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency Matrix for COMUNICACIÓN */}
            <FrequencyMatrix 
              section="comunicacion" 
              questions={estudiantesFrequencyQuestions5} 
              title="5. COMUNICACIÓN"
            />

            {/* Frequency Matrix for PRÁCTICAS PEDAGÓGICAS */}
            <FrequencyMatrix 
              section="practicas_pedagogicas" 
              questions={estudiantesFrequencyQuestions6} 
              title="6. PRÁCTICAS PEDAGÓGICAS"
            />

            {/* Frequency Matrix for CONVIVENCIA */}
            <FrequencyMatrix 
              section="convivencia" 
              questions={estudiantesFrequencyQuestions7} 
              title="7. CONVIVENCIA"
            />

            {/* Submit Button */}
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Enviar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EstudiantesForm; 