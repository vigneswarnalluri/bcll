const EOfficeTab = () => {
    const [view, setView] = useState('folders');
    const [activeFolder, setActiveFolder] = useState(null);

    const folders = [
        { name: 'Legal & Bye-laws', count: '12 Verified Artifacts', icon: <FaFolder /> },
        { name: 'Income Tax (12A/80G)', count: '08 Verified Artifacts', icon: <FaFolder /> },
        { name: 'Board Resolutions', count: '45 Verified Artifacts', icon: <FaFolder /> },
        { name: 'Personnel KYC Vault', count: '102 Verified Artifacts', icon: <FaFolder /> },
        { name: 'Program Audit Docs', count: '67 Verified Artifacts', icon: <FaFolder /> }
    ];

    const mockFiles = [
        { name: 'Certificate_of_Incorporation.pdf', date: '2023-01-15', size: '2.4 MB' },
        { name: 'Trust_Deed_Signed.pdf', date: '2023-02-10', size: '5.1 MB' },
        { name: '12A_Registration.pdf', date: '2023-03-22', size: '1.2 MB' },
        { name: '80G_Approval.pdf', date: '2023-04-05', size: '0.9 MB' },
        { name: 'Annual_Return_2024.pdf', date: '2024-01-20', size: '3.5 MB' }
    ];

    return (
        <div className="content-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {view === 'files' && <button className="btn-icon" onClick={() => setView('folders')}><FaArrowLeft /></button>}
                    {view === 'folders' ? 'Digital Filing System (Regulatory Vault)' : `Vault: ${activeFolder}`}
                </h3>
                <button className="btn-add"><FaFileUpload /> Upload Artifact</button>
            </div>

            {view === 'folders' ? (
                <div className="folders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
                    {folders.map(f => (
                        <div key={f.name} className="folder-card" onClick={() => { setActiveFolder(f.name); setView('files'); }}
                            style={{ padding: '30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '3.5rem', color: '#ecc94b', marginBottom: '15px' }}>{f.icon}</div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: '#2d3748' }}>{f.name}</h4>
                            <p style={{ fontSize: '0.8rem', color: '#718096' }}>{f.count}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <table className="data-table">
                    <thead><tr><th>File Name</th><th>Date Uploaded</th><th>Size</th><th>Actions</th></tr></thead>
                    <tbody>
                        {mockFiles.map((file, i) => (
                            <tr key={i}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaFileAlt style={{ color: '#e53e3e' }} /> {file.name}</td>
                                <td>{file.date}</td>
                                <td>{file.size}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="Preview"><FaEye /></button>
                                        <button className="btn-icon" title="Download"><FaDownload /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
