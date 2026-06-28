/** Inline brand mark — a calligraphic crescent + dome motif on an emerald disc. */
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Sabr and Sukoon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ss-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fa783" />
          <stop offset="1" stopColor="#0e4537" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#ss-grad)" />
      <circle cx="32" cy="32" r="31" fill="none" stroke="#e6c878" strokeWidth="1.5" />
      {/* dome */}
      <path
        d="M32 18c-6 4-9 9-9 16h18c0-7-3-12-9-16z"
        fill="#fbf9f4"
        opacity="0.95"
      />
      <rect x="30.7" y="13.5" width="2.6" height="6" rx="1.3" fill="#e6c878" />
      <circle cx="32" cy="12" r="1.8" fill="#e6c878" />
      {/* base */}
      <rect x="20" y="34" width="24" height="3" rx="1.5" fill="#fbf9f4" opacity="0.95" />
      {/* crescent */}
      <path
        d="M44 40a10 10 0 1 1-9.2-9.97A8 8 0 1 0 44 40z"
        fill="#e6c878"
      />
    </svg>
  );
}
