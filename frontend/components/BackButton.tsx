'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BackButton() {
  const pathname = usePathname()
  
  // Extract tool id from pathname (e.g., /tools/merge-pdf -> merge-pdf)
  const toolId = pathname?.split('/').pop() || ''
  
  return (
    <Link 
      href={`/#tool-${toolId}`} 
      className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
    >
      ← Back
    </Link>
  )
}
