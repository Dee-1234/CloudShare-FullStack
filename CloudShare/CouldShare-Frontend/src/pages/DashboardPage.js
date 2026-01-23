import React, { useState, useRef, useEffect, useCallback } from 'react';
import API from '../api/axios';

const DashboardPage = () => {
    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState('all'); 
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // 1. Fetch Files from Backend
    const fetchFiles = useCallback(async () => {
        try {
            const response = await API.get('/api/files/all');
            const normalizedData = response.data.map((f, index) => ({
                ...f,
                // Ensure unique key and required properties exist
                id: f.id || f.fileId || `file-${index}`,
                isStarred: f.isStarred || false,
                isTrashed: f.isTrashed || false,
                size: f.size || 0,
                fileName: f.fileName || 'Untitled File'
            }));
            setFiles(normalizedData);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    // 2. Optimized Upload Logic
    const uploadFile = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploadStatus('Uploading...');
        try {
            await API.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadStatus(`✅ Uploaded`);
            fetchFiles(); 
        } catch (error) {
            setUploadStatus('❌ Failed');
            console.error(error);
        }
    };

    // 3. Drag and Drop Handlers
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) uploadFile(droppedFile);
    };

    // 4. File Actions
    const toggleStar = (id) => {
        setFiles(prev => prev.map(file => 
            file.id === id ? { ...file, isStarred: !file.isStarred } : file
        ));
    };

    const moveToTrash = (id) => {
        setFiles(prev => prev.map(file => 
            file.id === id ? { ...file, isTrashed: true, isStarred: false } : file
        ));
        setUploadStatus('Moved to Trash');
    };

    const restoreFromFile = (id) => {
        setFiles(prev => prev.map(file => 
            file.id === id ? { ...file, isTrashed: false } : file
        ));
        setUploadStatus('Restored');
    };

    const deletePermanently = async (id) => {
        if (window.confirm("Permanently delete this file?")) {
            try {
                // If backend supports delete: await API.delete(`/api/files/${id}`);
                setFiles(prev => prev.filter(f => f.id !== id));
                setUploadStatus('Deleted Forever');
            } catch (error) {
                alert("Delete failed.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    // 5. Filter Logic (Search + Category + Recent slice)
    const getDisplayFiles = () => {
        const searched = files.filter(f => 
            f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterMode === 'trash') {
            return searched.filter(f => f.isTrashed);
        }

        // Active files (not in trash)
        const active = searched.filter(f => !f.isTrashed);

        if (filterMode === 'recent') return active.slice(-2);
        if (filterMode === 'starred') return active.filter(f => f.isStarred);
        
        return active;
    };

    const displayFiles = getDisplayFiles();

    return (
        <div style={styles.container}>
            {/* --- SIDEBAR --- */}
            <aside style={styles.sidebar}>
                <h2 style={styles.logo}>CloudShare</h2>
                <button onClick={() => fileInputRef.current.click()} style={styles.sidebarUploadBtn}>
                    + New
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={(e) => uploadFile(e.target.files[0])} 
                />
                
                <nav style={styles.navMenu}>
                    <div onClick={() => setFilterMode('all')} style={filterMode === 'all' ? styles.navItemActive : styles.navItem}>📁 My Files</div>
                    <div onClick={() => setFilterMode('recent')} style={filterMode === 'recent' ? styles.navItemActive : styles.navItem}>🕒 Recent</div>
                    <div onClick={() => setFilterMode('starred')} style={filterMode === 'starred' ? styles.navItemActive : styles.navItem}>⭐ Starred</div>
                    
                    <div 
                        onClick={() => setFilterMode('trash')} 
                        style={filterMode === 'trash' ? styles.navItemActiveTrash : styles.navItemTrash}
                    >
                        🗑️ Trash
                    </div>
                </nav>
            </aside>

            {/* --- MAIN AREA --- */}
            <main 
                style={{
                    ...styles.main, 
                    backgroundColor: isDragging ? '#f0f7ff' : '#f8fafc',
                    border: isDragging ? '2px dashed #2563eb' : 'none'
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <header style={styles.header}>
                    <input 
                        type="text" 
                        placeholder={`Search in ${filterMode}...`} 
                        style={styles.searchBar} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    <span style={{fontSize: '14px', color: '#2563eb', fontWeight: 'bold'}}>{uploadStatus}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </header>

                <section style={styles.content}>
                    <h1 style={{textTransform: 'capitalize', marginBottom: '20px'}}>{filterMode}</h1>
                    
                    <div style={styles.fileGrid}>
                        {displayFiles.length > 0 ? (
                            displayFiles.map((file) => (
                                <div key={file.id} style={styles.fileCard}>
                                    {!file.isTrashed && (
                                        <button 
                                            onClick={() => toggleStar(file.id)} 
                                            style={{...styles.starBtn, color: file.isStarred ? '#f59e0b' : '#cbd5e1'}}
                                        >★</button>
                                    )}
                                    
                                    <div style={{fontSize: '40px', marginBottom: '10px'}}>📄</div>
                                    <div style={styles.fileName} title={file.fileName}>{file.fileName}</div>
                                    <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>

                                    {file.isTrashed ? (
                                        <div style={styles.trashActions}>
                                            <button onClick={() => restoreFromFile(file.id)} style={styles.restoreBtn}>Restore</button>
                                            <button onClick={() => deletePermanently(file.id)} style={styles.permaDeleteBtn}>Delete Forever</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button onClick={() => moveToTrash(file.id)} style={styles.deleteBtn}>🗑️</button>
                                            <button 
                                                onClick={() => window.open(`http://localhost:8080/api/files/download/${file.id}`, '_blank')} 
                                                style={styles.downloadBtn}
                                            >Download</button>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                {filterMode === 'trash' ? "Trash is empty" : "No files found here."}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc' },
    sidebar: { width: '240px', padding: '24px', borderRight: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
    logo: { color: '#2563eb', fontWeight: '800', fontSize: '22px', marginBottom: '30px' },
    sidebarUploadBtn: { width: '100%', padding: '12px', borderRadius: '24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    navMenu: { marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: { padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' },
    navItemActive: { padding: '12px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' },
    navItemTrash: { padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', marginTop: 'auto' },
    navItemActiveTrash: { padding: '12px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.2s' },
    header: { height: '70px', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' },
    searchBar: { padding: '10px 20px', width: '300px', borderRadius: '25px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', outline: 'none' },
    logoutBtn: { color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' },
    content: { padding: '40px', overflowY: 'auto' },
    fileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' },
    fileCard: { position: 'relative', padding: '25px 15px', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' },
    starBtn: { position: 'absolute', top: '10px', left: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' },
    deleteBtn: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 },
    fileName: { fontWeight: '600', fontSize: '14px', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    fileSize: { color: '#94a3b8', fontSize: '12px', marginBottom: '15px' },
    downloadBtn: { width: '100%', padding: '10px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    trashActions: { display: 'flex', flexDirection: 'column', gap: '8px' },
    restoreBtn: { padding: '8px', backgroundColor: '#ecfdf5', color: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    permaDeleteBtn: { padding: '8px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
    emptyState: { textAlign: 'center', color: '#94a3b8', marginTop: '50px', gridColumn: '1 / -1' }
};

export default DashboardPage;