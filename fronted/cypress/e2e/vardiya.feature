# language: tr
Özellik: Vardiya Yönetim Sistemi
  Bir yönetici olarak
  Çalışanları ve vardiyaları yönetebilmeliyim

  Senaryo: Yeni çalışan ekleme
    Diyelim ki vardiya yönetim sistemini açtım
    Ve çalışanlar sekmesindeyim
    Eğer ki "Fatma Şahin" adında "Hemşire" pozisyonunda çalışan eklersem
    O zaman çalışan listesinde "Fatma Şahin" görünmeli

  Senaryo: Çalışan silme
    Diyelim ki vardiya yönetim sistemini açtım
    Ve çalışanlar sekmesindeyim
    Eğer ki "Ahmet Yılmaz" adlı çalışanı silersem
    O zaman çalışan listesinde "Ahmet Yılmaz" görünmemeli

  Senaryo: Yeni vardiya ekleme
    Diyelim ki vardiya yönetim sistemini açtım
    Ve vardiyalar sekmesine geçtim
    Eğer ki "Ayşe Demir" için "2025-11-15" tarihinde "Sabah" vardiyası eklersem
    O zaman vardiya listesinde "Ayşe Demir" için "2025-11-15" tarihli vardiya görünmeli

  Senaryo: Vardiya silme
    Diyelim ki vardiya yönetim sistemini açtım
    Ve vardiyalar sekmesine geçtim
    Eğer ki ilk vardiyayı silersem
    O zaman vardiya sayısı azalmış olmalı