const SpaceItemSummaryPreview = ({
  icon,
  iconText,
}: {
  icon: React.ReactNode
  iconText: string
}) => {
  return (
    <div className="bg-indigo-950 h-8 m-1 py-1 px-3 rounded-lg">
      <div className="flex gap-1 w-full rounded-lg">
        {icon}
        <div className="flex-grow w-full">{iconText}</div>
      </div>
    </div>
  )
}

export default SpaceItemSummaryPreview
