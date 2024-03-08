import React from 'react'

export default function PkmIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 130 130"
      fill="none"
      className="w-6 h-6"
      {...props}
    >
      <circle cx="65" cy="65" r="65" fill="#5A4EAE" />
      <g stroke="#FFF" strokeWidth="1.5">
        <circle
          cx="65"
          cy="20"
          r="5"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        <circle
          cx="100"
          cy="30"
          r="5"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        <circle
          cx="110"
          cy="65"
          r="5"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        <circle
          cx="100"
          cy="100"
          r="5"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        <circle
          cx="65"
          cy="65"
          r="24"
          fill="none"
          stroke="white"
          strokeWidth="4"
        />
        <line x1="97" y1="33" x2="70" y2="60" stroke="white" />
        <line x1="97" y1="97" x2="70" y2="70" stroke="white" />
        <line x1="65" y1="25" x2="65" y2="57" stroke="white" />
        <line x1="105" y1="65" x2="73" y2="65" stroke="white" />
      </g>
    </svg>
  )
}
