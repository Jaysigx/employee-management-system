import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Placeholder routes for now */}
        <Route path="/dashboard" element={<div>Employee Dashboard</div>} />
        <Route path="/manager" element={<div>Manager Panel</div>} />
        <Route path="/admin" element={<div>Admin Panel</div>} />
      </Routes>
    </Router>
  );
}

export default App;
