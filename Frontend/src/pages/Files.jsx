import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import JSZip from 'jszip';
import '../css/Files.css';

const Files = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFile, setNewFile] = useState(null);
    const [fileType, setFileType] = useState(undefined);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null); 
    const [jobApplications, setJobApplications] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);

    useEffect(() => {
        fetchUserFiles();
        fetchJobApplications();
    }, []);

    const fetchUserFiles = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/all`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error('Access denied or unauthorized.');
                } else if (response.status === 404) {
                    setErrors({ general: 'No files found.' });
                } else {
                    console.error('Failed to fetch files:', response.status);
                    setErrors({ general: 'Failed to fetch files.' });
                }
                return;
            }

            const filesData = await response.json();
            setFiles(filesData);
        } catch (error) {
            console.error('Failed to fetch user files:', error);
            setErrors({ general: 'An unexpected error occurred while fetching files.' });
        }
    };

    const fetchJobApplications = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/getuserjobs`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error('Access denied or unauthorized.');
                } else {
                    console.error('Failed to fetch job applications:', response.status);
                    setErrors({ general: 'Failed to fetch job applications.' });
                }
                return;
            }

            const jobsData = await response.json();
            setJobApplications(jobsData);
        } catch (error) {
            console.error('Failed to fetch job applications:', error);
            setErrors({ general: 'An unexpected error occurred while fetching job applications.' });
        }
    };

    const handleViewFile = async (fileId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/${fileId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/zip',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setErrors({ general: 'File not found.' });
                } else {
                    console.error('Failed to fetch file:', response.status);
                    setErrors({ general: 'Failed to fetch file.' });
                }
                return;
            }

            const zipBlob = await response.blob();
            const zip = await JSZip.loadAsync(zipBlob); // Unzip
            const pdfFileName = Object.keys(zip.files)[0]; // Get the PDF name
            const pdfArrayBuffer = await zip.file(pdfFileName).async('arraybuffer'); // Get PDF as ArrayBuffer

            // Create a Blob with explicit application/pdf MIME type
            const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            window.open(url, '_blank'); // Open the PDF in a new tab

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100); // Clean up
        } catch (error) {
            console.error('Failed to open file:', error);
            setErrors({ general: 'An unexpected error occurred while opening the file.' });
        }
    };

    const handleDownloadFile = async (fileId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/${fileId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/zip',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setErrors({ general: 'File not found.' });
                } else {
                    console.error('Failed to fetch file:', response.status);
                    setErrors({ general: 'Failed to fetch file.' });
                }
                return;
            }

            const zipBlob = await response.blob();
            const zip = await JSZip.loadAsync(zipBlob); // Unzip
            const pdfFileName = Object.keys(zip.files)[0]; // Get the PDF name
            const pdfBlob = await zip.file(pdfFileName).async('blob'); // Extract the PDF

            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdfFileName; // Use the actual PDF name
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download file:', error);
            setErrors({ general: 'An unexpected error occurred while downloading the file.' });
        }
    };

    const handleUploadFile = async (event) => {
        event.preventDefault();

        if (!newFile || !fileType) return;

        setIsUploading(true); // Start the spinner
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('file', newFile);
            formData.append('fileType', fileType);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    setErrors(errorData.errors || { general: 'Failed to upload the file.' });
                } else if (response.status === 429) {
                    setErrors({ general: 'Too many requests. Please try again later.' });
                } else if (response.status === 500) {
                    setErrors({ general: 'Internal server error while uploading file.' });
                } else {
                    console.error('Failed to upload file:', response.status);
                    setErrors({ general: 'Failed to upload file.' });
                }
                return;
            }

            fetchUserFiles(); // Refresh the list
        } catch (error) {
            console.error('Failed to upload file:', error);
            setErrors({ general: 'An unexpected error occurred while uploading the file.' });
        } finally {
            setIsUploading(false); // Stop the spinner
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/${fileId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setErrors({ general: 'File not found.' });
                    } else {
                        console.error('Failed to delete file:', response.status);
                        setErrors({ general: 'Failed to delete file.' });
                    }
                    return;
                }

                fetchUserFiles(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete file:', error);
                setErrors({ general: 'An unexpected error occurred while deleting the file.' });
            }
        }
    };

    const handleChangeFile = (event) => {
        setSelectedFile(event.target.files[0]);
        setNewFile(event.target.files[0]);
    };

    const handleFileTypeChange = (event) => {
        setFileType(event.target.value);
    };

    const handleFileLink = (fileId) => {
        setSelectedFileId(fileId);
        setShowLinkModal(true); // Show modal to select job application
    };

    const handleLinkFileToJob = async () => {
        if (!selectedFileId || !selectedJobId) {
            setErrors({ general: 'Please select a file and job application.' });
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/link/${selectedFileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobId: selectedJobId }),
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    setErrors(errorData.errors || { general: 'Failed to link file to job application.' });
                } else {
                    console.error('Failed to link file:', response.status);
                    setErrors({ general: 'Failed to link file to job application.' });
                }
                return;
            }

            setErrors({});
            setShowLinkModal(false); // Hide modal
            setSelectedFileId(null); // Reset selected file
            setSelectedJobId(null); // Reset selected job
            fetchUserFiles();
        } catch (error) {
            console.error('Failed to link file to job:', error);
            setErrors({ general: 'An unexpected error occurred while linking the file.' });
        }
    };

    // Filter jobs not linked to the selected file
    const availableJobs = jobApplications.filter(job => {
        const file = files.find(f => f.id === selectedFileId);
        return !file?.jobIds?.includes(job.id);
    });

    return (
        <div className="files-container">
            <div className="nav-container">
                <Navbar />
            </div>

            <h2>Files</h2>

            {Object.keys(errors).length > 0 && (
                <div className="alert alert-danger">
                    {Object.keys(errors).map((key) => (
                        <p key={key}>{key === 'general' ? errors[key] : <span>{key}: {errors[key]}</span>}</p>
                    ))}
                </div>
            )}

            <form onSubmit={handleUploadFile}>
                <label htmlFor="file">Only PDF files under 5MB allowed</label>
                <input name="file" id="file" type="file" onChange={handleChangeFile}/>
                <select name="fileType" value={fileType} onChange={handleFileTypeChange}>
                    <option value="Resume">Resume</option>
                    <option value="CoverLetter">Cover Letter</option>
                </select>
                <button type="submit" className="custom-button" disabled={isUploading}>
                    {isUploading ? (
                        <span className="spinner"></span>
                    ) : (
                        'Upload File'
                    )}
                </button>
            </form>

            <ul id="files-list">
                {files.map(file => (
                    <li key={file.id}>
                        <h5>{file.name} - {file.fileType}</h5>
                        <div id="file-actions">
                            <button className="custom-button" onClick={() => handleFileLink(file.id)}>Attach to Application</button>
                            <button className="custom-button" onClick={() => handleViewFile(file.id)}>View</button>
                            <button className="custom-button" onClick={() => handleDownloadFile(file.id)}>Download</button>
                            <button className="custom-button-danger" onClick={() => handleDeleteFile(file.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal for Linking File to Job Application */}
            {showLinkModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Link File to Job Application</h3>
                        <select
                            value={selectedJobId || ''}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                        >
                            <option value="">Select Job Application</option>
                            {availableJobs.length > 0 ? (
                                availableJobs.map(job => (
                                    <option key={job.id} value={job.id}>
                                        {job.title || `Untitled Job`} at {job.company || `Unknown Company`}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No available job applications</option>
                            )}
                        </select>
                        <div className="modal-actions">
                            <button className="custom-button" onClick={handleLinkFileToJob}>Link</button>
                            <button className="custom-button-danger" onClick={() => setShowLinkModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Files;