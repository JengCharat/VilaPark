import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

const showPage = (page) => {
    router.push(`/${page}`);
    setUserMenuOpen(false);
  };
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <nav className="gradient-bg text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐱</span>
            <span className="text-xl font-bold">VilaPark</span>
          </div>

          <div className="hidden md:flex space-x-4">
            <button onClick={() => showPage('dashboard')} className="nav-item px-3 py-2 rounded-md text-sm font-medium">
              หน้าแรก
            </button>
            <button onClick={() => showPage('booking')} className="nav-item px-3 py-2 rounded-md text-sm font-medium">
              จองห้องพัก
            </button>
            <button onClick={() => showPage('customer-dashboard')} className="nav-item px-3 py-2 rounded-md text-sm font-medium">
              แดชบอร์ดลูกค้า
            </button>

            <div className="relative">
              <button onClick={toggleUserMenu} className="nav-item px-3 py-2 rounded-md text-sm font-medium flex items-center">
                เข้าสู่ระบบ <span className="ml-1">▼</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button onClick={() => showPage('signin')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    🔑 Sign In
                  </button>
                  <button onClick={() => showPage('staff-dashboard')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    👨‍💼 พนักงาน
                  </button>
                  <button onClick={() => showPage('admin-dashboard')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    👑 ผู้จัดการ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
