import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import App from '@/App'
import './index.css'

const api = import.meta.env.VITE_API_URL
if (api && !api.startsWith('http')) {
  document.body.innerHTML =
    '<p style="padding:2rem;color:red">VITE_API_URL invalid. Use empty string or http://...</p>'
  throw new Error('Invalid VITE_API_URL')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
