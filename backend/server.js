const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Veritabanı okuma fonksiyonu
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Veritabanı okuma hatası:', error);
    return { employees: [], shifts: [] };
  }
};

// Veritabanı yazma fonksiyonu
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Veritabanı yazma hatası:', error);
    return false;
  }
};

// ==================== ÇALIŞAN API'LERİ ====================

// Tüm çalışanları getir
app.get('/api/employees', (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    data: db.employees,
    count: db.employees.length
  });
});

// ID'ye göre çalışan getir
app.get('/api/employees/:id', (req, res) => {
  const db = readDB();
  const employee = db.employees.find(emp => emp.id === parseInt(req.params.id));
  
  if (employee) {
    res.json({ success: true, data: employee });
  } else {
    res.status(404).json({ success: false, message: 'Çalışan bulunamadı' });
  }
});

// Yeni çalışan ekle
app.post('/api/employees', (req, res) => {
  const db = readDB();
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'Ad ve pozisyon gereklidir' 
    });
  }

  const newEmployee = {
    id: db.employees.length > 0 ? Math.max(...db.employees.map(e => e.id)) + 1 : 1,
    name,
    role,
    createdAt: new Date().toISOString()
  };

  db.employees.push(newEmployee);
  
  if (writeDB(db)) {
    res.status(201).json({ 
      success: true, 
      data: newEmployee,
      message: 'Çalışan başarıyla eklendi' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: 'Çalışan eklenirken hata oluştu' 
    });
  }
});

// Çalışan güncelle
app.put('/api/employees/:id', (req, res) => {
  const db = readDB();
  const { name, role } = req.body;
  const employeeIndex = db.employees.findIndex(emp => emp.id === parseInt(req.params.id));

  if (employeeIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Çalışan bulunamadı' 
    });
  }

  db.employees[employeeIndex] = {
    ...db.employees[employeeIndex],
    name: name || db.employees[employeeIndex].name,
    role: role || db.employees[employeeIndex].role,
    updatedAt: new Date().toISOString()
  };

  if (writeDB(db)) {
    res.json({ 
      success: true, 
      data: db.employees[employeeIndex],
      message: 'Çalışan başarıyla güncellendi' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: 'Çalışan güncellenirken hata oluştu' 
    });
  }
});

// Çalışan sil
app.delete('/api/employees/:id', (req, res) => {
  const db = readDB();
  const employeeId = parseInt(req.params.id);
  const initialLength = db.employees.length;

  db.employees = db.employees.filter(emp => emp.id !== employeeId);
  db.shifts = db.shifts.filter(shift => shift.employeeId !== employeeId);

  if (db.employees.length < initialLength) {
    if (writeDB(db)) {
      res.json({ 
        success: true, 
        message: 'Çalışan ve ilgili vardiyalar silindi' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Çalışan silinirken hata oluştu' 
      });
    }
  } else {
    res.status(404).json({ 
      success: false, 
      message: 'Çalışan bulunamadı' 
    });
  }
});

// ==================== VARDİYA API'LERİ ====================

// Tüm vardiyaları getir
app.get('/api/shifts', (req, res) => {
  const db = readDB();
  const { employeeId, date, type } = req.query;

  let shifts = db.shifts;

  // Filtreleme
  if (employeeId) {
    shifts = shifts.filter(shift => shift.employeeId === parseInt(employeeId));
  }
  if (date) {
    shifts = shifts.filter(shift => shift.date === date);
  }
  if (type) {
    shifts = shifts.filter(shift => shift.type === type);
  }

  res.json({
    success: true,
    data: shifts,
    count: shifts.length
  });
});

// ID'ye göre vardiya getir
app.get('/api/shifts/:id', (req, res) => {
  const db = readDB();
  const shift = db.shifts.find(s => s.id === parseInt(req.params.id));
  
  if (shift) {
    res.json({ success: true, data: shift });
  } else {
    res.status(404).json({ success: false, message: 'Vardiya bulunamadı' });
  }
});

// Yeni vardiya ekle
app.post('/api/shifts', (req, res) => {
  const db = readDB();
  const { employeeId, date, type, startTime, endTime } = req.body;

  if (!employeeId || !date || !type || !startTime || !endTime) {
    return res.status(400).json({ 
      success: false, 
      message: 'Tüm alanlar gereklidir' 
    });
  }

  const employee = db.employees.find(emp => emp.id === parseInt(employeeId));
  
  if (!employee) {
    return res.status(404).json({ 
      success: false, 
      message: 'Çalışan bulunamadı' 
    });
  }

  const newShift = {
    id: db.shifts.length > 0 ? Math.max(...db.shifts.map(s => s.id)) + 1 : 1,
    employeeId: parseInt(employeeId),
    employeeName: employee.name,
    date,
    type,
    startTime,
    endTime,
    createdAt: new Date().toISOString()
  };

  db.shifts.push(newShift);
  
  if (writeDB(db)) {
    res.status(201).json({ 
      success: true, 
      data: newShift,
      message: 'Vardiya başarıyla eklendi' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: 'Vardiya eklenirken hata oluştu' 
    });
  }
});

// Vardiya güncelle
app.put('/api/shifts/:id', (req, res) => {
  const db = readDB();
  const { employeeId, date, type, startTime, endTime } = req.body;
  const shiftIndex = db.shifts.findIndex(s => s.id === parseInt(req.params.id));

  if (shiftIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Vardiya bulunamadı' 
    });
  }

  let employeeName = db.shifts[shiftIndex].employeeName;
  
  if (employeeId) {
    const employee = db.employees.find(emp => emp.id === parseInt(employeeId));
    if (employee) {
      employeeName = employee.name;
    }
  }

  db.shifts[shiftIndex] = {
    ...db.shifts[shiftIndex],
    employeeId: employeeId ? parseInt(employeeId) : db.shifts[shiftIndex].employeeId,
    employeeName,
    date: date || db.shifts[shiftIndex].date,
    type: type || db.shifts[shiftIndex].type,
    startTime: startTime || db.shifts[shiftIndex].startTime,
    endTime: endTime || db.shifts[shiftIndex].endTime,
    updatedAt: new Date().toISOString()
  };

  if (writeDB(db)) {
    res.json({ 
      success: true, 
      data: db.shifts[shiftIndex],
      message: 'Vardiya başarıyla güncellendi' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: 'Vardiya güncellenirken hata oluştu' 
    });
  }
});

// Vardiya sil
app.delete('/api/shifts/:id', (req, res) => {
  const db = readDB();
  const shiftId = parseInt(req.params.id);
  const initialLength = db.shifts.length;

  db.shifts = db.shifts.filter(shift => shift.id !== shiftId);

  if (db.shifts.length < initialLength) {
    if (writeDB(db)) {
      res.json({ 
        success: true, 
        message: 'Vardiya başarıyla silindi' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Vardiya silinirken hata oluştu' 
      });
    }
  } else {
    res.status(404).json({ 
      success: false, 
      message: 'Vardiya bulunamadı' 
    });
  }
});

// ==================== İSTATİSTİK API'LERİ ====================

// Genel istatistikler
app.get('/api/stats', (req, res) => {
  const db = readDB();
  
  const stats = {
    totalEmployees: db.employees.length,
    totalShifts: db.shifts.length,
    shiftsByType: {
      Sabah: db.shifts.filter(s => s.type === 'Sabah').length,
      Aksam: db.shifts.filter(s => s.type === 'Aksam').length,
      Gece: db.shifts.filter(s => s.type === 'Gece').length
    },
    employeeRoles: {}
  };

  db.employees.forEach(emp => {
    stats.employeeRoles[emp.role] = (stats.employeeRoles[emp.role] || 0) + 1;
  });

  res.json({
    success: true,
    data: stats
  });
});

// ==================== SUNUCU BAŞLAT ====================

app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(` API Endpoints:`);
  console.log(`   GET    /api/employees       - Tüm çalışanlar`);
  console.log(`   GET    /api/employees/:id   - Tekil çalışan`);
  console.log(`   POST   /api/employees       - Çalışan ekle`);
  console.log(`   PUT    /api/employees/:id   - Çalışan güncelle`);
  console.log(`   DELETE /api/employees/:id   - Çalışan sil`);
  console.log(`   GET    /api/shifts          - Tüm vardiyalar`);
  console.log(`   GET    /api/shifts/:id      - Tekil vardiya`);
  console.log(`   POST   /api/shifts          - Vardiya ekle`);
  console.log(`   PUT    /api/shifts/:id      - Vardiya güncelle`);
  console.log(`   DELETE /api/shifts/:id      - Vardiya sil`);
  console.log(`   GET    /api/stats           - İstatistikler`);
});