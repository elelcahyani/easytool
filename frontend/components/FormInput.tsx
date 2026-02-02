interface FormInputProps {
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'password'
  value: string | number | boolean
  onChange: (value: any) => void
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
  required?: boolean
}

export default function FormInput({
  label,
  type,
  value,
  onChange,
  options,
  placeholder,
  min,
  max,
  required,
}: FormInputProps) {
  if (type === 'select' && options) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'checkbox') {
    return (
      <div className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      </div>
    )
  }

  if (type === 'number') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
        />
      </div>
    )
  }

  if (type === 'password') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="password"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter password"}
          required={required}
          minLength={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors font-mono"
        />
        {value && (value as string).length < 4 && (
          <p className="mt-1 text-sm text-red-600">Password must be at least 4 characters</p>
        )}
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
      />
    </div>
  )
}
