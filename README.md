# 🧑‍💻 Website Mini 3D

Selamat datang di 3D versi portfolio pribadi saya! Website ini menghadirkan pengalaman visual interaktif dengan efek 3D, sehingga pengunjung bisa menavigasi profil, skill, dan project saya secara lebih hidup dan menarik.

## 🚀 Tech Stack

### Frontend
- [Vue](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Pinia](https://pinia.vuejs.org/) - State Management
- [GSAP](https://gsap.com/) - Animasi halus

### Backend (Planned)
- [Golang](https://golang.org/) + [Fiber](https://gofiber.io/)
- PostgreSQL (via RAW Query)
- REST API

## 🎯 Fitur
- 3D Interactive Landing Page – navigasi elemen 3D dengan efek hover dan scroll
- Project Showcase 3D – setiap project muncul dalam bentuk card 3D yang bisa diputar atau diperbesar
- Skill Visualization – skill frontend & backend ditampilkan dalam chart 3D interaktif
- Responsive & Mobile-Friendly – tetap nyaman di perangkat mobile
- Dark Theme modern & elegan
- Integrasi Mudah Backend – siap untuk REST API dan database

```bash
## 🛠️ Instalasi Lokal
git clone https://github.com/Bredcool/mini-3d.git
cd mini-3d/frontend

## 🛠️ Jalankan Frontend
cd frontend
npm install
npm run dev

## 🛠️ Jalankan Backend
cd backend
go mod tidy
go run main.go

## 🛠️ Jalankan Docker
docker-compose build
docker-compose up -d