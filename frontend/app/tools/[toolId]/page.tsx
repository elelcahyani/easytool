'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import FileUploader from '@/components/FileUploader'
import ProgressBar from '@/components/ProgressBar'
import FormInput from '@/components/FormInput'
import axios from 'axios'

const toolConfig: Record<string, any> = {
  'merge-pdf': {
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    endpoint: '/api/merge-pdf',
    icon: '📑',
    hasOptions: false,
    gradient: 'from-emerald-400 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
  },
  'compress-pdf': {
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    endpoint: '/api/compress-pdf',
    icon: '🗜️',
    hasOptions: false,
    gradient: 'from-rose-400 to-pink-500',
    bgGradient: 'from-rose-50 to-pink-50',
  },
  'split-pdf': {
    name: 'Split PDF',
    description: 'Extract specific pages from your PDF document',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    endpoint: '/api/split-pdf',
    icon: '✂️',
    hasOptions: false,
    gradient: 'from-purple-400 to-indigo-500',
    bgGradient: 'from-purple-50 to-indigo-50',
  },
  'compress-image': {
    name: 'Image Compressor',
    description: 'Compress images without losing quality',
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
    endpoint: '/api/compress-image',
    icon: '🖼️',
    hasOptions: false,
    gradient: 'from-blue-400 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
  'image-to-pdf': {
    name: 'Image to PDF',
    description: 'Convert images to PDF format',
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
    endpoint: '/api/image-to-pdf',
    icon: '📸',
    hasOptions: false,
    gradient: 'from-orange-400 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50',
  },
  'pdf-to-image': {
    name: 'PDF to Image',
    description: 'Convert PDF pages to JPG or PNG images',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    endpoint: '/api/pdf-to-image',
    icon: '🖼️',
    hasOptions: true,
    gradient: 'from-indigo-400 to-purple-500',
    bgGradient: 'from-indigo-50 to-purple-50',
    options: {
      format: {
        type: 'select',
        label: 'Output Format',
        default: 'PNG',
        choices: [
          { value: 'PNG', label: 'PNG (High Quality)' },
          { value: 'JPG', label: 'JPG (Smaller Size)' },
        ],
      },
    },
  },
  'image-convert': {
    name: 'Image Converter',
    description: 'Convert images between JPG, PNG, and WEBP',
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    multiple: true,
    endpoint: '/api/image-convert',
    icon: '🔄',
    hasOptions: true,
    gradient: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
    options: {
      format: {
        type: 'select',
        label: 'Convert To',
        default: 'PNG',
        choices: [
          { value: 'PNG', label: 'PNG' },
          { value: 'JPG', label: 'JPG' },
        ],
      },
    },
  },
  'image-resize': {
    name: 'Resize Image',
    description: 'Change image dimensions with aspect ratio',
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
    endpoint: '/api/image-resize',
    icon: '📐',
    hasOptions: true,
    gradient: 'from-pink-400 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50',
    options: {
      width: {
        type: 'number',
        label: 'Width (pixels)',
        default: 800,
        min: 1,
        max: 10000,
      },
      height: {
        type: 'number',
        label: 'Height (pixels)',
        default: 600,
        min: 1,
        max: 10000,
      },
      maintain_aspect: {
        type: 'checkbox',
        label: 'Maintain aspect ratio',
        default: true,
      },
    },
  },
  'pdf-rotate': {
    name: 'Rotate PDF',
    description: 'Rotate PDF pages by 90, 180, or 270 degrees',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    endpoint: '/api/pdf-rotate',
    icon: '🔄',
    hasOptions: true,
    gradient: 'from-yellow-400 to-orange-500',
    bgGradient: 'from-yellow-50 to-orange-50',
    options: {
      rotation: {
        type: 'select',
        label: 'Rotation',
        default: '90',
        choices: [
          { value: '90', label: '90° Clockwise' },
          { value: '180', label: '180° (Upside Down)' },
          { value: '270', label: '270° (90° Counter-clockwise)' },
        ],
      },
    },
  },
  'pdf-protect': {
    name: 'Protect PDF',
    description: 'Add password protection to your PDF files',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    endpoint: '/api/pdf-protect',
    icon: '🔒',
    hasOptions: true,
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
    options: {
      password: {
        type: 'password',
        label: 'Password (min 4 characters)',
        default: '',
        required: true,
      },
    },
  },
  'word-to-pdf': {
    name: 'Word to PDF',
    description: 'Convert DOCX documents to PDF format',
    accept: { 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
    endpoint: '/api/word-to-pdf',
    icon: '📄',
    hasOptions: false,
    disclaimer: 'Preserves tables, images, and formatting. Requires LibreOffice installed on server.',
    gradient: 'from-sky-400 to-blue-500',
    bgGradient: 'from-sky-50 to-blue-50',
  },
  'pdf-to-word': {
    name: 'PDF to Word',
    description: 'Convert PDF files to editable DOCX format',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    endpoint: '/api/pdf-to-word',
    icon: '📝',
    hasOptions: false,
    disclaimer: 'Best results with text-based PDFs. Tables and images are preserved when LibreOffice is installed. Scanned PDFs may not convert accurately.',
    gradient: 'from-violet-400 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50',
  },
}

export default function ToolPage() {
  const params = useParams()
  const toolId = params.toolId as string
  const tool = toolConfig[toolId]

  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [processing, setProcessing] = useState(false)
  
  // State for tool options
  const [options, setOptions] = useState<Record<string, any>>(() => {
    if (!tool?.hasOptions) return {}
    const defaultOptions: Record<string, any> = {}
    Object.keys(tool.options).forEach((key) => {
      defaultOptions[key] = tool.options[key].default
    })
    return defaultOptions
  })

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setDownloadUrl('')
  }

  const handleOptionChange = (key: string, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleProcess = async () => {
    if (files.length === 0) return

    // Validate required options
    if (tool.hasOptions) {
      for (const [key, option] of Object.entries(tool.options)) {
        if (option.required && !options[key]) {
          alert(`Please fill in: ${option.label}`)
          return
        }
        if (option.type === 'password' && (options[key] as string).length < 4) {
          alert('Password must be at least 4 characters')
          return
        }
      }
    }

    setProcessing(true)
    setProgress(0)
    setStatus('Uploading...')

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    // Add options to form data
    if (tool.hasOptions) {
      Object.keys(options).forEach((key) => {
        formData.append(key, options[key].toString())
      })
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}${tool.endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setProgress(percentCompleted)
          setStatus('Processing...')
        },
        responseType: 'blob',
      })

      setProgress(100)
      setStatus('Complete!')

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (error: any) {
      setStatus('Error processing file')
      if (error.response?.data) {
        const text = await error.response.data.text()
        try {
          const errorData = JSON.parse(text)
          alert(`Error: ${errorData.detail}`)
        } catch {
          alert('Error processing file. Please try again.')
        }
      }
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  if (!tool) {
    return <div>Tool not found</div>
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${tool.bgGradient || 'from-blue-50 to-orange-50'}`}>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Easy Tool" className="h-12 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 overflow-hidden">
          {/* Decorative gradient blob */}
          <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${tool.gradient} opacity-10 rounded-full blur-3xl`}></div>
          <div className={`absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br ${tool.gradient} opacity-10 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              {/* Icon with gradient background */}
              <div className="inline-block mb-4">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-xl`}>
                  <span className="text-5xl filter drop-shadow-lg">{tool.icon || '📄'}</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{tool.name}</h1>
              <p className="text-gray-600 text-lg">{tool.description}</p>
              
              {tool.disclaimer && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 flex items-center gap-2 justify-center">
                    <span>⚠️</span>
                    <span>{tool.disclaimer}</span>
                  </p>
                </div>
              )}
            </div>

            <FileUploader
              accept={tool.accept}
              maxSize={20 * 1024 * 1024}
              multiple={tool.multiple}
              onFilesSelected={handleFilesSelected}
            />

            {/* Tool Options */}
            {tool.hasOptions && (
              <div className={`mt-8 p-6 bg-gradient-to-br ${tool.bgGradient} rounded-2xl border-2 border-gray-200`}>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>⚙️</span> Options
                </h3>
                {Object.keys(tool.options).map((key) => {
                  const option = tool.options[key]
                  return (
                    <FormInput
                      key={key}
                      label={option.label}
                      type={option.type}
                      value={options[key]}
                      onChange={(value) => handleOptionChange(key, value)}
                      options={option.choices}
                      placeholder={option.placeholder}
                      min={option.min}
                      max={option.max}
                      required={option.required}
                    />
                  )
                })}
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-8">
                <div className={`bg-gradient-to-br ${tool.bgGradient} border-2 border-gray-200 rounded-2xl p-4 mb-4`}>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📎</span> Selected Files:
                  </h3>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                        <span className={`text-transparent bg-gradient-to-r ${tool.gradient} bg-clip-text font-bold`}>•</span>
                        <span className="font-medium">{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className={`w-full bg-gradient-to-r ${tool.gradient} text-white py-4 px-6 rounded-xl font-semibold hover:shadow-2xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg transform hover:-translate-y-0.5`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚙️</span> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>⚡</span> Process Files
                    </span>
                  )}
                </button>
              </div>
            )}

            {processing && (
              <div className="mt-8">
                <ProgressBar progress={progress} status={status} />
              </div>
            )}

            {downloadUrl && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl relative overflow-hidden">
                {/* Success decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <p className="text-green-800 font-bold text-lg">Processing complete!</p>
                      <p className="text-green-700 text-sm">Your file is ready to download</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={`processed-${toolId}.${toolId.includes('pdf') ? 'pdf' : 'zip'}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>⬇️</span> Download Result
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link 
            href="/#tools"
            scroll={false}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
          >
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
