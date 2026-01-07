import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  
  // Backend Adresi (Render)
  const API_URL = process.env.REACT_APP_API_URL;


  // Form Verileri
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PARENT" // Varsayılan olarak Veli seçili gelsin
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend'e kayıt isteği atıyoruz (DÜZELTİLDİ: /users endpoint'ine gidiyor)
      await axios.post(`${API_URL}/users`, formData);
      
      alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
      navigate("/login"); // Kayıt bitince Giriş sayfasına yönlendir

    } catch (error) {
      console.log("Detaylı Hata:", error.response?.data);
      
      const mesaj = error.response?.data?.message || "Kayıt Başarısız";
      // Mesaj dizi gelirse (validasyon hatası) string'e çevir
      alert("Hata: " + (Array.isArray(mesaj) ? mesaj.join(", ") : mesaj)); 
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="col-md-6 col-lg-5">
        <div className="card border-0 shadow-lg p-4" style={{ borderRadius: "20px" }}>
          <div className="card-body">
            <div className="text-center mb-4">
              <h2 className="fw-bold" style={{ color: "#7d44c2" }}>🚀 Aramıza Katıl</h2>
              <p className="text-muted">Müzik yolculuğuna başlamak için hesap oluştur.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small text-muted">Ad</label>
                  <input name="firstName" className="form-control bg-light border-0 py-2" onChange={handleChange} required />
                </div>
                <div className="col-6">
                  <label className="form-label small text-muted">Soyad</label>
                  <input name="lastName" className="form-control bg-light border-0 py-2" onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Email Adresi</label>
                <input type="email" name="email" className="form-control bg-light border-0 py-2" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Şifre</label>
                <input type="password" name="password" className="form-control bg-light border-0 py-2" onChange={handleChange} required />
              </div>

              <div className="mb-4">
                <label className="form-label small text-muted">Hesap Türü</label>
                <select name="role" className="form-select border-0 bg-light py-2" onChange={handleChange}>
                  <option value="PARENT">Öğrenci Velisi</option>
                  <option value="TEACHER">Eğitmen (Öğretmen)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn w-100 text-white fw-bold py-3 shadow-sm"
                style={{ backgroundColor: "#7d44c2", borderRadius: "10px" }}
              >
                Kayıt Ol
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted">Zaten hesabın var mı? </span>
              <Link to="/login" className="text-decoration-none fw-bold" style={{ color: "#7d44c2" }}>
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;