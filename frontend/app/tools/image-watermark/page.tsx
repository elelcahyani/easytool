'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ImageWatermarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [watermarkText, setWatermarkText] = useState('')
  const [position, setPosition] = useState('bottom-right')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleWatermark = async () => {
    if (!file || !watermarkText) {
      setError('Please select a file and enter watermark text')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('watermark_text', watermarkText)
      formData.append('position', position)
      formData.append('opacity', '128')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/image-watermark`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to add watermark')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'watermarked.png'
      a.click()
      window.URL.revokeObjectURL(url)

      setFile(null)
      setWatermarkText('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-image-watermark" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          ← Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">©️</div>
          <div>
            <h1 className="text-4xl font-bold">Add Watermark</h1>
            <p className="text-gray-600">Add text watermark to your images</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 w-full" />
          
          {file && (
            <>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="w-full px-4 py-3 border rounded-lg mb-4"
              />
              
              <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-4 py-3 border rounded-lg mb-4">
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </>
          )}

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleWatermark}
            disabled={!file || !watermarkText || loading}
            className="w-full bg-gradient-to-r from-rose-500 to-red-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Add Watermark & Download'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your image file</li>
            <li>2. Enter the watermark text you want to add</li>
            <li>3. Choose the position where the watermark should appear</li>
            <li>4. Click "Add Watermark & Download" to get your watermarked image</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
