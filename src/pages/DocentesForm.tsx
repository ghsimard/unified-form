import React from 'react'
import BaseForm from '../components/BaseForm'

export default function DocentesForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
  }

  return (
    <BaseForm title="Formulario Docentes" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* TODO: Add form fields */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Enviar
        </button>
      </div>
    </BaseForm>
  )
} 