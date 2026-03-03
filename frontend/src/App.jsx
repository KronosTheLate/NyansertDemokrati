import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import VotingPage from './pages/VotingPage'
import DistributionPage from './pages/DistributionPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stem" element={<VotingPage />} />
          <Route path="/påstander" element={<DistributionPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
