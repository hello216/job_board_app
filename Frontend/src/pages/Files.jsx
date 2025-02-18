import React, { useState, useEffect } from 'react';

const Files = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFile, setNewFile] = useState(null);

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
                    navigate('/login');
                } else {
                    console.error('Failed to fetch files:', response.status);
                }
                return;
            }

            const filesData = await response.json();
            setFiles(filesData);
        } catch (error) {
            console.error('Failed to fetch user files:', error);
        }
    };

    const handleDownloadFile = async (fileId) => {
        try {
            const response = await fetch(`${BASE_API_URL}/files/${fileId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/pdf',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.error('File not found.');
                } else {
                    console.error('Failed to download file:', response.status);
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
        }
    };

    const handleUploadFile = async (event) => {
        event.preventDefault();

        if (!newFile)
            return;

        try {
            const formData = new FormData();
            formData.append('file', newFile);
            formData.append('fileType', 'Resume');

            const response = await fetch(`${BASE_API_URL}/files`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Failed to upload file:', response.status);
                if (response.status === 500) {
                    console.error('Internal server error while uploading file.');
                }
                return;
            }

            fetchUserFiles(); // Refresh the list
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            const response = await fetch(`${BASE_API_URL}/files/${fileId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.error('File not found.');
                } else {
                    console.error('Failed to delete file:', response.status);
                }
                return;
            }

            fetchUserFiles(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const handleChangeFile = (event) => {
        setSelectedFile(event.target.files[0]);
        setNewFile(event.target.files[0]);
    };

    return (
        <div className="files-container">
            <h2>Files</h2>

            <form onSubmit={handleUploadFile}>
                <input type="file" onChange={handleChangeFile} />
                <button type="submit" className="custom-button">Upload File</button>
            </form>

            <ul>
                {files.map(file => (
                    <li key={file.Id}>
                        <span>{file.Name}</span>
                        <button className="custom-button" onClick={() => handleDownloadFile(file.Id)}>Download</button>
                        <button className="custom-button" onClick={() => handleDeleteFile(file.Id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Files;