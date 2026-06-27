'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PdfRotatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [rotation, setRotation] = useState('90')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRotate = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('rotation', rotation)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf-rotate`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to rotate PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
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
        <Link href="/#tool-pdf-rotate" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">🔄</div>
          <div>
            <h1 className="text-4xl font-bold">Rotate PDF</h1>
            <p className="text-gray-600">Rotate PDF pages by 90, 180, or 270 degrees</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="mb-4 w-full" />
          
          {file && (
            <select value={rotation} onChange={(e) => setRotation(e.target.value)} className="w-full px-4 py-3 border rounded-lg mb-4">
              <option value="90">90° Clockwise</option>
              <option value="180">180° (Upside Down)</option>
              <option value="270">270° (90° Counter-clockwise)</option>
            </select>
          )}

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleRotate}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Rotating...' : 'Rotate & Download'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your PDF file</li>
            <li>2. Select rotation angle (90°, 180°, or 270°)</li>
            <li>3. Click "Rotate & Download" to get your rotated PDF</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
