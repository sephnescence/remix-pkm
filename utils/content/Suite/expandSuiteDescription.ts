const expandSuiteDescription = (
  returnContent: string,
  suite: {
    id: string
    name: string
    description: string
    content: string
    storeys: {
      id: string
      name: string
      description: string
      content: string
      suite_id: string
      spaces: {
        id: string
        name: string
        description: string
        content: string
        storey_id: string
      }[]
    }[]
  },
): string => {
  const descriptions = [
    ...returnContent.matchAll(/<div data-description><\/div>/gi),
  ]

  if (descriptions.length) {
    for (const { 0: match, index } of descriptions.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<div>${suite.description}</div>` +
        returnContent.slice(index! + match.length)
    }
  }

  return returnContent
}

export default expandSuiteDescription
