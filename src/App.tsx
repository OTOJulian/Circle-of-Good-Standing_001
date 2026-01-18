import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CirclePage } from './pages/CirclePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/circle/:token" element={<CirclePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
