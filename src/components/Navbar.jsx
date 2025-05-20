import React from 'react';

export default function Navbar({ current, setCurrent }) {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-center space-x-4 rtl:space-x-reverse">
      <button
        onClick={() => setCurrent('classic')}
        className={`px-4 py-2 rounded ${
          current === 'classic' ? 'bg-white text-blue-600' : 'hover:bg-blue-700'
        }`}
      >
        کلاسیک
      </button>
      <button
        onClick={() => setCurrent('camarilla')}
        className={`px-4 py-2 rounded ${
          current === 'camarilla' ? 'bg-white text-blue-600' : 'hover:bg-blue-700'
        }`}
      >
        فیبوناچی
      </button>
    </nav>
  );
}
