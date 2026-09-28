import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2D6A4F",
          borderRadius: 7,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 21 C14 21 7 17 7 11.5 C7 8 10.1 6 14 6 C17.9 6 21 8 21 11.5 C21 17 14 21 14 21Z"
            fill="none"
            stroke="white"
            strokeWidth="1.3"
          />
          <line
            x1="14"
            y1="21"
            x2="14"
            y2="9.5"
            stroke="white"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="14"
            x2="10.5"
            y2="11.5"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="11.5"
            x2="17.5"
            y2="9.2"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="14" cy="9.5" r="1.2" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
