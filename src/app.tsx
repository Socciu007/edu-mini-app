import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { Outlet, Route } from 'react-router-dom'
import { AnimationRoutes, App, SnackbarProvider, ZMPRouter } from 'zmp-ui'

import { TabBar } from './components/tab-bar'
import ChatPage from './pages/chat'
import ReviewPage from './pages/review'
import SurveyPage from './pages/survey'
import UserPage from './pages/user'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2 },
  },
})

function ShellLayout() {
  return (
    <div className="min-h-screen pb-16">
      <Outlet />
      <TabBar />
    </div>
  )
}

const MyApp = () => {
  return (
    <App>
      <Suspense>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <ZMPRouter>
              <AnimationRoutes>
                <Route element={<ShellLayout />}>
                  <Route path="/" element={<ChatPage />} />
                  <Route path="/survey" element={<SurveyPage />} />
                  <Route path="/review" element={<ReviewPage />} />
                  <Route path="/user" element={<UserPage />} />
                </Route>
              </AnimationRoutes>
            </ZMPRouter>
          </SnackbarProvider>
        </QueryClientProvider>
      </Suspense>
    </App>
  )
}
export default MyApp
