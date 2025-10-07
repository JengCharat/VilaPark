import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
type User = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};
export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // อ่าน user จาก localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const showPage = (page:string) => {
    router.push(`/${page}`);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/signin");
  }

  return (
    <nav className="bg-[#4691D3] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img
              src="/Logovilapark4.png"
              alt="VilaPark Logo"
              className="w-40 h-auto object-cover"
            />

          </div>

          <div className="hidden md:flex space-x-4">
            <button onClick={() => showPage('dashboard')} className="nav-item px-3 py-2 rounded-md text-l font-medium">
              หน้าแรก
            </button>
            <button onClick={() => showPage('form')} className="nav-item px-3 py-2 rounded-md text-l font-medium">
              จองห้องพัก
            </button>
            <button onClick={() => showPage('todayUpdate')} className="nav-item px-3 py-2 rounded-md text-l font-medium">
              แดชบอร์ดลูกค้า
            </button>

            <div className="relative">
              <button onClick={toggleUserMenu} className="nav-item px-3 py-2 rounded-md text-l font-medium flex items-center">
                {user ? user.username : 'เข้าสู่ระบบ'} <span className="m-1">▼</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {!user && (
                    <>
                      <button onClick={() => showPage('signin')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                        Sign In
                      </button>
                      <button onClick={() => showPage('signup')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                        Sign Up
                      </button>
                    </>
                  )}

                  <button onClick={() => showPage('dashboardAdmin')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    พนักงาน
                  </button>
                  <button onClick={() => showPage('manager')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    ผู้จัดการ
                  </button>

                  {user && (
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
