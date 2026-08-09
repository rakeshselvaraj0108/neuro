"use client";

import type { SVGProps } from "react";

export interface FormGlyphProps extends SVGProps<SVGSVGElement> {
  form: string;
  size?: number;
}

export function FormGlyph({ form, size = 40, className = "", ...props }: FormGlyphProps) {
  const normalized = form.trim().toLowerCase();

  // Poem: Quill / Crescent Moon motif
  if (normalized.includes("poem") || normalized.includes("verse")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M12 28C14.5 28 17 26.5 19 24.5C22.5 21 26 14 28 8C22 10 15 13.5 11.5 17C9.5 19 8 21.5 8 24C8 26.2 9.8 28 12 28Z"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 28L6 34"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M26 12C29 13.5 31 16.5 31 20C31 24.9706 26.9706 29 22 29"
          stroke="var(--blood-bright)"
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  // Essay / Reflective Paragraph: Folded page motif
  if (normalized.includes("essay") || normalized.includes("paragraph") || normalized.includes("prose")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M10 8C10 6.89543 10.8954 6 12 6H24L30 12V32C30 33.1046 29.1046 34 28 34H12C10.8954 34 10 33.1046 10 32V8Z"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M24 6V12H30"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M15 17H25" stroke="var(--blood-bright)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M15 22H25" stroke="var(--blood-bright)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M15 27H21" stroke="var(--blood-bright)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // Script / Spoken Word: Speech bubble + waveform motif
  if (normalized.includes("script") || normalized.includes("spoken") || normalized.includes("monologue")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M8 18C8 11.3726 13.3726 6 20 6C26.6274 6 32 11.3726 32 18C32 24.6274 26.6274 30 20 30H14L8 34V28.5C8 25.5 8 20 8 18Z"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M15 18V18.01" stroke="var(--blood-bright)" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 15V21" stroke="var(--blood-bright)" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 17V19" stroke="var(--blood-bright)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Letter: Envelope motif
  if (normalized.includes("letter") || normalized.includes("mail")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect
          x="8"
          y="10"
          width="24"
          height="20"
          rx="2"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
        />
        <path
          d="M8 12L20 21L32 12"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // List: Stacked lines motif
  if (normalized.includes("list") || normalized.includes("bulletin")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path d="M10 12H12" stroke="var(--blood-bright)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 12H30" stroke="var(--blood-bright)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 20H12" stroke="var(--blood-bright)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 20H30" stroke="var(--blood-bright)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 28H12" stroke="var(--blood-bright)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 28H26" stroke="var(--blood-bright)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Story / Fiction: Open book motif
  if (normalized.includes("story") || normalized.includes("fiction") || normalized.includes("scene")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M6 10C10 9 16 10 20 12V32C16 30 10 29 6 30V10Z"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M34 10C30 9 24 10 20 12V32C24 30 30 29 34 30V10Z"
          stroke="var(--blood-bright)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Default / Generic shape glyph
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="20" cy="20" r="11" stroke="var(--blood-bright)" strokeWidth="1.5" />
      <polygon
        points="20,11 27,24 13,24"
        stroke="var(--blood-bright)"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}
