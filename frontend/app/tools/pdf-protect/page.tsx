'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PdfProtectPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleProtect = async () => {
    if (!file || !password) {
      setError('Please select a file and enter password')
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('password', password)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf-protect`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to protect PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'protected.pdf'
      a.click()
      window.URL.revokeObjectURL(url)

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
        <Link href="/#tool-pdf-protect" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">🔒</div>
          <div>
            <h1 className="text-4xl font-bold">Protect PDF</h1>
            <p className="text-gray-600">Add password protection to your PDF files</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="mb-4 w-full" />
          
          {file && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Password (min 4 characters)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          )}

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleProtect}
            disabled={!file || !password || loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Protecting...' : 'Protect & Download'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your PDF file</li>
            <li>2. Enter a password (minimum 4 characters)</li>
            <li>3. Click "Protect & Download" to get your password-protected PDF</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
