'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function FileRenamePage() {
  const [files, setFiles] = useState<File[]>([])
  const [pattern, setPattern] = useState('file')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRename = async () => {
    if (files.length === 0) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('pattern', pattern)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/file-rename`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to rename files')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'renamed_files.zip'
      a.click()
      window.URL.revokeObjectURL(url)

      setFiles([])
      setPattern('file')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-file-rename" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">✏️</div>
          <div>
            <h1 className="text-4xl font-bold">Rename Files</h1>
            <p className="text-gray-600">Batch rename multiple files at once</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <input 
            type="file" 
            multiple 
            onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} 
            className="mb-4 w-full" 
          />
          
          {files.length > 0 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Naming Pattern</label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="e.g., photo"
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Files will be renamed as: {pattern}_001, {pattern}_002, etc.
                </p>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-2">{files.length} file(s) selected</p>
              </div>
            </>
          )}

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

          <button
            onClick={handleRename}
            disabled={files.length === 0 || loading}
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Renaming...' : 'Rename & Download ZIP'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload multiple files</li>
            <li>2. Enter naming pattern (e.g., "photo")</li>
            <li>3. Files will be renamed as pattern_001, pattern_002, etc. and downloaded as ZIP</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
