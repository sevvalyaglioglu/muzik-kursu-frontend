import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  
  // Form verileri
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [quota, setQuota] = useState(10);
  
  // Tarih ve Saat
  const [selectedDay, setSelectedDay] = useState("Pazartesi");
  const [selectedTime, setSelectedTime] = useState("12:00");

  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  // Düzenleme Modu
  const [editMode, setEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  // Backend Adresi (Render)
  const API_URL = process.env.REACT_APP_API_URL;


  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  // 1. Kursları Getir
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses`);
      setCourses(res.data);
    } catch (error) {
      console.error("Kurslar alınamadı", error);
    }
  };

  // 2. Kurs Ekle veya Güncelle
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalTime = `${selectedDay} ${selectedTime}`;

    try {
      if (editMode) {
        // GÜNCELLEME (PATCH)
        await axios.patch(`${API_URL}/courses/${editingCourseId}`, {
          title, 
          description: desc, 
          quota: Number(quota),
          time: finalTime
        });
        alert("Kurs güncellendi! ✅");
        setEditMode(false); 
        setEditingCourseId(null);
      } else {
        // YENİ EKLEME (POST)
        await axios.post(`${API_URL}/courses`, {
          title, 
          description: desc, 
          quota: Number(quota),
          time: finalTime,
          teacherId: user.sub || user.id
        });
        alert("Yeni kurs oluşturuldu! 🎉");
      }
      
      // Formu sıfırla
      setTitle(""); setDesc(""); setQuota(10); 
      setSelectedDay("Pazartesi"); setSelectedTime("12:00");
      fetchCourses(); 

    } catch (error) {
      console.error(error);
      alert("İşlem hatası: " + error.message);
    }
  };

  // 3. Kurs Silme
  const handleDelete = async (courseId) => {
    if(!window.confirm("Bu kursu silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`${API_URL}/courses/${courseId}`);
      alert("Kurs silindi. 🗑️");
      fetchCourses();
    } catch (error) {
      alert("Silinemedi.");
    }
  };

  const handleEditClick = (course) => {
    setEditMode(true);
    setEditingCourseId(course.id);
    setTitle(course.title);
    setDesc(course.description);
    setQuota(course.quota);

    if (course.time && course.time.includes(" ")) {
        const parts = course.time.split(" ");
        setSelectedDay(parts[0]);
        setSelectedTime(parts[1]);
    } else {
        setSelectedDay("Pazartesi");
        setSelectedTime("12:00");
    }
    window.scrollTo(0,0);
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold display-6">🎹 Öğretmen Paneli</h2>
        <p className="text-muted">Kurslarınızı yönetin ve diğer kursları inceleyin.</p>
      </div>

      <div className="row g-5">
        
        {/* SOL: Kurs Ekleme Formu */}
        <div className="col-md-4">
          <div className="card border-0 shadow-lg" style={{ borderRadius: "20px" }}>
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold" style={{ color: "#7d44c2" }}>
                {editMode ? "✏️ Kursu Düzenle" : "➕ Yeni Kurs Ekle"}
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Kurs Adı</label>
                  <input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Örn: Piyano"/>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Açıklama</label>
                  <textarea className="form-control" rows="3" value={desc} onChange={e=>setDesc(e.target.value)} required></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label small text-muted">Kontenjan</label>
                    <input type="number" className="form-control" value={quota} onChange={e=>setQuota(e.target.value)} required />
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label small text-muted">Gün</label>
                    <select className="form-select" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Saat</label>
                    <input type="time" className="form-control" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required/>
                  </div>
                </div>

                <button className="btn w-100 text-white fw-bold mt-2" style={{ backgroundColor: editMode ? "#ffc107" : "#7d44c2" }}>
                  {editMode ? "Değişiklikleri Kaydet" : "Kursu Oluştur"}
                </button>
                
                {editMode && (
                  <button type="button" className="btn btn-sm btn-link text-secondary w-100 mt-2"
                    onClick={() => { setEditMode(false); setEditingCourseId(null); setTitle(""); setDesc(""); setQuota(10); }}>
                    İptal Et
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* SAĞ: Kurs Listesi */}
        <div className="col-md-8">
          <h5 className="mb-4 text-secondary">Mevcut Kurslar</h5>
          <div className="row g-3">
            {courses.length === 0 ? (
              <div className="alert alert-light text-center">Hiç kurs bulunamadı.</div>
            ) : (
              courses.map(course => {
                // Yetki kontrolü
                const isMyCourse = (course.teacher?.id === user.sub || course.teacher?.id === user.id);
                // Öğrenci sayısı
                const studentCount = course.enrollments?.length || 0;

                return (
                  <div key={course.id} className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm hover-shadow" style={{ transition: "0.3s" }}>
                      <div className="card-body">
                        {/* Başlık ve Tarih */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-bold text-dark mb-0">{course.title}</h5>
                          <span className="badge bg-light text-dark border">📅 {course.time || "Belirtilmedi"}</span>
                        </div>
                        
                        <p className="text-muted small line-clamp-2">{course.description}</p>
                        
                        <div className="small text-muted mb-3 border-bottom pb-2">
                            🎓 Eğitmen: <strong>{course.teacher?.firstName} {course.teacher?.lastName}</strong>
                        </div>

                        {/* ✨ ÖĞRENCİ LİSTESİ ✨ */}
                        <div className="mt-3">
                            <details className="group">
                                <summary className="d-flex align-items-center justify-content-between p-2 rounded" 
                                         style={{backgroundColor: "#f8f9fa", cursor: "pointer", listStyle: "none"}}>
                                    <span className="fw-bold small text-secondary">
                                        👥 Kayıtlı Öğrenciler
                                    </span>
                                    <span className="badge rounded-pill" style={{backgroundColor: "#7d44c2"}}>
                                        {studentCount}
                                    </span>
                                </summary>
                                
                                <div className="mt-2" style={{maxHeight: "200px", overflowY: "auto"}}>
                                    {studentCount > 0 ? (
                                        course.enrollments.map(enr => (
                                            <div key={enr.id} className="d-flex align-items-center p-2 mb-2 bg-white border rounded shadow-sm">
                                                {/* İkon */}
                                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-2" 
                                                     style={{width: "30px", height: "30px", backgroundColor: "#b197fc", fontSize: "12px"}}>
                                                    {enr.student?.fullName?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                {/* Bilgiler */}
                                                <div className="lh-1">
                                                    <div className="fw-bold text-dark small">{enr.student?.fullName}</div>
                                                    <small className="text-muted" style={{fontSize: "0.7rem"}}>
                                                        {enr.student?.age} Yaşında
                                                    </small>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-2 text-muted small fst-italic">
                                            Henüz kayıtlı öğrenci yok.
                                        </div>
                                    )}
                                </div>
                            </details>
                        </div>
                        
                        {/* Butonlar */}
                        {isMyCourse && (
                            <div className="d-flex justify-content-end mt-3 pt-2 border-top">
                              <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEditClick(course)}>
                                ✏️ Düzenle
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(course.id)}>
                                🗑️ Sil
                              </button>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;