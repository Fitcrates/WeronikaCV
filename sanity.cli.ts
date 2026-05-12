import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './src/sanity/env'

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: { appId: 'bp97q5km10attvtdnct7jx5f' },
})
