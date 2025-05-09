import React from 'react'

interface BaseFormProps {
  title: string
  onSubmit: (data: any) => void
  children: React.ReactNode
}

export default function BaseForm({ title, onSubmit, children }: BaseFormProps) {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
                <form onSubmit={onSubmit}>
                  {children}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 