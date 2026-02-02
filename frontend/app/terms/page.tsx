import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">Service Usage</h2>
            <p className="text-gray-600 mb-4">
              Easy Tool provides free online tools for PDF and image processing. 
              By using our service, you agree to these terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">File Limitations</h2>
            <p className="text-gray-600 mb-4">
              Maximum file size: 20MB per file. Files are automatically deleted after 1 hour.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Acceptable Use</h2>
            <p className="text-gray-600 mb-4">
              Do not upload illegal, copyrighted, or malicious content. 
              We reserve the right to limit or terminate service for abuse.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
