'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/word-to-pdf`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to convert Word to PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.pdf'
      a.click()
      window.URL.revokeObjectURL(url)

      setFile(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-word-to-pdf" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">📄</div>
          <div>
            <h1 className="text-4xl font-bold">Word to PDF</h1>
            <p className="text-gray-600">Convert DOCX documents to PDF format</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept=".docx,.doc" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="mb-4 w-full" />
          
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Converting...' : 'Convert & Download PDF'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your Word document (.docx or .doc)</li>
            <li>2. Click "Convert & Download PDF"</li>
            <li>3. Wait for the conversion to complete</li>
            <li>4. Your PDF file will be automatically downloaded</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
