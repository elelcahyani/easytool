'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleRemoveBg = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/image-remove-background`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to remove background')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.[^.]+$/, '.png')
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
        <Link href="/#tool-image-remove-bg" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">🎭</div>
          <div>
            <h1 className="text-4xl font-bold">Remove Background</h1>
            <p className="text-gray-600">Remove image background automatically</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 w-full" />
          
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleRemoveBg}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Removing Background...' : 'Remove Background & Download'}
          </button>


        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your image file (JPG, PNG, etc.)</li>
            <li>2. Click "Remove Background & Download"</li>
            <li>3. Wait for the AI to process and remove the background</li>
            <li>4. Download your image with transparent background (PNG format)</li>
          </ol>

        </div>
      </div>
    </main>
  )
}
