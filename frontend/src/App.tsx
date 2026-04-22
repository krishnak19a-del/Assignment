import { BrowserRouter, Routes, Route } from "react-router"
import { UploadScreen } from "./pages/UploadScreen"
import { Dashboard } from "./pages/Dashboard"
import { HouseholdList } from "./pages/HouseholdList"
import { HouseholdDetail } from "./pages/HouseholdDetail"
import { Insights } from "./pages/Insights"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/dashboard" element={<Dashboard />} >
          <Route index element={<HouseholdList />} />
          <Route path="households" element={<HouseholdList />} />
          <Route path="household/:id" element={<HouseholdDetail />} />
          <Route path="insights" element={<Insights />} />
        </Route>
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App