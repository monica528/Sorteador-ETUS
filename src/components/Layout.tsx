import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto relative">
        <div
          className="fixed pointer-events-none opacity-[0.03]"
          style={{
            bottom: '2rem',
            right: '2rem',
            width: '280px',
            height: '280px',
            backgroundImage: 'url(/logo-etus-academy.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <Outlet />
      </main>
    </div>
  );
}
