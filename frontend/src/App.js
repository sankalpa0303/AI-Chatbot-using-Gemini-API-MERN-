import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import History from './components/History';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import About from './components/about';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<RequireAuth><Chatbot /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
