'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ZipCreatePage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleCreate = async () => {
    if (files.length === 0) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zip-create`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create ZIP')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'compressed_files.zip'
      a.click()
      window.URL.revokeObjectURL(url)

      setFiles([])
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-zip-create" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            📦
          </div>
          <div>
            <h1 className="text-4xl font-bold">Create ZIP</h1>
            <p className="text-gray-600">Compress multiple files into a ZIP archive</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Files to Compress
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-yellow-400 transition-colors cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">
              Select multiple files to compress into a single ZIP archive
            </p>
          </div>

          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={files.length === 0 || loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50 hover:from-yellow-600 hover:to-amber-600 transition-all"
          >
            {loading ? 'Creating ZIP...' : `Create ZIP (${files.length} files)`}
          </button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>💡 Tip:</strong> You can select multiple files at once. All files will be compressed into a single ZIP archive.
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Click "Select Files to Compress" and choose multiple files</li>
            <li>2. Review the selected files list (you can remove any file by clicking ✕)</li>
            <li>3. Click "Create ZIP" to compress all files into a single archive</li>
            <li>4. The ZIP file will be automatically downloaded</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
