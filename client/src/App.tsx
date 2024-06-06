import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          {/* take any path nd redirect to Home */}
          <Route path="/*" element={<Home />} />
  
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
