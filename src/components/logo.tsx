interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * The mark: an open ring (Celo/orbit) with an ascending trend-line breaking
 * through the gap and terminating in a spark node — reads as growth,
 * motion, and a little AI glint, without leaning on Celo's yellow directly
 * except as the accent on the line itself. Transparent background, meant
 * to sit on the app's own dark surfaces — see app/icon.svg for the
 * standalone favicon variant with its own background chip.
 */
export function Logo({ size = 28, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ceflow logo"
    >
      <path
        d="M27 16A11 11 0 1 1 16 5"
        stroke="var(--foreground)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10.5 20L15 14.5L18 17.5L23.5 9.5"
        stroke="var(--accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="23.5" cy="9.5" r="2.1" fill="var(--accent)" />
    </svg>
  );
}
