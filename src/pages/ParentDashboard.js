import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Form Verileri
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState(5); 
  const [instrument, setInstrument] = useState("");
  
  // Düzenleme Modu
  const [editMode, setEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Kayıt işlemi için seçilenler
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Scroll için referans
  const formRef = useRef(null);

  // Yaş Listesi (5-18)
  const ageOptions = Array.from({ length: 14 }, (_, i) => i + 5);

  // Backend Adresi (Render)
  const API_URL = process.env.REACT_APP_API_URL;


  useEffect(() => {
    fetchMyStudents();
    fetchAllCourses();
    // eslint-disable-next-line
  }, []);

  // 1. Öğrencileri Getir
  const fetchMyStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      const myKids = res.data.filter(s => s.parent?.id === user.sub || s.parent?.id === user.id);
      setStudents(myKids);
    } catch (error) {
      console.error("Öğrenciler gelmedi", error);
    }
  };

  // 2. Kursları Getir
  const fetchAllCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses`);
      setCourses(res.data);
    } catch (error) {
      console.error("Kurslar gelmedi", error);
    }
  };

  // 3. Ekleme ve Güncelleme İşlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (editMode) {
        // GÜNCELLEME (PATCH)
        await axios.patch(`${API_URL}/students/${editingStudentId}`, {
          fullName: studentName,
          age: Number(studentAge),
          instrumentInterest: instrument,
        });
        alert("Öğrenci bilgileri güncellendi! ✅");
        
        // Modu ve formu sıfırla
        setEditMode(false);
        setEditingStudentId(null);
        setStudentName(""); 
        setStudentAge(5); 
        setInstrument("");

      } else {
        // YENİ EKLEME (POST)
        await axios.post(`${API_URL}/students`, {
          fullName: studentName,
          age: Number(studentAge),
          instrumentInterest: instrument,
          parentId: user.sub || user.id
        });
        alert("Çocuğunuz başarıyla eklendi! 🎉");
        
        // Formu temizle
        setStudentName(""); 
        setStudentAge(5); 
        setInstrument("");
      }
      
      fetchMyStudents(); 

    } catch (error) {
      console.error("İşlem hatası:", error);
      alert("Hata: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Silme İşlemi
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) return;

    try {
      await axios.delete(`${API_URL}/students/${studentId}`);
      alert("Öğrenci silindi. 🗑️");
      
      if (selectedStudentId === studentId) {
        setSelectedStudentId("");
      }
      fetchMyStudents();
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silinemedi. Detay: " + error.message);
    }
  };

  // 5. Düzenle Butonuna Basınca
  const handleEditClick = (student) => {
    setEditMode(true);
    setEditingStudentId(student.id);
    setStudentName(student.fullName);
    setStudentAge(student.age);
    setInstrument(student.instrumentInterest);

    // Forma doğru kaydır
    if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 6. Kursa Kayıt
  const handleEnroll = async (courseId) => {
    if (!selectedStudentId) {
      alert("Lütfen önce yukarıdan kayıt edilecek çocuğu seçin!");
      return;
    }
    try {
      await axios.post(`${API_URL}/enrollments`, {
        studentId: Number(selectedStudentId),
        courseId: Number(courseId)
      });
      alert("Kayıt başarılı! 🎉");
      fetchMyStudents();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("⚠️ Hata: Bu öğrenci zaten bu kursa kayıtlı!");
      } else {
        alert("Kayıt sırasında bir hata oluştu.");
      }
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
            
            <div className="card-header border-0 bg-white pt-4 pb-0">
              <h4 className="fw-bold" style={{ color: "#7d44c2" }}>
              👶🏻 Çocuklarım
              </h4>
              <p className="text-muted small">Kayıtlı öğrenci listesi</p>
            </div>

            <div className="card-body p-4">
              
              <div className="list-group mb-4">
                {students.map(std => (
                  <div key={std.id} className="mb-2">
                      <label 
                        className="list-group-item list-group-item-action p-3 border-0 shadow-sm d-flex justify-content-between align-items-start"
                        style={{ borderRadius: "15px", backgroundColor: "#f8f9fa", cursor: "pointer" }}
                      >
                        {/* Sol Taraf: Seçim ve Bilgi */}
                        <div className="d-flex align-items-center" style={{flex: 1}}>
                          <input 
                            className="form-check-input me-3" 
                            type="radio" 
                            name="selectKid" 
                            checked={selectedStudentId === std.id}
                            style={{ transform: "scale(1.3)", accentColor: "#7d44c2" }} 
                            onChange={() => setSelectedStudentId(std.id)}
                          />
                          <div>
                            <h6 className="mb-0 fw-bold text-dark">{std.fullName}</h6>
                            <small className="text-muted">{std.age} Yaş • 🎵 {std.instrumentInterest}</small>
                            
                            <div className="mt-2">
                                {std.enrollments && std.enrollments.length > 0 ? (
                                    std.enrollments.map(enr => (
                                    <span key={enr.id} className="badge bg-white text-dark border me-1 mb-1 shadow-sm">
                                        🎼 {enr.course.title}
                                    </span>
                                    ))
                                ) : (
                                    <small className="text-muted fst-italic" style={{fontSize: "0.7rem"}}>
                                    Kayıt yok
                                    </small>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Sağ Taraf: Düzenle / Sil Butonları */}
                        <div className="d-flex flex-column ms-2" style={{zIndex: 5, position: "relative"}}>
                             <button 
                                type="button"
                                className="btn btn-sm btn-outline-warning mb-1 border-0" 
                                title="Düzenle"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  e.preventDefault(); 
                                  handleEditClick(std); 
                                }}
                             >
                                ✏️
                             </button>
                             <button 
                                type="button"
                                className="btn btn-sm btn-outline-danger border-0" 
                                title="Sil"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  e.preventDefault(); 
                                  handleDeleteStudent(std.id); 
                                }}
                             >
                                🗑️
                             </button>
                        </div>
                      </label>
                  </div>
                ))}
              </div>

              <hr className="text-muted opacity-25" />
              
              {/* FORM ALANI */}
              <h6 className="mt-4 mb-3 fw-bold" style={{color: editMode ? "#ffc107" : "#6c757d"}}>
                 {editMode ? "✏️ Öğrenciyi Düzenle" : "➕ Yeni Öğrenci Ekle"}
              </h6>
              
              <form ref={formRef} onSubmit={handleSubmit}> 
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
                    <select 
                        className="form-select border-0" 
                        style={{ backgroundColor: "#f1f2f6", borderRadius: "10px", padding: "12px", cursor: "pointer" }}
                        value={studentAge}
                        onChange={e => setStudentAge(e.target.value)}
                    >
                        {ageOptions.map(age => (
                            <option key={age} value={age}>{age} Yaş</option>
                        ))}
                    </select>
                  </div>
                  <div className="col-8">
                    <input 
                      className="form-control border-0" 
                      placeholder="İlgi Alanı (Örn: Piyano)" 
                      style={{ backgroundColor: "#f1f2f6", borderRadius: "10px", padding: "12px" }}
                      value={instrument} 
                      onChange={e=>setInstrument(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="btn w-100 text-white shadow-sm mt-3 fw-bold"
                  style={{ backgroundColor: editMode ? "#ffc107" : "#7d44c2", border: "none", padding: "12px", borderRadius: "10px" }}
                  disabled={isLoading}
                >
                  {isLoading ? "İşleniyor..." : (editMode ? "Değişiklikleri Kaydet" : "Listeye Ekle")}
                </button>

                {editMode && (
                    <button 
                        type="button"
                        className="btn btn-sm w-100 mt-2 text-muted"
                        onClick={() => {
                            setEditMode(false);
                            setEditingStudentId(null);
                            setStudentName("");
                            setStudentAge(5);
                            setInstrument("");
                        }}
                    >
                        İptal Et
                    </button>
                )}
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
                      <span className="badge bg-light text-dark border">
                        📅 {course.time || "Belirtilmedi"}
                      </span>
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