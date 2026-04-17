import './FormInputs.css';

export function TextInput({ label, value, onChange, placeholder, required, id, type = 'text' }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label} {required && <span className="form-required">*</span>}</label>}
      <input
        id={id}
        type={type}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export function SelectInput({ label, value, onChange, options, placeholder, required, id }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label} {required && <span className="form-required">*</span>}</label>}
      <select id={id} className="form-select" value={value} onChange={onChange} required={required}>
        <option value="">{placeholder || '-- Select --'}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DateInput({ label, value, onChange, required, id }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label} {required && <span className="form-required">*</span>}</label>}
      <input
        id={id}
        type="date"
        className="form-input"
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 4, id }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <textarea
        id={id}
        className="form-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

export function Toggle({ label, checked, onChange, id }) {
  return (
    <div className="form-toggle">
      <label className="toggle-label" htmlFor={id}>
        <div className={`toggle-switch ${checked ? 'toggle-switch--active' : ''}`}>
          <div className="toggle-slider" />
        </div>
        <span>{label}</span>
      </label>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} style={{ display: 'none' }} />
    </div>
  );
}

export function FileUpload({ label, onChange, accept = 'image/*', id }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="file-upload">
        <input type="file" id={id} accept={accept} onChange={onChange} className="file-upload__input" />
        <label htmlFor={id} className="file-upload__label">
          <span className="file-upload__icon">📎</span>
          <span>Choose file or drag here</span>
        </label>
      </div>
    </div>
  );
}
