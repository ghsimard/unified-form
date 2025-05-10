import React, { useState } from 'react';
import { docentesFrequencyQuestions7, docentesFrequencyQuestions8, docentesFrequencyQuestions9, frequencyOptions } from '../data/questions';
import ThankYouPage from './ThankYouPage';
import { searchSchools } from '../lib/api';

type FrequencySection = 'comunicacion' | 'practicas_pedagogicas' | 'convivencia';

interface DocentesFormData {
  schoolName: string;
  yearsOfExperience: string;
  teachingGradesEarly: string[];
  teachingGradesLate: string[];
  schedule: string[];
  feedbackSources: string[];
  frequencyRatings: {
    [key in FrequencySection]: {
      [key: string]: string;
    };
  };
}

const DocentesForm = () => {
  const [formData, setFormData] = useState<DocentesFormData>({
    schoolName: '',
    yearsOfExperience: '',
    teachingGradesEarly: [],
    teachingGradesLate: [],
    schedule: [],
    feedbackSources: [],
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, section: 'teachingGradesEarly' | 'teachingGradesLate' | 'schedule' | 'feedbackSources') => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: checked 
        ? [...prev[section], value]
        : prev[section].filter(item => item !== value)
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
    const isComunicacionValid = validateFrequencySection(docentesFrequencyQuestions7, 'comunicacion');
    const isPracticasValid = validateFrequencySection(docentesFrequencyQuestions8, 'practicas_pedagogicas');
    const isConvivenciaValid = validateFrequencySection(docentesFrequencyQuestions9, 'convivencia');

    if (!isComunicacionValid || !isPracticasValid || !isConvivenciaValid) {
      return;
    }

    const formPayload = {
      formType: 'docentes',
      schoolName: formData.schoolName,
      yearsOfExperience: formData.yearsOfExperience,
      teachingGradesEarly: formData.teachingGradesEarly,
      teachingGradesLate: formData.teachingGradesLate,
      schedule: formData.schedule,
      feedbackSources: formData.feedbackSources,
      comunicacion: formData.frequencyRatings.comunicacion,
      practicas_pedagogicas: formData.frequencyRatings.practicas_pedagogicas,
      convivencia: formData.frequencyRatings.convivencia
    };

    console.log('Submitting form with payload:', formPayload);

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Form submission successful:', result);
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error('Error submitting form:', errorData);
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
        const schools = await searchSchools(value);
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
              CUESTIONARIO PARA DOCENTES
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

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                2. Incluyendo este año escolar, ¿cuántos años se ha desempeñado como docente en este colegio? <span className="text-red-600">*</span>
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

            {/* Teaching Grades */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                3. ¿En qué grados tiene asignación de actividades de docencia en este colegio? (múltiple respuesta) <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {[
                  'Primera infancia', 'Preescolar', 
                  '1°', '2°', '3°', '4°', '5°',
                  '6°', '7°', '8°', '9°', '10°', '11°', '12°'
                ].map((grade) => (
                  <div key={grade} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`grade-${grade}`}
                      value={grade}
                      checked={formData.teachingGradesEarly.includes(grade) || formData.teachingGradesLate.includes(grade)}
                      onChange={(e) => {
                        const isEarlyGrade = ['Primera infancia', 'Preescolar', '1°', '2°', '3°', '4°', '5°'].includes(grade);
                        handleCheckboxChange(e, isEarlyGrade ? 'teachingGradesEarly' : 'teachingGradesLate');
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                4. ¿En qué jornada desarrolla sus clases? (múltiple respuesta) <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {['Mañana', 'Tarde', 'Noche', 'Única'].map((schedule) => (
                  <div key={schedule} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`schedule-${schedule}`}
                      value={schedule}
                      checked={formData.schedule.includes(schedule)}
                      onChange={(e) => handleCheckboxChange(e, 'schedule')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`schedule-${schedule}`} className="ml-3 block text-sm text-gray-700">
                      {schedule}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                5. ¿De qué fuentes de retroalimentación recibe información sobre su desempeño docente? (múltiple respuesta) <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {[
                  'Rector/a',
                  'Coordinator/a',
                  'Otros/a docentes',
                  'Acudientes',
                  'Estudiantes',
                  'Otros',
                  'Ninguno'
                ].map((source) => (
                  <div key={source} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`source-${source}`}
                      value={source}
                      checked={formData.feedbackSources.includes(source)}
                      onChange={(e) => handleCheckboxChange(e, 'feedbackSources')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`source-${source}`} className="ml-3 block text-sm text-gray-700">
                      {source}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency Matrix for COMUNICACIÓN */}
            <FrequencyMatrix 
              section="comunicacion" 
              questions={docentesFrequencyQuestions7} 
              title="6. COMUNICACIÓN"
            />

            {/* Frequency Matrix for PRÁCTICAS PEDAGÓGICAS */}
            <FrequencyMatrix 
              section="practicas_pedagogicas" 
              questions={docentesFrequencyQuestions8} 
              title="7. PRÁCTICAS PEDAGÓGICAS"
            />

            {/* Frequency Matrix for CONVIVENCIA */}
            <FrequencyMatrix 
              section="convivencia" 
              questions={docentesFrequencyQuestions9} 
              title="8. CONVIVENCIA"
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

export default DocentesForm; 