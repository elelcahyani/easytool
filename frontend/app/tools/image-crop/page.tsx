'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ImageCropPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#tool-image-crop" scroll={false} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            ✂️
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Crop Image</h1>
            <p className="text-gray-600 mt-1">Crop images with custom dimensions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="border-2 border-dashed rounded-xl p-12 text-center">
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {file ? file.name : 'Drop your image here or click to browse'}
              </p>
            </label>
          </div>

          <button
            disabled
            className="w-full mt-4 bg-gray-400 text-white py-4 rounded-xl font-semibold opacity-50 cursor-not-allowed"
          >
            This Tools Available Soon
          </button>


        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How to use:</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Upload your image</li>
            <li>2. Interactive crop tool (Coming Soon)</li>
            <li>3. Download cropped image</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
