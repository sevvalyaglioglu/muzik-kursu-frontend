import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Backend Adresi (Render)
  const API_URL = process.env.REACT_APP_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend'e istek atıyoruz
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      // Gelen token'ı sisteme kaydediyoruz
      login(response.data.access_token);
      
      // Giriş başarılıysa anasayfaya yönlendir
      navigate("/");
    } catch (err) {
      setError("Giriş başarısız! Email veya şifre hatalı.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="col-md-5">
        <div className="card login-card p-4 shadow-lg">
          <div className="card-body">
            <div className="text-center mb-4">
              <h2 className="fw-bold" style={{ color: "#000000" }} >🎵 NotaDefterim</h2>
              <p className="text-muted">Müzik Kursu Yönetim Sistemi</p>
            </div>

            {error && <div className="alert alert-danger rounded-3">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="floatingInput"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="floatingInput">Email Adresi</label>
              </div>
              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control"
                  id="floatingPassword"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="floatingPassword">Şifre</label>
              </div>
              <button type="submit" 
              className="btn w-100 py-3 fs-5 text-white" 
              style={{ backgroundColor: "#ebed82", borderColor: "#e5e83a", color: "#333" }}
              >
                <span style={{color: "#5c5c5c", fontWeight: "bold"}}>Giriş Yap</span>
              </button>
              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Hesabın yok mu? </span>
                <Link to="/register" className="text-decoration-none fw-bold small" style={{ color: "#242323" }}>
                   Hemen Kayıt Ol
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;