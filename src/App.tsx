import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import { StudyIndex, SectionPage, TopicPage } from './pages/Study'
import Practice from './pages/Practice'
import Exam from './pages/Exam'
import Runner from './pages/Runner'
import Results from './pages/Results'
import ProgressPage from './pages/Progress'
import Mistakes from './pages/Mistakes'
import Auth from './pages/Auth'
import Account from './pages/Account'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/study" element={<StudyIndex />} />
            <Route path="/study/:section" element={<SectionPage />} />
            <Route path="/study/:section/:topic" element={<TopicPage />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/run" element={<Runner />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/mistakes" element={<Mistakes />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
