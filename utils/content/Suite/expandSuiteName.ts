const expandSuiteName = (
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
  const names = [...returnContent.matchAll(/<div data-name><\/div>/gi)]

  if (names.length) {
    for (const { 0: match, index } of names.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<div>${suite.name}</div>` +
        returnContent.slice(index! + match.length)
    }
  }

  return returnContent
}

export default expandSuiteName
