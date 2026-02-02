import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Easy Tool" className="h-12 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">File Processing</h2>
            <p className="text-gray-600 mb-4">
              All files uploaded to Easy Tool are processed temporarily and automatically deleted within 1 hour. 
              We do not store, share, or access your files.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Data Collection</h2>
            <p className="text-gray-600 mb-4">
              We do not collect personal information. No registration or login is required to use our services.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Security</h2>
            <p className="text-gray-600 mb-4">
              All file transfers are encrypted using HTTPS. Files are processed on secure servers and 
              automatically deleted after processing.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
