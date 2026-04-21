import '../styles/popups.css';

export default function ReportPopup({ open, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div id="popup-report" className="popup-container">
      <div className="popup">
        <div className="popup-header">
          <span className="popup-close" onClick={onClose}>
            &times;
          </span>
          <h2>Report Issue</h2>
        </div>
        <form
          id="reportForm"
          className="popup-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="form-group">
            <label htmlFor="reportTitle">Title:</label>
            <input type="text" id="reportTitle" className="form-control" required />
          </div>
          <div className="form-group">
            <label htmlFor="reportType">Type of Issue:</label>
            <select id="reportType" className="form-control" required>
              <option value="vending_machine">Vending Machine Issue</option>
              <option value="location">Location Issue</option>
              <option value="app_functionality">App Functionality Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="reportDescription">Description:</label>
            <textarea id="reportDescription" className="form-control" required />
          </div>
          <button type="submit" className="btn-submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

