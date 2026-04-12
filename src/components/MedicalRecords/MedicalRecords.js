import { useState } from 'react';
import { Link } from 'react-router-dom';
import './MedicalRecords.css';

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const records = [
    {
      id: 1,
      type: 'prescription',
      title: 'Prescription - Heart Medication',
      doctor: 'Dr. Anita Sharma',
      date: 'Dec 15, 2025',
      hospital: 'HealthMandala Clinic',
      medicines: [
        { name: 'Aspirin 75mg', dosage: '1 tablet daily after breakfast', duration: '30 days' },
        { name: 'Atorvastatin 10mg', dosage: '1 tablet at night', duration: '30 days' },
        { name: 'Metoprolol 25mg', dosage: '1 tablet twice daily', duration: '30 days' }
      ]
    },
    {
      id: 2,
      type: 'lab',
      title: 'Complete Blood Count (CBC)',
      doctor: 'Dr. Rajesh Patel',
      date: 'Dec 10, 2025',
      hospital: 'City Hospital Lab',
      results: [
        { test: 'Hemoglobin', value: '14.2 g/dL', range: '13.5-17.5', status: 'normal' },
        { test: 'WBC Count', value: '8,500 /μL', range: '4,500-11,000', status: 'normal' },
        { test: 'Platelet Count', value: '145,000 /μL', range: '150,000-400,000', status: 'low' },
        { test: 'RBC Count', value: '5.1 M/μL', range: '4.5-5.5', status: 'normal' }
      ]
    },
    {
      id: 3,
      type: 'report',
      title: 'Cardiology Consultation Report',
      doctor: 'Dr. Anita Sharma',
      date: 'Dec 5, 2025',
      hospital: 'HealthMandala Clinic',
      summary: {
        diagnosis: 'Mild Hypertension',
        bloodPressure: '140/90 mmHg',
        heartRate: '78 bpm',
        weight: '72 kg'
      },
      notes: 'Patient shows signs of mild hypertension. Recommended lifestyle changes including reduced salt intake, regular exercise, and stress management. Follow-up in 4 weeks.'
    },
    {
      id: 4,
      type: 'imaging',
      title: 'Chest X-Ray',
      doctor: 'Dr. Suman Gurung',
      date: 'Nov 28, 2025',
      hospital: 'Nepal Medical Center',
      findings: 'Normal chest X-ray. No abnormalities detected in lungs or heart shadow.'
    },
    {
      id: 5,
      type: 'lab',
      title: 'Lipid Profile Test',
      doctor: 'Dr. Anita Sharma',
      date: 'Nov 20, 2025',
      hospital: 'City Hospital Lab',
      results: [
        { test: 'Total Cholesterol', value: '220 mg/dL', range: '<200', status: 'high' },
        { test: 'LDL Cholesterol', value: '145 mg/dL', range: '<100', status: 'high' },
        { test: 'HDL Cholesterol', value: '45 mg/dL', range: '>40', status: 'normal' },
        { test: 'Triglycerides', value: '160 mg/dL', range: '<150', status: 'high' }
      ]
    }
  ];

  const filteredRecords = activeTab === 'all' 
    ? records 
    : records.filter(r => r.type === activeTab);

  const getIcon = (type) => {
    switch(type) {
      case 'prescription': return 'Rx';
      case 'lab': return 'Lab';
      case 'report': return 'Rpt';
      case 'imaging': return 'Img';
      default: return 'Doc';
    }
  };

  const renderRecordDetail = () => {
    if (!selectedRecord) return null;

    return (
      <div className="record-detail">
        <div className="record-detail-header">
          <div className="record-detail-title">
            <h2>{selectedRecord.title}</h2>
            <p>{selectedRecord.doctor} • {selectedRecord.hospital}</p>
          </div>
          <div className="record-detail-actions">
            <button className="record-btn view" onClick={() => setSelectedRecord(null)}>← Back</button>
            <button className="record-btn download">Download</button>
          </div>
        </div>

        {selectedRecord.type === 'prescription' && (
          <div className="prescription-detail">
            <h3>Prescribed Medicines</h3>
            <div className="medicine-list">
              {selectedRecord.medicines.map((med, index) => (
                <div key={index} className="medicine-item">
                  <div>
                    <div className="medicine-name">{med.name}</div>
                    <div className="medicine-dosage">{med.dosage}</div>
                  </div>
                  <div className="medicine-duration">{med.duration}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRecord.type === 'lab' && (
          <div className="lab-results">
            <h3>Test Results</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedRecord.results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.test}</td>
                    <td>{result.value}</td>
                    <td>{result.range}</td>
                    <td>
                      <span className={`result-status ${result.status}`}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedRecord.type === 'report' && (
          <>
            <div className="visit-summary">
              <h3>Visit Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="label">Diagnosis</div>
                  <div className="value">{selectedRecord.summary.diagnosis}</div>
                </div>
                <div className="summary-item">
                  <div className="label">Blood Pressure</div>
                  <div className="value">{selectedRecord.summary.bloodPressure}</div>
                </div>
                <div className="summary-item">
                  <div className="label">Heart Rate</div>
                  <div className="value">{selectedRecord.summary.heartRate}</div>
                </div>
                <div className="summary-item">
                  <div className="label">Weight</div>
                  <div className="value">{selectedRecord.summary.weight}</div>
                </div>
              </div>
            </div>
            <div className="doctor-notes">
              <h4>Doctor's Notes</h4>
              <p>{selectedRecord.notes}</p>
            </div>
          </>
        )}

        {selectedRecord.type === 'imaging' && (
          <div className="doctor-notes">
            <h4>Findings</h4>
            <p>{selectedRecord.findings}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="records-container">
      <div className="records-content">
        <div className="page-header">
          <Link to="/" className="back-btn">← Back to Home</Link>
          <h1>Medical Records</h1>
        </div>

        {selectedRecord ? (
          renderRecordDetail()
        ) : (
          <>
            <div className="records-tabs">
              <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                All Records
              </button>
              <button className={`tab-btn ${activeTab === 'prescription' ? 'active' : ''}`} onClick={() => setActiveTab('prescription')}>
                Prescriptions
              </button>
              <button className={`tab-btn ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => setActiveTab('lab')}>
                Lab Results
              </button>
              <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
                Reports
              </button>
              <button className={`tab-btn ${activeTab === 'imaging' ? 'active' : ''}`} onClick={() => setActiveTab('imaging')}>
                Imaging
              </button>
            </div>

            <div className="records-list">
              {filteredRecords.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-left">
                    <div className={`record-icon ${record.type}`}>
                      {getIcon(record.type)}
                    </div>
                    <div className="record-info">
                      <h3>{record.title}</h3>
                      <p className="doctor">{record.doctor}</p>
                      <div className="record-meta">
                        <span>{record.hospital}</span>
                      </div>
                    </div>
                  </div>
                  <div className="record-right">
                    <span className="record-date">{record.date}</span>
                    <div className="record-actions">
                      <button className="record-btn view" onClick={() => setSelectedRecord(record)}>
                        View
                      </button>
                      <button className="record-btn download">DL</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="upload-section">
              <div className="upload-icon">+</div>
              <h3>Upload Medical Records</h3>
              <p>Upload prescriptions, lab reports, or other medical documents</p>
              <button className="upload-btn">Choose Files</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
