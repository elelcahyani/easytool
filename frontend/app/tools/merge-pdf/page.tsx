'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type === 'application/pdf'
      )
      if (droppedFiles.length > 0) {
        setFiles(droppedFiles)
        setError('')
      } else {
        setError('Please upload PDF files')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => 
        file.type === 'application/pdf'
      )
      if (selectedFiles.length > 0) {
        setFiles(selectedFiles)
        setError('')
      } else {
        setError('Please upload PDF files')
      }
    }
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/merge-pdf`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to merge PDFs')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${files[0].name.replace('.pdf', '')}_merged.pdf`
      a.click()
      window.URL.revokeObjectURL(url)

      setFiles([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    '<strong>Upload PDFs:</strong> Select 2 or more PDF files by clicking or dragging them into the upload area',
    '<strong>Check Order:</strong> Files will be merged in the order they appear in the list',
    '<strong>Merge & Download:</strong> Click the button to combine all PDFs into one file'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-merge-pdf" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            📑
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Merge PDF</h1>
            <p className="text-gray-600 mt-1">Combine multiple PDF files into one document</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {files.length > 0 ? `${files.length} PDF file(s) selected` : 'Drop your PDF files here or click to browse'}
              </p>
              <p className="text-sm text-gray-500">Select at least 2 PDF files • Maximum 20MB per file</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Selected files (will be merged in this order):</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                    {index + 1}. {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={files.length < 2 || loading}
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Merging PDFs...' : 'Merge PDFs & Download'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload 2 or more PDF files</li>
            <li>2. Files will be merged in the order selected</li>
            <li>3. Click "Merge PDFs & Download" to get your combined PDF</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
