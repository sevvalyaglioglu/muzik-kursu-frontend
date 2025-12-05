import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Yeni Öğrenci Formu İçin
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [instrument, setInstrument] = useState("");

  // Kayıt işlemi için seçilenler
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    fetchMyStudents();
    fetchAllCourses();
  }, []);

  // 1. Bu veliye ait çocukları getir
  const fetchMyStudents = async () => {
    try {
      const res = await axios.get("https://muzik-kursu-backend.onrender.com/students");
      const myKids = res.data.filter(s => s.parent?.id === user.sub || s.parent?.id === user.id);
      setStudents(myKids);
    } catch (error) {
      console.error("Öğrenciler gelmedi", error);
    }
  };

  // 2. Tüm açık kursları getir
  const fetchAllCourses = async () => {
    try {
      const res = await axios.get("https://muzik-kursu-backend.onrender.com/courses");
      setCourses(res.data);
    } catch (error) {
      console.error("Kurslar gelmedi", error);
    }
  };

  // 3. Yeni çocuk ekle
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://muzik-kursu-backend.onrender.com/students", {
        fullName: studentName,
        age: Number(studentAge),
        instrumentInterest: instrument,
        parentId: user.sub || user.id
      });
      alert("Çocuğunuz eklendi!");
      setStudentName(""); setStudentAge(""); setInstrument("");
      fetchMyStudents(); // Listeyi güncelle
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  // 4. Kursa Kayıt Yap (Enroll)
  const handleEnroll = async (courseId) => {
    if (!selectedStudentId) {
      alert("Lütfen önce yukarıdan veya listeden kayıt edilecek çocuğu seçin!");
      return;
    }
    try {
      await axios.post("https://muzik-kursu-backend.onrender.com/enrollments", {
        studentId: Number(selectedStudentId),
        courseId: Number(courseId)
      });
      alert("Kayıt başarılı!");
      fetchMyStudents(); // Çocuğun kurs listesi güncellensin diye tekrar çekiyoruz
    } catch (error) {
      alert("Kayıt başarısız (Belki zaten kayıtlıdır?)");
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold display-6">🎸 Veli Portalı</h2>
        <p className="text-muted">Çocuklarınızın müzik eğitimini buradan yönetin.</p>
      </div>

      <div className="row g-5">
        {/* SOL: Aile Yönetimi */}
        <div className="col-md-4">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
            
            {/* Kart Başlığı */}
            <div className="card-header border-0 bg-white pt-4 pb-0">
              <h4 className="fw-bold" style={{ color: "#7d44c2" }}>
              👶🏻 Çocuklarım
              </h4>
              <p className="text-muted small">Kayıtlı öğrenci listesi</p>
            </div>

            <div className="card-body p-4">
              
              {/* Çocuk Listesi */}
              <div className="list-group mb-4">
                {students.map(std => (
                  <label 
                    key={std.id} 
                    className="list-group-item list-group-item-action p-3 mb-2 border-0 shadow-sm"
                    style={{ borderRadius: "15px", backgroundColor: "#f8f9fa", cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <input 
                        className="form-check-input me-3" 
                        type="radio" 
                        name="selectKid" 
                        style={{ transform: "scale(1.3)", accentColor: "#7d44c2" }} 
                        onChange={() => setSelectedStudentId(std.id)}
                      />
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">{std.fullName}</h6>
                        <small className="text-muted">{std.age} Yaş • 🎵 {std.instrumentInterest}</small>
                      </div>
                    </div>

                    {/* --- YENİ EKLENEN KISIM: KAYITLI OLDUĞU KURSLAR --- */}
                    <div className="mt-2 ms-4">
                      {std.enrollments && std.enrollments.length > 0 ? (
                        std.enrollments.map(enr => (
                          <span key={enr.id} className="badge bg-white text-dark border me-1 mb-1 shadow-sm">
                            🎼 {enr.course.title}
                          </span>
                        ))
                      ) : (
                        <small className="text-muted fst-italic ms-1" style={{fontSize: "0.75rem"}}>
                          Henüz kayıtlı kurs yok
                        </small>
                      )}
                    </div>
                    {/* ------------------------------------------------ */}

                  </label>
                ))}
              </div>

              <hr className="text-muted opacity-25" />
              
              {/* Yeni Ekleme Formu */}
              <h6 className="mt-4 mb-3 fw-bold text-secondary">Yeni Öğrenci Ekle</h6>
              <form onSubmit={handleAddStudent}>
                <div className="mb-2">
                  <input 
                    className="form-control border-0" 
                    placeholder="Ad Soyad" 
                    style={{ backgroundColor: "#f1f2f6", borderRadius: "10px", padding: "12px" }}
                    value={studentName} 
                    onChange={e=>setStudentName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="row g-2">
                  <div className="col-4">
                    <input 
                      type="number" 
                      className="form-control border-0" 
                      placeholder="Yaş" 
                      style={{ backgroundColor: "#f1f2f6", borderRadius: "10px", padding: "12px" }}
                      value={studentAge} 
                      onChange={e=>setStudentAge(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="col-8">
                    <input 
                      className="form-control border-0" 
                      placeholder="İlgi Alanı" 
                      style={{ backgroundColor: "#f1f2f6", borderRadius: "10px", padding: "12px" }}
                      value={instrument} 
                      onChange={e=>setInstrument(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  className="btn w-100 text-white shadow-sm mt-3 fw-bold"
                  style={{ backgroundColor: "#7d44c2", border: "none", padding: "12px", borderRadius: "10px" }}
                >
                  Listeye Ekle
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* SAĞ: Kurs Vitrini */}
        <div className="col-md-8">
          <h4 className="mb-4 text-secondary">Mevcut Kurslar</h4>
          <div className="row g-3">
            {courses.map(course => (
              <div key={course.id} className="col-md-6 col-lg-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="badge rounded-pill text-white"
                      style={{ backgroundColor: "#ebbcbc" }}>Müzik</span>
                      <small className="text-muted">Kontenjan: {course.quota}</small>
                    </div>
                    <h5 className="card-title fw-bold">{course.title}</h5>
                    <p className="card-text text-muted small line-clamp-2">{course.description}</p>
                    
                    <div className="d-grid mt-4">
                      <button 
                        className="btn text-white shadow-sm"
                        style={{ backgroundColor: "#7d44c2", border: "none" }}
                        onClick={() => handleEnroll(course.id)}
                      >
                        Kayıt Ol ➜
                      </button>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-0 small text-center">
                    Eğitmen: <strong>{course.teacher?.firstName} {course.teacher?.lastName}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ParentDashboard;