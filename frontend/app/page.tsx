'use client'
import Link from 'next/link'
import { useEffect } from 'react'

const tools = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    icon: '📑',
    gradient: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-200',
    hover: 'hover:shadow-emerald-300',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: '🗜️',
    gradient: 'from-rose-400 to-pink-500',
    shadow: 'shadow-rose-200',
    hover: 'hover:shadow-rose-300',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract specific pages from your PDF',
    icon: '✂️',
    gradient: 'from-purple-400 to-indigo-500',
    shadow: 'shadow-purple-200',
    hover: 'hover:shadow-purple-300',
  },
  {
    id: 'compress-image',
    name: 'Compress Image',
    description: 'Reduce image file size without losing quality',
    icon: '🖼️',
    gradient: 'from-blue-400 to-cyan-500',
    shadow: 'shadow-blue-200',
    hover: 'hover:shadow-blue-300',
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert your images to PDF format',
    icon: '📸',
    gradient: 'from-orange-400 to-amber-500',
    shadow: 'shadow-orange-200',
    hover: 'hover:shadow-orange-300',
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Convert PDF pages to JPG or PNG images',
    icon: '🖼️',
    gradient: 'from-indigo-400 to-purple-500',
    shadow: 'shadow-indigo-200',
    hover: 'hover:shadow-indigo-300',
  },
  {
    id: 'image-convert',
    name: 'Image Converter',
    description: 'Convert images between JPG, PNG, and WEBP',
    icon: '🔄',
    gradient: 'from-cyan-400 to-blue-500',
    shadow: 'shadow-cyan-200',
    hover: 'hover:shadow-cyan-300',
  },
  {
    id: 'image-resize',
    name: 'Resize Image',
    description: 'Change image dimensions with aspect ratio',
    icon: '📐',
    gradient: 'from-pink-400 to-rose-500',
    shadow: 'shadow-pink-200',
    hover: 'hover:shadow-pink-300',
  },
  {
    id: 'pdf-rotate',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages by 90, 180, or 270 degrees',
    icon: '🔄',
    gradient: 'from-yellow-400 to-orange-500',
    shadow: 'shadow-yellow-200',
    hover: 'hover:shadow-yellow-300',
  },
  {
    id: 'pdf-protect',
    name: 'Protect PDF',
    description: 'Add password protection to your PDF files',
    icon: '🔒',
    gradient: 'from-green-400 to-emerald-500',
    shadow: 'shadow-green-200',
    hover: 'hover:shadow-green-300',
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert DOCX documents to PDF format',
    icon: '📄',
    gradient: 'from-sky-400 to-blue-500',
    shadow: 'shadow-sky-200',
    hover: 'hover:shadow-sky-300',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files to editable DOCX format',
    icon: '📝',
    gradient: 'from-violet-400 to-purple-500',
    shadow: 'shadow-violet-200',
    hover: 'hover:shadow-violet-300',
  },
  // NEW TOOLS
  {
    id: 'pdf-unlock',
    name: 'Unlock PDF',
    description: 'Remove password protection from PDF files',
    icon: '🔓',
    gradient: 'from-red-400 to-orange-500',
    shadow: 'shadow-red-200',
    hover: 'hover:shadow-red-300',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality JPG images',
    icon: '📷',
    gradient: 'from-teal-400 to-cyan-500',
    shadow: 'shadow-teal-200',
    hover: 'hover:shadow-teal-300',
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Combine multiple images into one PDF',
    icon: '🖼️',
    gradient: 'from-fuchsia-400 to-pink-500',
    shadow: 'shadow-fuchsia-200',
    hover: 'hover:shadow-fuchsia-300',
  },
  {
    id: 'pdf-extract-images',
    name: 'Extract Images',
    description: 'Extract all images from PDF files',
    icon: '🎨',
    gradient: 'from-lime-400 to-green-500',
    shadow: 'shadow-lime-200',
    hover: 'hover:shadow-lime-300',
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    description: 'Extract readable text from PDF documents',
    icon: '📃',
    gradient: 'from-amber-400 to-yellow-500',
    shadow: 'shadow-amber-200',
    hover: 'hover:shadow-amber-300',
  },
  {
    id: 'image-crop',
    name: 'Crop Image',
    description: 'Crop images with custom dimensions',
    icon: '✂️',
    gradient: 'from-indigo-400 to-blue-500',
    shadow: 'shadow-indigo-200',
    hover: 'hover:shadow-indigo-300',
  },
  {
    id: 'image-watermark',
    name: 'Add Watermark',
    description: 'Add text watermark to your images',
    icon: '©️',
    gradient: 'from-rose-400 to-red-500',
    shadow: 'shadow-rose-200',
    hover: 'hover:shadow-rose-300',
  },
  {
    id: 'image-remove-bg',
    name: 'Remove Background',
    description: 'Remove image background automatically',
    icon: '🎭',
    gradient: 'from-cyan-400 to-sky-500',
    shadow: 'shadow-cyan-200',
    hover: 'hover:shadow-cyan-300',
  },
  {
    id: 'audio-convert',
    name: 'Audio Converter',
    description: 'Convert between MP3, WAV, and OGG',
    icon: '🎵',
    gradient: 'from-violet-400 to-indigo-500',
    shadow: 'shadow-violet-200',
    hover: 'hover:shadow-violet-300',
  },
  {
    id: 'video-to-audio',
    name: 'Video to Audio',
    description: 'Extract audio from video files',
    icon: '🎬',
    gradient: 'from-orange-400 to-red-500',
    shadow: 'shadow-orange-200',
    hover: 'hover:shadow-orange-300',
  },
  {
    id: 'video-compress',
    name: 'Compress Video',
    description: 'Reduce video file size efficiently',
    icon: '📹',
    gradient: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-200',
    hover: 'hover:shadow-emerald-300',
  },
  {
    id: 'zip-create',
    name: 'Create ZIP',
    description: 'Compress multiple files into a ZIP archive',
    icon: '📦',
    gradient: 'from-yellow-400 to-amber-500',
    shadow: 'shadow-yellow-200',
    hover: 'hover:shadow-yellow-300',
  },
  {
    id: 'file-rename',
    name: 'Rename Files',
    description: 'Batch rename multiple files at once',
    icon: '✏️',
    gradient: 'from-sky-400 to-cyan-500',
    shadow: 'shadow-sky-200',
    hover: 'hover:shadow-sky-300',
  },
  {
    id: 'file-info',
    name: 'File Info',
    description: 'Check file size and metadata',
    icon: 'ℹ️',
    gradient: 'from-slate-400 to-zinc-500',
    shadow: 'shadow-slate-200',
    hover: 'hover:shadow-slate-300',
  },
]

export default function Home() {
  useEffect(() => {
    // Scroll to tool section if hash exists
    const hash = window.location.hash
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Easy Tool" className="h-12 w-auto object-contain" />
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#tools" className="hover:text-primary-600 transition-colors">Tools</a>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-600 transition-colors">Terms</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center relative">
          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-8 border border-blue-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-sm">100% Secure & Private</span>
          </div>

          {/* Main Heading with Icons */}
          <div className="relative inline-block">
            {/* Left Icon */}
            <div className="absolute -left-20 top-0 hidden lg:block">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl transform -rotate-12">
                📄
              </div>
            </div>

            {/* Right Icon */}
            <div className="absolute -right-20 top-12 hidden lg:block">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl transform rotate-12">
                ⚙️
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The Smarter Way to<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Handle Your Files
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Simplify your digital life with Easy Tool. Merge PDFs, compress images, and convert documents in seconds—all for free.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <a 
              href="#tools" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Explore All Tools
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
            {/* Green decorative blob */}
            <div className="absolute -right-32 -bottom-20 w-64 h-64 bg-gradient-to-br from-green-400 to-emerald-500 opacity-20 rounded-full blur-3xl -z-10 hidden lg:block"></div>

            {/* Fast & Easy Card */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group border border-white/30">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast & Easy</h3>
              <p className="text-gray-600 text-sm">Process your files in seconds with our optimized tools</p>
            </div>

            {/* Secure & Private Card */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group border border-white/30">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">
                🔒
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">Files are automatically deleted after 1 hour</p>
            </div>

            {/* 100% Free Card */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group border border-white/30">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">
                🆓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Free</h3>
              <p className="text-gray-600 text-sm">No registration or payment required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            All Available Tools
          </h3>
          <p className="text-gray-600 text-lg">
            26 free online tools for PDF, images, media, and files
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              id={`tool-${tool.id}`}
              href={`/tools/${tool.id}#tool-${tool.id}`}
              className={`group relative bg-white rounded-xl p-4 shadow-lg ${tool.shadow} ${tool.hover} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon with gradient background */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <span className="text-2xl filter drop-shadow-sm">{tool.icon}</span>
                </div>
                
                <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {tool.name}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {tool.description}
                </p>
                
                {/* Arrow indicator */}
                <div className="mt-3 flex items-center text-primary-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Try it now</span>
                  <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Decorative corner */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${tool.gradient} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity`}></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Easy Tool</h3>
              <p className="text-gray-400">
                Free online PDF and image tools. Fast, secure, and easy to use.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/tools/merge-pdf" className="hover:text-white transition-colors">Merge PDF</Link></li>
                <li><Link href="/tools/compress-pdf" className="hover:text-white transition-colors">Compress PDF</Link></li>
                <li><Link href="/tools/split-pdf" className="hover:text-white transition-colors">Split PDF</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © 2024 Easy Tool. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
