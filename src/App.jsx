import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PivotClassic from './components/PivotClassic';
import PivotCamarilla from './components/PivotCamarilla';

export default function App() {
  const [current, setCurrent] = useState('classic');

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar current={current} setCurrent={setCurrent} />
      {current === 'classic' ? <PivotClassic /> : <PivotCamarilla />}
    </div>
  );
}
