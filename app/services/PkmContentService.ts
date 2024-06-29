import { db } from '@/utils/db'
import { PkmContentInput } from '~/repositories/PkmContentRepository'

export const determineSyncContentsTransactions = ({
  contents,
}: {
  contents: PkmContentInput[]
}) => {
  // PkmContentInput should have an item called "status" added to it. The frontend does know if something
  //    has been updated, is new, or has had no change
  // PkmContentInput should have an item called "summarises_pkm_content_id" added to it. See
  //     "progressive summarisation" below
  // PkmContentInput should have an item called "summarised_by_pkm_content_id" added to it. See
  //     "progressive summarisation" below

  // Updating an item will generally result in the creation of new PkmContents rows, (including all summarisations) as
  //    as the history_id changes. There could a future optimisation to minimise wasteful data storage

  // In the future, I will offer "progressive summarisation" as outlined in "Building a Second Brain" by Tiago
  //  Forte, where a new PkmContent will reference the PkmContent it's summarising with (parent_content_id), and the
  //  PkmContent that's being summarised will reference which PkmContent is summarising it
  return contents.map((content) => {
    return {
      outcome: 'Create',
      queryDescription: `Create pkmContents - ${content.id}`,
      query: db.pkmContents.create({
        data: {
          content_id: content.id,
          model_id: content.modelId,
          history_id: content.historyId,
          sort_order: content.sortOrder,
          content: content.content,
        },
      }),
    }
  })
}
