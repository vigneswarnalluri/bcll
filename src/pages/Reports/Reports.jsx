import React from 'react';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
    return (
        <div className="reports-page">
            <div className="page-header reports-header">
                <div className="container">
                    <h1>Reports & Documents</h1>
                    <p>Complete transparency. Official reports and documents for public reference.</p>
                </div>
            </div>

            <div className="container section">
                <div className="reports-grid">
                    <ReportSection title="Annual Reports" items={['Annual Report 2024-25', 'Financial Summary 2025']} />
                    <ReportSection title="Project Reports" items={['Beggar Rehabilitation Project 2024', 'Scholarship Impact Report']} />
                    <ReportSection title="Government Letters" items={['Trust Registration Copy', 'Local Body NOC', '80G Certification']} />
                    <ReportSection title="CSR / MoU" items={['MoU with Local College', 'Corporate Fund Utilization']} />
                </div>
            </div>
        </div>
    );
};

const ReportSection = ({ title, items }) => {
    const handleDownload = (item) => {
        alert(`Starting download for: ${item}.\nNote: This is a demo. Actual files will be available on the production server.`);
    };

    return (
        <div className="report-card">
            <h3>{title}</h3>
            <ul className="file-list">
                {items.map((item, idx) => (
                    <li key={idx}>
                        <div className="file-info">
                            <FaFilePdf className="file-icon" />
                            <span>{item}</span>
                        </div>
                        <button className="download-btn" onClick={() => handleDownload(item)}><FaDownload /></button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Reports;
