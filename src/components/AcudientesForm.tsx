import React, { useState } from 'react';
import { acudientesFrequencyQuestions5, acudientesFrequencyQuestions6, acudientesFrequencyQuestions7, frequencyOptions } from '../data/questions';
import ThankYouPage from './ThankYouPage';

type FrequencySection = 'comunicacion' | 'practicas_pedagogicas' | 'convivencia';

interface AcudientesFormData {
  schoolName: string;
  studentGrades: string[];
  frequencyRatings: {
    [key in FrequencySection]: {
      [key: string]: string;
    };
  };
}

const AcudientesForm = () => {
  const [formData, setFormData] = useState<AcudientesFormData>({
    schoolName: '',
    studentGrades: [],
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      studentGrades: checked 
        ? [...prev.studentGrades, value]
        : prev.studentGrades.filter(item => item !== value)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Validate all frequency sections
    const isComunicacionValid = validateFrequencySection(acudientesFrequencyQuestions5, 'comunicacion');
    const isPracticasValid = validateFrequencySection(acudientesFrequencyQuestions6, 'practicas_pedagogicas');
    const isConvivenciaValid = validateFrequencySection(acudientesFrequencyQuestions7, 'convivencia');

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
          formType: 'acudientes',
          schoolName: formData.schoolName,
          studentGrades: formData.studentGrades,
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

  const handleSchoolNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, schoolName: value }));
    
    // Always reset suggestions when input changes
    setSchoolSuggestions([]);
    setShowSuggestions(false);

    // Only fetch new suggestions if we have 3 or more characters
    if (value.length >= 3) {
      try {
        const response = await fetch(`/api/schools?search=${encodeURIComponent(value)}`);
        if (response.ok) {
          const suggestions = await response.json();
          if (suggestions.length > 0) {
            setSchoolSuggestions(suggestions);
            setShowSuggestions(true);
          }
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
              CUESTIONARIO PARA ACUDIENTES
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
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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

            {/* Student Grades */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                2. ¿Qué grado se encuentra cursando el o los estudiantes que usted representa? (puede marcar más de una casilla) <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {[
                  'Primera infancia',
                  'Preescolar',
                  '1°',
                  '2°',
                  '3°',
                  '4°',
                  '5°',
                  '6°',
                  '7°',
                  '8°',
                  '9°',
                  '10°',
                  '11°',
                  '12°'
                ].map((grade) => (
                  <div key={grade} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`grade-${grade}`}
                      value={grade}
                      checked={formData.studentGrades.includes(grade)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`grade-${grade}`} className="ml-2 text-sm text-gray-700">
                      {grade}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency Sections */}
            <FrequencyMatrix section="comunicacion" questions={acudientesFrequencyQuestions5} title="Comunicación" />
            <FrequencyMatrix section="practicas_pedagogicas" questions={acudientesFrequencyQuestions6} title="Prácticas Pedagógicas" />
            <FrequencyMatrix section="convivencia" questions={acudientesFrequencyQuestions7} title="Convivencia" />

            <div className="mt-8">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcudientesForm;