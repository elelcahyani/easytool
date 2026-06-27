'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PdfUnlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
        setError('')
      } else {
        setError('Please upload a PDF file')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please upload a PDF file')
      }
    }
  }

  const handleUnlock = async () => {
    if (!file || !password) {
      setError('Please select a file and enter password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('password', password)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf-unlock`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to unlock PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setFile(null)
      setPassword('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-pdf-unlock" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            🔓
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Unlock PDF</h1>
            <p className="text-gray-600 mt-1">Remove password protection from your PDF files</p>
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
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {file ? file.name : 'Drop your PDF here or click to browse'}
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 20MB
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter PDF Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to unlock PDF"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleUnlock}
            disabled={!file || !password || loading}
            className="w-full mt-6 bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Unlocking PDF...' : 'Unlock & Download'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your password-protected PDF file</li>
            <li>2. Enter the correct password</li>
            <li>3. Click "Unlock & Download" to get your unlocked PDF</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
