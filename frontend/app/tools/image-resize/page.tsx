'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ImageResizePage() {
  const [files, setFiles] = useState<File[]>([])
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('600')
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleResize = async () => {
    if (files.length === 0) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      if (width) formData.append('width', width)
      if (height) formData.append('height', height)
      formData.append('maintain_aspect', maintainAspect.toString())

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/image-resize`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to resize images')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = files.length === 1 ? files[0].name : `${files[0].name.replace(/\.[^.]+$/, '')}_resized.zip`
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
        <Link href="/#tool-image-resize" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">📐</div>
          <div>
            <h1 className="text-4xl font-bold">Resize Image</h1>
            <p className="text-gray-600">Change image dimensions with aspect ratio</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} className="mb-4 w-full" />
          
          {files.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">{files.length} image(s) selected</div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Width (px)</label>
                  <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Height (px)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
                </div>
              </div>
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={maintainAspect} onChange={(e) => setMaintainAspect(e.target.checked)} />
                <span className="text-sm">Maintain aspect ratio</span>
              </label>
            </>
          )}

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleResize}
            disabled={files.length === 0 || loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Resizing...' : 'Resize & Download'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload one or multiple images</li>
            <li>2. Enter desired width and height in pixels</li>
            <li>3. Choose whether to maintain aspect ratio</li>
            <li>4. Click "Resize & Download" to get resized image(s)</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
