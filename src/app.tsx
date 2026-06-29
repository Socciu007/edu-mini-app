import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { App, SnackbarProvider, ZMPRouter } from 'zmp-ui'

import { TabBar } from './components/tab-bar'
import { useThemeEffect } from './hooks/use-theme-effect'
import ChatPage from './pages/chat'
import ReviewPage from './pages/review'
import SettingsPage from './pages/settings'
import SurveyPage from './pages/survey'
import UserPage from './pages/user'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2 },
  },
})

function ShellLayout() {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

const MyApp = () => {
  useThemeEffect()
  return (
    <App>
      <Suspense>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <ZMPRouter>
              <Routes>
                <Route element={<ShellLayout />}>
                  <Route path="/" element={<ChatPage />} />
                  <Route path="/survey" element={<SurveyPage />} />
                  <Route path="/review" element={<ReviewPage />} />
                  <Route path="/user" element={<UserPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </ZMPRouter>
          </SnackbarProvider>
        </QueryClientProvider>
      </Suspense>
    </App>
  )
}
export default MyApp
