'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function VideoToAudioPage() {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/video-to-audio`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to extract audio')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.[^.]+$/, '.mp3')
      a.click()
      window.URL.revokeObjectURL(url)

      setFile(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    '<strong>Upload Video:</strong> Click "Choose File" and select your video file (MP4, AVI, MOV, MKV, etc.)',
    '<strong>Extract Audio:</strong> Click the "Extract Audio & Download MP3" button',
    '<strong>Download:</strong> Your MP3 file will automatically download when ready'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-video-to-audio" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">🎬</div>
          <div>
            <h1 className="text-4xl font-bold">Video to Audio</h1>
            <p className="text-gray-600">Extract audio from video files</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept="video/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="mb-4 w-full" />
          
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Extracting Audio...' : 'Extract Audio & Download MP3'}
          </button>


        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your video file (MP4, AVI, MOV, MKV, etc.)</li>
            <li>2. Click "Extract Audio & Download MP3"</li>
            <li>3. Your MP3 file will download automatically</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
