interface ProgressBarProps {
  progress: number
  status: string
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="w-full bg-white p-6 rounded-xl border-2 border-blue-200">
      <div className="flex justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="animate-spin">⚙️</span> {status}
        </span>
        <span className="text-sm font-bold text-primary-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}
