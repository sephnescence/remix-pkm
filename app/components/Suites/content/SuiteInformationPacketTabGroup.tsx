const SuiteInformationPacketTabHeader = ({
  tabGroupInputName,
  name,
  tabContent,
  defaultChecked,
}: {
  tabGroupInputName: string
  name: string
  tabContent: React.ReactNode
  defaultChecked?: boolean
}) => {
  const key = `k-${name}`
  return (
    <div
      className={`innsight-suite-information-packet-tab-header has-[.innsight-tab-group:checked]:bg-indigo-800 peer peer/${name}`}
    >
      <input
        key={key}
        className="absolute -top-96 -left-96 innsight-tab-group"
        type="radio"
        name={tabGroupInputName}
        id={`${tabGroupInputName}--tab--${name}`}
        defaultChecked={defaultChecked === true}
      />
      <label
        htmlFor={`${tabGroupInputName}--tab--${name}`}
        className="flex text-nowrap m-2"
      >
        {tabContent}
      </label>
    </div>
  )
}

const SuiteInformationPacketTabContent = ({
  tabGroupInputName,
  name,
  content,
  className,
}: {
  tabGroupInputName: string
  name: string
  content: React.ReactNode
  className: string
}) => {
  return (
    <div
      className={`innsight-suite-information-packet-tab-content hidden ${className}`}
      id={`${tabGroupInputName}--content--${name}`}
    >
      {content}
    </div>
  )
}

type SuiteInformationPacketTabGroupProps = {
  tabGroupInputName: string
  tabs: {
    tabDefaultChecked?: boolean
    tabName: string
    tabHeader: React.ReactNode
    tabContent: React.ReactNode
    tabContentClassName: string
  }[]
}

const SuiteInformationPacketTabGroup = ({
  suiteInformationPacketTabGroupProps,
}: {
  suiteInformationPacketTabGroupProps: SuiteInformationPacketTabGroupProps
}) => {
  return (
    <div className="group">
      <div className="flex items-center justify-center peer mb-2">
        {suiteInformationPacketTabGroupProps.tabs.map((tab) => {
          return (
            <SuiteInformationPacketTabHeader
              key={`h-${tab.tabName}`}
              tabGroupInputName={
                suiteInformationPacketTabGroupProps.tabGroupInputName
              }
              name={tab.tabName}
              tabContent={tab.tabHeader}
              defaultChecked={tab.tabDefaultChecked}
            />
          )
        })}
      </div>
      {suiteInformationPacketTabGroupProps.tabs.map((tab) => {
        return (
          <SuiteInformationPacketTabContent
            key={`c-${tab.tabName}`}
            tabGroupInputName={
              suiteInformationPacketTabGroupProps.tabGroupInputName
            }
            name={tab.tabName}
            content={tab.tabContent}
            className={tab.tabContentClassName}
          />
        )
      })}
    </div>
  )
}

export default SuiteInformationPacketTabGroup
