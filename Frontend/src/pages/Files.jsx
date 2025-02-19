import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../css/Files.css';

const Files = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFile, setNewFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchUserFiles();
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
                    // Handle unauthorized access
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

    const handleViewFile = async (fileId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/${fileId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/pdf',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setErrors({ general: 'File not found.' });
                } else {
                    console.error('Failed to download file:', response.status);
                    setErrors({ general: 'Failed to download file.' });
                }
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            window.open(url, '_blank'); // Opens in a new tab

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100); // Revoke object URL after opening to free up memory
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
                    'Accept': 'application/pdf',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setErrors({ general: 'File not found.' });
                } else {
                    console.error('Failed to download file:', response.status);
                    setErrors({ general: 'Failed to download file.' });
                }
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'file.pdf';
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
        setErrors({}); // Clear previous errors

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
    };

    const handleChangeFile = (event) => {
        setSelectedFile(event.target.files[0]);
        setNewFile(event.target.files[0]);
    };

    const handleFileTypeChange = (event) => {
        setFileType(event.target.value);
    };

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
                <label for="file">Only PDF files under 5MB allowed</label>
                <input name="file" type="file" onChange={handleChangeFile}/>
                <select name="fileType" value={fileType} onChange={handleFileTypeChange}>
                    <option value="">Select File Type</option>
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
                            <button className="custom-button" onClick={() => handleViewFile(file.id)}>View</button>
                            <button className="custom-button" onClick={() => handleDownloadFile(file.id)}>Download</button>
                            <button className="custom-button-danger" onClick={() => handleDeleteFile(file.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Files;