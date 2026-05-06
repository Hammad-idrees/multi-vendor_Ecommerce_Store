import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import App from './App'
import './styles/index.css'

import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/common/Toast'
import { ThemeProvider } from './context/ThemeContext'
import { ComparisonProvider } from './context/ComparisonContext'
import { CurrencyProvider } from './context/CurrencyContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <AuthProvider>
                <ThemeProvider>
                    <ComparisonProvider>
                        <CurrencyProvider>
                            <ToastProvider>
                                <App />
                            </ToastProvider>
                        </CurrencyProvider>
                    </ComparisonProvider>
                </ThemeProvider>
            </AuthProvider>
        </Provider>
    </React.StrictMode>,
)
