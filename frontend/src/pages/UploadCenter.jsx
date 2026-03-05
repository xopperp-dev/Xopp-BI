import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMMUNITIES_BY_EMIRATE = {
  Dubai: ["AL Athbah", "Abu Hail", "Al Asbaq", "Al Aweer First", "Al Aweer Second", "Al Baagh", "Al Bada", "Al Baharna", "Al Baraha", "Al Barsha", "Al Barsha First", "Al Barsha Second", "Al Barsha South Fifth", "Al Barsha South Fourth", "Al Barsha Third", "Al Buteen", "Al Butthein", "Al Dhagaya", "Al Garhoud", "Al Hamriya", "Al Hamriya Port", "Al Hathmah", "Al Hebiah Fourth", "Al Hebiah Fifth", "Al Hebiah First", "Al Hebiah Second", "Al Hebiah Sixth", "Al Hebiah Third", "Al Hudaiba", "Al Jaddaf", "Al Jafiliya", "Al Karama", "Al Khabaisi", "Al Khairan First", "Al Khairan Second", "Al Khairan Third", "Al Khawaneej", "Al Khawaneej First", "Al Khawaneej Second", "Al Kheeran", "Al Kifaf", "Al Layan 1", "Al Layan 2", "Al Lisaili", "Al Lulu Island", "Al Mafraq", "Al Mamzar", "Al Manara", "Al Manara First", "Al Manara Second", "Al Manara Third", "Al Markada", "Al Melaheyah", "Al Merkad", "Al Mizhar", "Al Mizhar First", "Al Mizhar Second", "Al Muraqqabat", "Al Murar", "Al Muteena", "Al Nahda", "Al Nahda First", "Al Nahda Second", "Al Nasr Leisureland", "Al Qusais", "Al Qusais First", "Al Qusais Industrial First", "Al Qusais Industrial Fourth", "Al Qusais Industrial Second", "Al Qusais Industrial Third", "Al Qusais Second", "Al Qusais Third", "Al Qusais Fourth", "Al Ras", "Al Rigga", "Al Sabkha", "Al Safa", "Al Safa First", "Al Safa Second", "Al Satta", "Al Shindagha", "Al Souq Al Kabeer", "Al Twar", "Al Twar First", "Al Twar Second", "Al Twar Third", "Al Warqaa", "Al Warqaa First", "Al Warqaa Second", "Al Warqaa Third", "Al Warqaa Fourth", "Al Wasl", "Al Wuheida", "Aleyas 1", "Aleyas 2", "Aleyas 3", "Alfalah", "Alfugas", "Alghubaiba", "Alhashmia", "Aljabel Ali Industrial", "Aljebal Ali", "Alkhawaneej", "Alkifaf", "Alkisar 1", "Alkisar 2", "Alkisar 3", "Allisali", "Almamzar", "Almarqad", "Almersal", "Almizhar", "Almuraqqabat", "Almusalla", "Alnahda", "Alnujoom Islands", "Alquoz", "Alquoz 1", "Alquoz 2", "Alquoz 3", "Alquoz 4", "Alquoz Industrial 1", "Alquoz Industrial 2", "Alquoz Industrial 3", "Alquoz Industrial 4", "Alquoz Industrial Area 1", "Alquoz Industrial Area 2", "Alquoz Industrial Area 3", "Alquoz Industrial Area 4", "Alquoz Industrial First", "Alquoz Industrial Fourth", "Alquoz Industrial Second", "Alquoz Industrial Third", "Alquoz Second", "Alquoz Third", "Alquoz Fourth", "Alquoz First", "Alras", "Alsafouh", "Alsafouh 1", "Alsafouh 2", "Alsatwa", "Alsouq Alkabeer", "Altwar", "Alwasl", "Alyaith", "Ayal Nasir", "Barsha Heights", "Bukadra", "Bu Kadra", "Business Bay", "Cultural Village", "DIFC", "Dubai Festival City", "Dubai Marina", "Dubai Sports City", "Dubai Studio City", "Dubai Waterfront", "Dubai World Central", "Emirates Hills", "Ghaf Tree", "Ghadeer Al Tair", "Gharb Al Ras", "Ghusais", "Ghusais Industrial Area", "Ghusais Industrial First", "Ghusais Industrial Second", "Ghusais Industrial Third", "Ghusais Second", "Ghusais Third", "Ghusais Fourth", "Ghusais First", "Hadaeq Sheikh Mohammed Bin Rashid", "Hatta", "Hatta Hill Park", "Hor Al Anz", "Hor Al Anz East", "Jabal Ali", "Jabal Ali First", "Jabal Ali Industrial First", "Jabal Ali Industrial Second", "Jabal Ali Industrial Third", "Jabal Ali Industrial Fourth", "Jabal Ali Industrial Fifth", "Jabal Ali Industrial Sixth", "Jabal Ali Industrial Seventh", "Jabal Ali Industrial Eighth", "Jabal Ali Industrial Ninth", "Jabal Ali Industrial Tenth", "Jabal Ali Industrial Eleventh", "Jabal Ali Industrial Twelfth", "Jabal Ali Industrial Thirteenth", "Jabal Ali Industrial Fourteenth", "Jabal Ali Industrial Fifteenth", "Jabal Ali Industrial Sixteenth", "Jabal Ali Industrial Seventeenth", "Jabal Ali Industrial Eighteenth", "Jabal Ali Industrial Nineteenth", "Jabal Ali Industrial Twentieth", "Jabal Ali Industrial Twenty First", "Jabal Ali Industrial Twenty Second", "Jabal Ali Industrial Twenty Third", "Jabal Ali Industrial Twenty Fourth", "Jabal Ali Industrial Twenty Fifth", "Jabal Ali Industrial Twenty Sixth", "Jabal Ali Industrial Twenty Seventh", "Jabal Ali Industrial Twenty Eighth", "Jabal Ali Industrial Twenty Ninth", "Jabal Ali Industrial Thirtieth", "Jabal Ali Second", "Jebel Ali Industrial Area", "Jumeirah", "Jumeirah Bay", "Jumeirah First", "Jumeirah Lakes Towers", "Jumeirah Second", "Jumeirah Third", "Jumeirah Village Circle", "Jumeirah Village Triangle", "La Mer", "Lehbab", "Lehbab First", "Lehbab Second", "Liwan", "Madinat Al Mataar", "Madinat Dubai Al Melaheyah", "Madinat Hind 1", "Madinat Hind 2", "Madinat Hind 3", "Madinat Hind 4", "Mena Jabal Ali", "Mereiyeel", "Mirdif", "Muashrah Al Bahraana", "Mugatrah", "Muhaisanah Fifth", "Muhaisanah First", "Muhaisanah Fourth", "Muhaisanah Second", "Muhaisanah Third", "Muhaisna", "Muragab", "Mushrif", "Nad Al Hamar", "Nad Al Shiba", "Nad Al Shiba First", "Nad Al Shiba Fourth", "Nad Al Shiba Second", "Nad Al Shiba Third", "Nad Rashid", "Nad Shamma", "Nadd Hessa", "Naif", "Naif North", "Naif South", "Nazwah", "Oud Al Muteena", "Oud Al Muteena First", "Oud Almuteena Second", "Oud Metha", "Palm Deira", "Palm Jabal Ali", "Palm Jumeirah", "Port Saeed", "Ras Al Khor", "Ras Al Khor Industrial First", "Ras Al Khor Industrial Second", "Ras Al Khor Industrial Third", "Rega Al Buteen", "Remah", "Riqat Masali", "Saih Aldahal", "Saih Alsalam", "Saih Shuaelah", "Saih Shuaib 1", "Saih Shuaib 2", "Saih Shuaib 3", "Saih Shuaib 4", "Shandagha", "Shandagha East", "Shandagha West", "Sikka Al Khail", "Sikkat Al Khail North", "Sikkat Al Khail South", "Souq Al-Lariyyah", "Souq Al-Tamar", "Souq Sikkat Al Khail", "Tareeq Abu Dhabi", "Tareeq Al Aweer", "Tawaa Al Sayegh", "Tawi Al Muraqqab", "Tawi Alfuqa", "Trade Center First", "Trade Center Second", "Um Al Sheif", "Um Almoameneen", "Um Esalay", "Um Hurair First", "Um Hurair Second", "Um Ramool", "Um Suqaim", "Um Suqaim First", "Um Suqaim Second", "Um Suqaim Third", "Umm Addamin", "Umm Hurair", "Universe Islands", "Wadi Al Amardi", "Wadi Al Safa 2", "Wadi Al Safa 3", "Wadi Al Safa 4", "Wadi Al Safa 5", "Wadi Al Safa 6", "Wadi Al Safa 7", "Warsan Fourth", "World Islands", "Yaraah", "Zaabeel First", "Zaabeel Second", "Zabeel East", "Zareeba Duviya"],
  Abudhabi: ["Al Reem Island", "Yas Island", "Saadiyat Island", "Al Maryah Island", "Corniche Area", "Khalifa City", "Mohammed Bin Zayed City", "Al Raha Beach", "Masdar City", "Al Bateen", "Tourist Club Area", "Al Mushrif", "Al Karamah", "Khalidiyah"],
  Sharjah: ["Al Majaz", "Al Nahda", "Al Khan", "Al Taawun", "Muwaileh", "Al Qasimia", "Industrial Area", "Al Mamzar", "Halwan", "University City"],
  Ajman: ["Al Nuaimiya", "Al Rashidiya", "Emirates City", "Al Jurf", "Al Hamidiyah", "Ajman Downtown", "Al Rawda", "Al Rumailah"],
  'Ras Al Khaimah': ["Al Hamra Village", "Mina Al Arab", "Al Marjan Island", "RAK City", "Al Qurm", "Dafan Al Nakheel", "Al Nakheel"],
  'Umm Al Quein': ["UAQ Marina", "Al Maidan", "Al Raas", "Al Salamah"],
  Fujeirah: ["Fujairah City", "Dibba Al Fujairah", "Kalba", "Khor Fakkan"],
};

// ─── Pre-computed deduplicated + sorted full community list ───────────────────
const ALL_COMMUNITIES = [...new Set(Object.values(COMMUNITIES_BY_EMIRATE).flat())].sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase())
);

const FORM_FIELDS = [
  { key: 'emirate', label: 'Emirate', type: 'fixed', options: ['Dubai', 'Abudhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quein', 'Fujeirah'] },
  { key: 'property_type', label: 'Property Type', type: 'fixed', options: ['Plot', 'Villa & TH', 'Apartment', 'Commercial', 'Labourcamp', 'Warehouse'] },
  { key: 'area', label: 'Area', type: 'map' },
  { key: 'community', label: 'Community', type: 'community' },
  { key: 'land_number', label: 'Plot Number', type: 'map' },
  { key: 'project', label: 'Project Name', type: 'map' },
  { key: 'unit', label: 'Unit No', type: 'map' },
  { key: 'name', label: 'Customer Name', type: 'map' },
  { key: 'mobile', label: 'Mobile No', type: 'map' },
  { key: 'phone', label: 'Phone', type: 'map' },
  { key: 'email', label: 'Email ID', type: 'map' },
  { key: 'internal_area', label: 'Internal Area', type: 'map' },
  { key: 'ext_area', label: 'Ext Area', type: 'map' },
  { key: 'total_area', label: 'Total Area', type: 'map' },
  { key: 'selling_price', label: 'Selling Price', type: 'map' },
  { key: 'registration_date', label: 'Reg Date', type: 'map' },
];

// ─── Reusable searchable dropdown ────────────────────────────────────────────
function SearchableSelect({ value, onChange, placeholder, options = [], columnOptions = [] }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const q = search.toLowerCase();
  const filteredOptions = options.filter(o => o.toLowerCase().includes(q));
  const filteredCols = columnOptions.filter(c => c.toLowerCase().includes(q));

  const isColVal = typeof value === 'string' && value.startsWith('__col__');
  const displayLabel = !value ? null
    : isColVal ? `→ ${value.slice(7)}`
      : value;

  const pick = (val) => { onChange(val); setOpen(false); setSearch(''); };

  const rowBase = { padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  const Row = ({ val, children }) => {
    const active = value === val;
    return (
      <div
        onClick={() => pick(val)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background = active ? 'var(--bg3)' : 'transparent'}
        style={{ ...rowBase, color: '#ffffff', background: active ? 'var(--bg3)' : 'transparent', fontWeight: active ? 600 : 400 }}
      >{children}</div>
    );
  };

  const GroupHeader = ({ children }) => (
    <div style={{
      padding: '4px 12px 3px', fontSize: '0.65rem', fontWeight: 700,
      color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em',
      background: 'var(--bg3)', borderTop: '1px solid var(--border)',
    }}>{children}</div>
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        className="input"
        onClick={() => setOpen(o => !o)}
        style={{
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', userSelect: 'none',
          color: displayLabel ? '#ffffff' : 'var(--text3)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayLabel || placeholder}
        </span>
        <span style={{
          fontSize: '0.6rem', color: 'var(--text3)', marginLeft: 8, flexShrink: 0,
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
        }}>▼</span>
      </div>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column', maxHeight: 280,
        }}>
          {/* Search input */}
          <div style={{ padding: '7px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <input
              ref={inputRef}
              className="input"
              style={{ padding: '5px 9px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {/* Skip */}
            <Row val="">— Skip —</Row>

            {/* Fixed value options */}
            {filteredOptions.length > 0 && (
              <>
                <GroupHeader>Set Fixed Value</GroupHeader>
                {filteredOptions.map(o => <Row key={o} val={o}>{o}</Row>)}
              </>
            )}

            {/* Map to column */}
            {filteredCols.length > 0 && (
              <>
                <GroupHeader>Map to Column</GroupHeader>
                {filteredCols.map(c => <Row key={c} val={`__col__${c}`}>→ {c}</Row>)}
              </>
            )}

            {filteredOptions.length === 0 && filteredCols.length === 0 && (
              <div style={{ padding: '14px 12px', fontSize: '0.82rem', color: 'var(--text3)', textAlign: 'center' }}>
                No results for "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UploadCenter() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [fixedValues, setFixedValues] = useState({});
  const [processing, setProcessing] = useState(false);
  const [fileStatus, setFileStatus] = useState(null);

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return;
    const file = accepted[0];
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/files/upload', form);
      setFileData(data);

      const autoMap = {};
      const headers = data.headers || [];
      FORM_FIELDS.filter(f => f.type === 'map').forEach(field => {
        const match = headers.find(h => {
          const hl = h.toLowerCase().replace(/[\s_]/g, '');
          return hl === field.key.toLowerCase().replace(/[\s_]/g, '')
            || hl === field.label.toLowerCase().replace(/[\s_]/g, '');
        });
        if (match) autoMap[field.key] = `__col__${match}`;
      });
      setMapping(autoMap);
      setStep(2);
      toast.success(`Loaded ${data.totalRows} rows — review column mapping`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    noClick: true,
  });

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const finalMapping = {};
      const finalFixed = {};

      // Resolve map fields
      Object.entries(mapping).forEach(([fieldKey, val]) => {
        if (!val) return;
        if (val.startsWith('__col__')) finalMapping[val.slice(7)] = fieldKey;
      });

      // Resolve fixed/community fields
      Object.entries(fixedValues).forEach(([fieldKey, val]) => {
        if (!val) return;
        if (val.startsWith('__col__')) finalMapping[val.slice(7)] = fieldKey;
        else finalFixed[fieldKey] = val;
      });

      await api.post(`/files/${fileData.file.id}/process`, {
        mapping: finalMapping,
        fixedValues: finalFixed,
      });
      setStep(3);
      pollStatus(fileData.file.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Processing failed');
      setProcessing(false);
    }
  };

  const pollStatus = async (fileId) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/files/${fileId}/status`);
        setFileStatus(data);
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(interval);
          setStep(4);
          setProcessing(false);
          if (data.status === 'completed') toast.success('File processed successfully!');
          else toast.error('Processing error: ' + data.error_message);
        }
      } catch { clearInterval(interval); }
    }, 2000);
  };

  const reset = () => {
    setStep(1); setFileData(null); setMapping({});
    setFixedValues({}); setFileStatus(null); setProcessing(false);
  };

  const steps = ['Upload', 'Map Columns', 'Processing', 'Done'];
  const columnOptions = fileData?.headers ?? [];

  // ── Community options: filter by selected emirate, else show full sorted list ──
  const selectedEmirate = fixedValues.emirate && !fixedValues.emirate.startsWith('__col__')
    ? fixedValues.emirate : null;
  const communityOptions = selectedEmirate && COMMUNITIES_BY_EMIRATE[selectedEmirate]
    ? COMMUNITIES_BY_EMIRATE[selectedEmirate]
    : ALL_COMMUNITIES; // ← was Object.values(...).flat() which had duplicates & no sort

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Center</h1>
          <p className="page-subtitle">Import Excel or CSV files to build master data</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="steps mb-24">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-8" style={{ flex: i < steps.length - 1 ? 1 : 'initial' }}>
            <div className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
              <div className="step-num">{step > i + 1 ? '✓' : i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
            {i < steps.length - 1 && <div className="step-connector" style={{ flex: 1 }} />}
          </div>
        ))}
      </div>

      {/* Step 1 ── Upload */}
      {step === 1 && (
        <div className="card">
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
            <div className="dropzone-title">
              {uploading ? 'Uploading…' : isDragActive ? 'Drop it here!' : 'Drop your Excel file here'}
            </div>
            <div className="dropzone-sub" style={{ marginTop: 6 }}>
              {uploading ? <span className="pulse">Parsing file…</span> : 'Supports .xlsx, .xls, .csv — up to 50MB'}
            </div>
            {!uploading && (
              <button className="btn btn-primary" style={{ marginTop: 20 }}
                onClick={e => { e.stopPropagation(); open(); }}>
                <Upload size={16} /> Browse Files
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2 ── Column Mapping */}
      {step === 2 && fileData && (
        <div>
          <div className="card mb-24">
            <div className="flex items-center justify-between mb-20">
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Column Mapping</h2>
                <p className="text-muted text-sm mt-8">
                  Match each field to a column in your file. All fields are optional.
                </p>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                {fileData.totalRows} rows · {fileData.headers.length} columns
              </div>
            </div>

            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 8, padding: '0 4px' }}>
              {['Field', 'Map to Column / Set Value'].map(h => (
                <div key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Field rows */}
            <div style={{ display: 'grid', gap: 6 }}>
              {FORM_FIELDS.map(field => {
                let currentValue = '';
                let handleChange = () => { };

                if (field.type === 'fixed') {
                  currentValue = fixedValues[field.key] || '';
                  handleChange = (val) => setFixedValues(fv => ({ ...fv, [field.key]: val || null }));
                } else if (field.type === 'community') {
                  currentValue = fixedValues.community || '';
                  handleChange = (val) => setFixedValues(fv => ({ ...fv, community: val || null }));
                } else {
                  currentValue = mapping[field.key] || '';
                  handleChange = (val) => setMapping(m => ({ ...m, [field.key]: val || null }));
                }

                return (
                  <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', alignItems: 'center' }}>
                    {/* Left: static field label — same for ALL rows including Community */}
                    <div style={{
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg3)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--text)',
                    }}>
                      {field.label}
                    </div>

                    {/* Right: searchable dropdown */}
                    <SearchableSelect
                      value={currentValue}
                      onChange={handleChange}
                      placeholder={`— Select ${field.label} —`}
                      options={
                        field.type === 'fixed' ? field.options :
                          field.type === 'community' ? communityOptions :
                            []
                      }
                      columnOptions={field.type === 'fixed' ? [] : columnOptions}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview table */}
          <div className="card mb-24">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>
              Data Preview (first 5 rows)
            </h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>{fileData.headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {fileData.preview.map((row, i) => (
                    <tr key={i}>
                      {fileData.headers.map(h => <td key={h}>{String(row[h] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-12">
            <button className="btn btn-ghost" onClick={reset}>← Back</button>
            <button className="btn btn-primary" onClick={handleProcess} disabled={processing}>
              {processing ? <><RefreshCw size={14} className="pulse" /> Starting…</> : 'Confirm & Process →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 ── Processing */}
      {step === 3 && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚙️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8 }}>Processing your file…</h2>
          <p className="text-muted text-sm">Normalizing data, matching customers, detecting duplicates</p>
          <div className="progress-bar" style={{ marginTop: 24, maxWidth: 300, margin: '24px auto 0' }}>
            <div className="progress-fill pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Step 4 ── Done */}
      {step === 4 && fileStatus && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
          {fileStatus.status === 'completed' ? (
            <>
              <CheckCircle size={56} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8 }}>Processing Complete!</h2>
              <div className="stats-grid" style={{ maxWidth: 500, margin: '24px auto', textAlign: 'left' }}>
                {[
                  { label: 'Rows Processed', value: fileStatus.processed_count },
                  { label: 'Duplicates Skipped', value: fileStatus.duplicate_count },
                ].map(s => (
                  <div className="stat-card yellow" key={s.label} style={{ textAlign: 'center' }}>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={56} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8 }}>Processing Error</h2>
              <p className="text-muted text-sm">{fileStatus.error_message}</p>
            </>
          )}
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={reset}>Upload Another File</button>
        </div>
      )}
    </div>
  );
}