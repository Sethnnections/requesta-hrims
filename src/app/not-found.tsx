import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-requesta-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-neutral-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-requesta-primary px-6 py-3 text-sm font-medium text-white hover:bg-requesta-primary-light"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
