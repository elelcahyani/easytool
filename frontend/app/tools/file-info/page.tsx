'use client'
import { useState } from 'react'
import Link from 'next/link'

interface FileInfo {
  filename: string
  size_bytes: number
  size_formatted: string
  extension: string
  mime_type: string
}

export default function FileInfoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError('')
      setFileInfo(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setFileInfo(null)
    }
  }

  const handleCheck = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')
    setFileInfo(null)

    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/file-info`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get file info')
      }

      const data = await response.json()
      setFileInfo(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-file-info" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-zinc-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            ℹ️
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">File Info</h1>
            <p className="text-gray-600 mt-1">Check file size and metadata</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {file ? file.name : 'Drop any file here or click to browse'}
              </p>
              <p className="text-sm text-gray-500">
                Any file type accepted
              </p>
            </label>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {fileInfo && (
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">File Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Filename:</span>
                  <span className="text-gray-900">{fileInfo.filename}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">File Size:</span>
                  <span className="text-gray-900">{fileInfo.size_formatted}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Size (bytes):</span>
                  <span className="text-gray-900">{fileInfo.size_bytes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Extension:</span>
                  <span className="text-gray-900">{fileInfo.extension || 'None'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-gray-700">MIME Type:</span>
                  <span className="text-gray-900">{fileInfo.mime_type}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleCheck}
            disabled={!file || loading}
            className="w-full mt-6 bg-gradient-to-r from-slate-500 to-zinc-500 text-white py-4 rounded-xl font-semibold hover:from-slate-600 hover:to-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Checking...' : 'Check File Info'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload any file</li>
            <li>2. Click "Check File Info"</li>
            <li>3. View detailed file information including size and type</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
