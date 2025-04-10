import "./index.scss"
import { store } from './store/index.js';
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

/*
    Entry point.
    Provides the app store and mounts the app
*/

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
        <App/>
    </Provider>
  </StrictMode>,
)
