import { Suspense, lazy, useCallback, useState } from 'react';
import './styles/MunchiMaps_stylesheet.css';
import './styles/dark.css';
import './styles/Location_Style_Sheet.css';
import './styles/loading_animation_stylesheet.css';

import munchiLogo from './assets/munchimaps/MunchiMapsCroppedLogo.png';
import cookieFavicon from './assets/munchimaps/CookieFavicon.png';
import helpIcon from './assets/munchimaps/help-circle-grey.svg';
import searchIcon from './assets/munchimaps/search-grey.svg';
import reportIcon from './assets/munchimaps/alert-triangle-grey.svg';
import crosshairIcon from './assets/munchimaps/crosshair-grey.svg';

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
          src={munchiLogo}
          alt="MunchiMaps"
        />
      </div>

      <div id="map-container">
        <div id="map"></div>
      </div>

      <button className="help-button" onClick={() => console.log('Open Help')}>
        <img
          src={helpIcon}
          alt="Help"
          className="help-button-img"
        />
      </button>

      <button className="map-key-button" onClick={() => console.log('Open Map Key')}>
        <img
          src={cookieFavicon}
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
            src={searchIcon}
            alt="Search"
            className="button-img"
          />
        </button>
        <button className="button" onClick={openReport}>
          <img
            src={reportIcon}
            alt="Report"
            className="button-img"
          />
        </button>
        <button className="button" id="Location" onClick={() => console.log('Update Location')}>
          <img
            src={crosshairIcon}
            alt="Location"
            className="button-img"
          />
        </button>
      </div>
    </>
  );
}

export default App;
