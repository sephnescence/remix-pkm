export const feModelTypeMap = {
  epiphany: 'Epiphany',
  inbox: 'Inbox',
  'passing-thought': 'Passing Thought',
  todo: 'Todo',
  trash: 'Trash',
  void: 'Void',
}

export const historyModelTypeMap = {
  PkmEpiphany: 'epiphany_item',
  PkmInbox: 'inbox_item',
  PkmPassingThought: 'passing_thought_item',
  PkmTodo: 'todo_item',
  PkmTrash: 'trash_item',
  PkmVoid: 'void_item',
}

export const modelTypeMap = {
  epiphany: 'Epiphany',
  inbox: 'Inbox',
  'passing-thought': 'PassingThought',
  todo: 'Todo',
  trash: 'Trash',
  void: 'Void',
}

export const modelTypeToHistoryModelNameMap = {
  epiphany: 'epiphany',
  inbox: 'inbox',
  'passing-thought': 'passing_thought',
  todo: 'todo',
  trash: 'trash',
  void: 'void',
}

export const modelTypeSlugToHistoryModelType = {
  epiphany: 'PkmEpiphany',
  inbox: 'PkmInbox',
  'passing-thought': 'PkmPassingThought',
  todo: 'PkmTodo',
  trash: 'PkmTrash',
  void: 'PkmVoid',
}

export const historyModelTypeToModelTypeSlug = {
  PkmEpiphany: 'epiphany',
  PkmInbox: 'inbox',
  PkmPassingThought: 'passing-thought',
  PkmTodo: 'todo',
  PkmTrash: 'trash',
  PkmVoid: 'void',
}

export const parseParams = (params: string[]) => {
  const tempArgs: {
    [key: string]: string
  } = {}

  for (let i = 0; i < params.length; i += 2) {
    tempArgs[decodeURI(params[i])] = decodeURI(params[i + 1])
  }

  return tempArgs
}
