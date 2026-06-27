'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function VideoCompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCompress = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('quality', quality)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/video-compress`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to compress video')

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
        <Link href="/#tool-video-compress" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">📹</div>
          <div>
            <h1 className="text-4xl font-bold">Compress Video</h1>
            <p className="text-gray-600">Reduce video file size efficiently</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept="video/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="mb-4 w-full" />
          
          {file && (
            <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full px-4 py-3 border rounded-lg mb-4">
              <option value="low">Low Quality (Smaller file)</option>
              <option value="medium">Medium Quality (Balanced)</option>
              <option value="high">High Quality (Larger file)</option>
            </select>
          )}

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleCompress}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Compressing... (This may take a while)' : 'Compress & Download'}
          </button>


        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your video file</li>
            <li>2. Select compression quality (Low/Medium/High)</li>
            <li>3. Click "Compress & Download" - processing may take a few minutes</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
