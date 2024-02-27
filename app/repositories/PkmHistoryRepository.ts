import { PkmHistory } from '@prisma/client'

type PkmHistoryItemForDashboard = Omit<PkmHistory, 'user_id' | 'is_current'> & {
  epiphany_item?: { content: string } | null
} & { inbox_item?: { content: string } | null } & {
  passing_thought_item?: { content: string } | null
} & { todo_item?: { content: string } | null } & {
  void_item?: { content: string } | null
}

export type PkmHistoryForDashboard = {
  history: PkmHistoryItemForDashboard[]
}
