'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploaderProps {
  accept: Record<string, string[]>
  maxSize: number
  multiple?: boolean
  onFilesSelected: (files: File[]) => void
}

export default function FileUploader({
  accept,
  maxSize,
  multiple = false,
  onFilesSelected,
}: FileUploaderProps) {
  const [error, setError] = useState<string>('')

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError('')
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File too large. Max size: ${maxSize / 1024 / 1024}MB`)
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type')
        }
        return
      }

      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles)
      }
    },
    [maxSize, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 scale-105'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-7xl mb-6 animate-bounce">📁</div>
        {isDragActive ? (
          <div>
            <p className="text-xl font-semibold text-primary-600 mb-2">Drop files here...</p>
            <p className="text-sm text-primary-500">Release to upload</p>
          </div>
        ) : (
          <div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Drag & drop files here
            </p>
            <p className="text-gray-500 mb-4">or click to browse</p>
            <div className="inline-block bg-primary-100 text-primary-700 px-6 py-2 rounded-full text-sm font-medium">
              Max file size: {maxSize / 1024 / 1024}MB
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span className="text-red-600 text-xl">⚠️</span>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
