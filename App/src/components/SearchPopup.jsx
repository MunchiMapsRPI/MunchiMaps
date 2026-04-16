import { useMemo, useState } from 'react';

export default function SearchPopup({ open, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  const buildings = useMemo(
    () => [
      { name: 'Folsom Library', drink: true, food: true },
      { name: 'Sharp Hall', drink: true, food: true },
      { name: 'Rensselaer Student Union', drink: true, food: true },
      { name: 'Quadrangle Complex', drink: true, food: false },
      { name: 'Darrin Communication Center', drink: true, food: true },
      { name: 'Woorhees Computing Center', drink: true, food: true },
      { name: 'Amos Eaton Hall', drink: true, food: false },
      { name: 'Mueller Center', drink: true, food: true },
      { name: 'J Erik Jonsson Engineering Center', drink: true, food: true },
      { name: 'Russell Sage Laboratory', drink: true, food: true },
      { name: 'Jonsson-Rowland Science Center', drink: true, food: true },
      { name: 'Pittsburgh Building', drink: true, food: true },
      { name: 'Warren Hall', drink: true, food: false },
      { name: 'Greene Building', drink: true, food: true },
      { name: 'Davison Hall', drink: true, food: false },
      { name: 'RPI Public Safety', drink: true, food: false },
      { name: 'North Hall', drink: true, food: true },
      { name: 'West Hall', drink: true, food: false },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return buildings.filter((b) => b.name.toLowerCase().startsWith(term));
  }, [buildings, searchTerm]);

  if (!open) return null;

  return (
    <div id="popup-search" style={{ display: 'block' }} className="show">
      <div className="search-bar">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <input
          type="search"
          id="searchInput"
          placeholder="Search for a building..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div id="searchResult" className="result">
          {!!searchTerm &&
            filtered.map((building) => <li key={building.name}>{building.name}</li>)}
        </div>
      </div>
    </div>
  );
}

