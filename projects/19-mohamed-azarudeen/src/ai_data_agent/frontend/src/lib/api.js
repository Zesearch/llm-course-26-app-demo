import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function uploadDataset(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/analysis/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data // DatasetMeta
}

export async function runAnalysis({ sessionId, query, model, e2bApiKey }) {
  const { data } = await api.post('/analysis/run', {
    session_id: sessionId,
    query,
    model,
    e2b_api_key: e2bApiKey,
  })
  return data // AnalysisResult
}

export async function checkHealth() {
  const { data } = await api.get('/health')
  return data
}
