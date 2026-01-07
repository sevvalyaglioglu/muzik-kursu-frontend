import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard'; // Yeni ekledik
import ParentDashboard from './pages/ParentDashboard';   // Yeni ekledik
import { AuthContext } from './context/AuthContext';
import './App.css';
import Register from './pages/Register';

// Home bileşeninin içindeki return kısmı:
const Home = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      {/* Üst Menü (Navbar) */}
      <nav className="navbar navbar-light mb-5 px-3" style={{ background: "linear-gradient(90deg, #eef47f 0%, #eef56a 100%)", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <div className="container">
          
          {/* SOL TARA: Logo ve İsim */}
          <span className="navbar-brand d-flex align-items-center fw-bold" style={{ fontSize: "1.5rem", color: "#444" }}>
            {/* Sol Anahtarı Görseli */}
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2907/2907253.png" 
              alt="logo" 
              width="45" 
              height="45" 
              className="me-2" 
            />
            NotaDefterim
          </span>

          {/* SAĞ TARAF: Kullanıcı Bilgisi ve Çıkış */}
          <div className="d-flex align-items-center">
            
            {/* Profil Bölümü: İkon + İsim */}
            <div className="d-flex align-items-center me-4 bg-white px-3 py-1 rounded-pill shadow-sm">
              {/* 1. İKON: Role göre değişen görsel */}
              <img 
                src={user?.role === 'TEACHER' 
                  ? "https://cdn-icons-png.flaticon.com/512/9291/9291430.png" // Öğretmen (Sunum yapan)
                  : "https://cdn-icons-png.flaticon.com/512/4161/4161385.png" // Veli (Aile tablosu)
                }
                alt="rol"
                width="32"
                height="32"
                className="me-2"
              />

              {/* 2. İSİM: Daha yumuşak renk tonları */}
              <div className="d-flex flex-column" style={{ lineHeight: "1.1" }}>
                <span className="fw-bold" style={{ color: "#555", fontSize: "0.9rem" }}> {/* Yumuşak Koyu Gri */}
                  {user?.firstName}
                </span>
                <small style={{ color: "#888", fontSize: "0.75rem" }}> {/* Açık Gri Rol Yazısı */}
                  {user?.role === 'TEACHER' ? 'Eğitmen' : 'Öğrenci Velisi'}
                </small>
              </div>
            </div>
            
            {/* Çıkış Butonu (Mor Rengi Koruduk) */}
            <button 
              onClick={logout} 
              className="btn text-white shadow-sm px-3 py-2"
              style={{ 
                backgroundColor: "#a67bdb", 
                border: "none", 
                borderRadius: "50%", // Tam yuvarlak buton
                width: "45px",
                height: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Çıkış Yap"
            >
              ➜
            </button>
          </div>
        </div>
      </nav>

      {/* Role Göre İçerik Göster */}
      {user?.role === 'TEACHER' ? <TeacherDashboard /> : <ParentDashboard />}
    </div>
  );
};

// ... App fonksiyonu ve export ...

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;