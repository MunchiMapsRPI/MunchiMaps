import { Suspense, lazy, useCallback, useState } from 'react';
import './styles/MunchiMaps_stylesheet.css';
import './styles/dark.css';
import './styles/Location_Style_Sheet.css';
import './styles/loading_animation_stylesheet.css';

const SearchPopup = lazy(() => import('./components/SearchPopup.jsx'));
const ReportPopup = lazy(() => import('./components/ReportPopup.jsx'));

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const closeAllPopups = useCallback(() => {
    setIsSearchOpen(false);
    setIsReportOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    closeAllPopups();
    setIsSearchOpen(true);
  }, [closeAllPopups]);

  const openReport = useCallback(() => {
    closeAllPopups();
    setIsReportOpen(true);
  }, [closeAllPopups]);

  return (
    <>
      <div className="logo-title">
        <img
          src="https://github.com/mike-cautela/MunchiMaps/blob/main/Website/MunchiMaps%20Assets/MunchiMaps%20Logos/MunchiMapsCroppedLogo.png?raw=true"
          alt="MunchiMaps"
        />
      </div>

      <div id="map-container">
        <div id="map"></div>
      </div>

      <button className="help-button" onClick={() => console.log('Open Help')}>
        <img
          src="https://raw.githubusercontent.com/mike-cautela/MunchiMaps/main/Website/MunchiMaps%20Assets/MenuIcons/help-circle-grey.svg"
          alt="Help"
          className="help-button-img"
        />
      </button>

      <button className="map-key-button" onClick={() => console.log('Open Map Key')}>
        <img
          src="https://github.com/mike-cautela/MunchiMaps/blob/main/Website/MunchiMaps%20Assets/CookieFavicon.png?raw=true"
          alt="Map Key"
          className="map-key-button-img"
        />
      </button>

      <Suspense fallback={null}>
        <SearchPopup open={isSearchOpen} onClose={closeAllPopups} />
        <ReportPopup
          open={isReportOpen}
          onClose={closeAllPopups}
          onSubmit={() => console.log('Submit Report')}
        />
      </Suspense>

      <div id="buttons-container">
        <button className="button" onClick={openSearch}>
          <img
            src="https://raw.githubusercontent.com/mike-cautela/MunchiMaps/main/Website/MunchiMaps%20Assets/MenuIcons/search-grey.svg"
            alt="Search"
            className="button-img"
          />
        </button>
        <button className="button" onClick={openReport}>
          <img
            src="https://raw.githubusercontent.com/mike-cautela/MunchiMaps/main/Website/MunchiMaps%20Assets/MenuIcons/alert-triangle-grey.svg"
            alt="Report"
            className="button-img"
          />
        </button>
        <button className="button" id="Location" onClick={() => console.log('Update Location')}>
          <img
            src="https://raw.githubusercontent.com/mike-cautela/MunchiMaps/main/Website/MunchiMaps%20Assets/MenuIcons/crosshair-grey.svg"
            alt="Location"
            className="button-img"
          />
        </button>
      </div>
    </>
  );
}

export default App;
