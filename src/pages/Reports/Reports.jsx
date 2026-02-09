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
                    <ReportSection title="Annual Reports" items={[
                        { label: 'Annual Report 2024-25', url: '#' },
                        { label: 'Financial Summary 2025', url: '#' }
                    ]} />
                    <ReportSection title="Project Reports" items={[
                        { label: 'Beggar Rehabilitation Project 2024', url: '#' },
                        { label: 'Scholarship Impact Report', url: '#' }
                    ]} />
                    <ReportSection title="Government Letters" items={[
                        { label: 'Memo No. ADM-09 (Administration 2026)', url: '/documents/ADM-09_ADMINISTRATION_2026.pdf' },
                        { label: 'Trust Registration Copy', url: '#' },
                        { label: 'Local Body NOC', url: '#' },
                        { label: '80G Certification', url: '#' }
                    ]} />
                    <ReportSection title="CSR / MoU" items={[
                        { label: 'MoU with Local College', url: '#' },
                        { label: 'Corporate Fund Utilization', url: '#' }
                    ]} />
                </div>
            </div>
        </div>
    );
};

const ReportSection = ({ title, items }) => {
    const handleDownload = (item) => {
        if (item.url && item.url !== '#') {
             const link = document.createElement('a');
             link.href = item.url;
             link.download = item.label;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
        } else {
            alert(`Starting download for: ${item.label}.\nNote: This is a demo. Actual files will be available on the production server.`);
        }
    };

    return (
        <div className="report-card">
            <h3>{title}</h3>
            <ul className="file-list">
                {items.map((item, idx) => (
                    <li key={idx}>
                        <div className="file-info">
                            <FaFilePdf className="file-icon" />
                            <span>{item.label}</span>
                        </div>
                        <button className="download-btn" onClick={() => handleDownload(item)}><FaDownload /></button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Reports;
