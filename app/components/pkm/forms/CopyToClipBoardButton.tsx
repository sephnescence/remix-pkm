'use client'

const CopyToClipBoardButton = ({
  className,
  display,
  copy,
}: {
  className: string
  display: string | JSX.Element
  copy: string
}) => {
  return (
    <button
      className={className}
      type="button"
      onClick={(e) => {
        e.preventDefault()
        void navigator.clipboard.writeText(copy)
      }}
    >
      {display}
    </button>
  )
}

export default CopyToClipBoardButton
