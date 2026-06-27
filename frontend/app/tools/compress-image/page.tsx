'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function CompressImagePage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCompress = async () => {
    if (files.length === 0) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/compress-image`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to compress images')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = files.length === 1 ? files[0].name : `${files[0].name.replace(/\.[^.]+$/, '')}_compressed.zip`
      a.click()
      window.URL.revokeObjectURL(url)

      setFiles([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-compress-image" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">🖼️</div>
          <div>
            <h1 className="text-4xl font-bold">Compress Image</h1>
            <p className="text-gray-600">Reduce image file size without losing quality</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} className="mb-4 w-full" />
          
          {files.length > 0 && <div className="mb-4 text-sm text-gray-600">{files.length} image(s) selected</div>}
          
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleCompress}
            disabled={files.length === 0 || loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Compressing...' : 'Compress & Download'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload one or multiple images (JPG, PNG, WEBP)</li>
            <li>2. Click "Compress & Download"</li>
            <li>3. Download compressed image(s) - single file or ZIP for multiple</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
