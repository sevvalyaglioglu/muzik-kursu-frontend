import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  
  // Form Verileri (time eklendi)
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [quota, setQuota] = useState(10);
  const [time, setTime] = useState(""); // YENİ

  const [editMode, setEditMode] = useState(false); 
  const [editingCourseId, setEditingCourseId] = useState(null); 
  
  // Modal Verileri
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState([]);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("https://muzik-kursu-backend.onrender.com/courses");
      // DİKKAT: Artık filtreleme yapmıyoruz, TÜM kursları state'e atıyoruz.
      // Sıralama yapalım: En yeni en üstte olsun
      setCourses(res.data.reverse());
    } catch (error) {
      console.error("Kurslar çekilemedi", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.patch(`https://muzik-kursu-backend.onrender.com/courses/${editingCourseId}`, {
          title, description: desc, quota: Number(quota), time
        });
        alert("Güncellendi!");
        setEditMode(false); setEditingCourseId(null);
      } else {
        await axios.post("https://muzik-kursu-backend.onrender.com/courses", {
          title, description: desc, quota: Number(quota), time,
          teacherId: user.sub || user.id
        });
        alert("Eklendi!");
      }
      setTitle(""); setDesc(""); setQuota(10); setTime("");
      fetchCourses(); 
    } catch (error) { alert("Hata: " + error.message); }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Silmek istiyor musunuz?")) {
      try {
        await axios.delete(`https://muzik-kursu-backend.onrender.com/courses/${courseId}`);
        fetchCourses();
      } catch (error) { alert("Silinemedi"); }
    }
  };

  const startEditing = (course) => {
    setEditMode(true);
    setEditingCourseId(course.id);
    setTitle(course.title); setDesc(course.description); setQuota(course.quota); setTime(course.time || "");
    window.scrollTo(0, 0);
  };

  const openStudentList = (course) => {
    const students = course.enrollments ? course.enrollments.map(e => e.student) : [];
    setSelectedCourseStudents(students);
    setSelectedCourseTitle(course.title);
    setShowModal(true);
  };

  return (
    <div className="container mt-5 position-relative">
      
      {/* ÖĞRENCİ LİSTESİ MODALI */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark">📋 {selectedCourseTitle}</h5>
              <button onClick={() => setShowModal(false)} className="btn btn-sm btn-light border">✖</button>
            </div>
            
            {selectedCourseStudents.length === 0 ? (
              <p className="text-danger small">Henüz kayıtlı öğrenci yok.</p>
            ) : (
              <ul className="list-group list-group-flush" style={{maxHeight: "300px", overflowY: "auto"}}>
                {selectedCourseStudents.map((std, index) => (
                  <li key={index} className="list-group-item d-flex align-items-center">
                    <span className="badge bg-light text-dark me-2 border">{index + 1}</span>
                    {std.fullName} <span className="text-muted small ms-2">({std.age})</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowModal(false)} className="btn btn-secondary w-100 mt-3 btn-sm">Kapat</button>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">🎹 Öğretmen Paneli</h2>
          <p className="text-muted">Hoş geldin, <span className="text-primary fw-bold">{user.firstName}</span> Hocam.</p>
        </div>
        <div className="text-white p-3 fs-6 rounded-pill" style={{ background: "#b691e3" }}>
          Sistemdeki Toplam Kurs: {courses.length}
        </div>
      </div>

      <div className="row g-4">
        {/* SOL: Form Alanı */}
        <div className="col-md-4">
          <div className={`card shadow-sm h-100 ${editMode ? "border-warning border-2" : ""}`}>
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold text-black">{editMode ? "✏️ Kursu Düzenle" : "✨ Yeni Kurs Oluştur"}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Kurs Başlığı</label>
                  <input className="form-control bg-light" placeholder="Örn: Piyano 101" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                
                {/* YENİ: SAAT SEÇİMİ */}
                <div className="mb-3">
                  <label className="form-label small text-muted">Ders Günü ve Saati</label>
                  <select className="form-select bg-light" value={time} onChange={e => setTime(e.target.value)} required>
                    <option value="">Seçiniz...</option>
                    <option value="Pazartesi 10:00">Pazartesi 10:00</option>
                    <option value="Pazartesi 14:00">Pazartesi 14:00</option>
                    <option value="Salı 11:00">Salı 11:00</option>
                    <option value="Çarşamba 15:00">Çarşamba 15:00</option>
                    <option value="Cumartesi 09:00">Cumartesi 09:00</option>
                    <option value="Cumartesi 13:00">Cumartesi 13:00</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Açıklama</label>
                  <textarea className="form-control bg-light" rows="3" placeholder="Kurs hakkında..." value={desc} onChange={e => setDesc(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label small text-muted">Kontenjan</label>
                  <input type="number" className="form-control bg-light" value={quota} onChange={e => setQuota(e.target.value)} required />
                </div>
                <button className="btn w-100 text-white" style={{ backgroundColor: "#b691e3" }}>{editMode ? "Kaydet" : "Yayınla"}</button>
                {editMode && <button type="button" onClick={() => setEditMode(false)} className="btn btn-sm btn-outline-secondary w-100 mt-2">Vazgeç</button>}
              </form>
            </div>
          </div>
        </div>

        {/* SAĞ: Kurs Listesi */}
        <div className="col-md-8">
          <h5 className="mb-3 fw-bold">Tüm Kurslar</h5>
          <div className="row">
            {courses.map(course => {
              // BU KURS BENİM Mİ KONTROLÜ
              // user.sub (token ID'si) ile kursun hoca ID'sini karşılaştırıyoruz
              const isMyCourse = course.teacher?.id === user.sub || course.teacher?.id === user.id;

              return (
                <div key={course.id} className="col-md-6 mb-3">
                  <div className={`card h-100 border-start border-4 ${isMyCourse ? 'border-primary' : 'border-secondary'}`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold">{course.title}</h5>
                        {isMyCourse && <span className="badge bg-primary">Sizin Kursunuz</span>}
                      </div>
                      
                      {/* SAAT BİLGİSİ */}
                      <div className="mb-2">
                        <span className="badge bg-light text-dark border">🕒 {course.time || "Belirtilmedi"}</span>
                        <span className="badge bg-light text-secondary border ms-1">Kontenjan: {course.quota}</span>
                      </div>

                      <p className="card-text text-muted small">{course.description}</p>
                      
                      {/* HOCA İSMİ (Başkasıysa gösterelim) */}
                      {!isMyCourse && (
                         <p className="small text-muted fst-italic border-top pt-2">
                           Eğitmen: {course.teacher?.firstName} {course.teacher?.lastName}
                         </p>
                      )}

                      {/* İŞLEM BUTONLARI (Sadece benimse) */}
                      {isMyCourse && (
                        <div className="mt-3 d-flex gap-2">
                           <button onClick={() => startEditing(course)} className="btn btn-sm btn-outline-warning flex-fill">✏️ Düzenle</button>
                           <button onClick={() => handleDelete(course.id)} className="btn btn-sm btn-outline-danger flex-fill">🗑️ Sil</button>
                        </div>
                      )}
                      
                      {/* ÖĞRENCİLERİ GÖR (Herkese Açık) */}
                      <button 
                        onClick={() => openStudentList(course)}
                        className="btn btn-sm w-100 mt-2 text-white"
                        style={{ backgroundColor: "#34495e" }}
                      >
                        👁️ Öğrencileri Gör
                      </button>

                    </div>
                    <div className="card-footer bg-white border-0 d-flex justify-content-between text-muted small">
                      <span>🧑🏻‍🎓 {course.enrollments ? course.enrollments.length : 0} Kayıtlı</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeacherDashboard;