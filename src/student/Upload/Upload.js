import React, {useContext, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import './Upload.css';
import {RoleContext} from "../../RoleContext";
import serverUrl from "../../server";

function Upload() {
    const [file, setFile] = useState([]);
    const [submittedFiles, setSubmittedFiles] = useState([]);
    const [fileUploadVisible, setFileUploadVisible] = useState(true);
    const [session] = useContext(RoleContext);
    const [selectedForm, setSelectedForm] = useState('documentatie');
    const [isUploaded, setIsUplaoded] = useState(false);
    const [fileNames, setFileNames] = useState('');

    const onDrop = (acceptedFiles) => {
        setFile([...file, ...acceptedFiles]);
    };

    const {getRootProps, getInputProps} = useDropzone({onDrop});

    const handleDeleteFile = (index) => {
        const newFiles = [...file];
        newFiles.splice(index, 1);
        setFile(newFiles);
    };

    const handleSubmit = async () => {
        if (file[0].name.toString().endsWith(".pdf")) {
            if (file.length === 1) {
                const confirmare = window.confirm(`Ești sigur că vrei să trimiți următorul fișier?\n${file[0].name}`);
                if (confirmare) {
                    setFileNames(file[0].name)
                    for (const file1 of file) {
                        const formData = new FormData();
                        formData.append('files', file1);
                        let requestURL = `/file/${session.id}/project/${file1.name}`;
                        if (selectedForm === 'prezentare') requestURL = `/file/${session.id}/presentation/${file1.name}`;
                        try {
                            const response = await fetch(serverUrl + requestURL, {
                                method: 'POST', body: formData,
                            });

                            if (response.ok) {
                                const now = new Date();
                                const submittedFileList = file.map(file => ({name: file.name, submittedAt: now}));
                                setSubmittedFiles(prevSubmittedFiles => [...prevSubmittedFiles, ...submittedFileList]);
                                console.log('Fișierele au fost trimise cu succes!');
                                setFileUploadVisible(false);
                            } else {
                                console.error('A apărut o eroare la trimiterea fișierului:', response.statusText);
                            }
                        } catch (error) {
                            console.error('A apărut o eroare la trimiterea fișierului:', error);
                        }
                    }
                    setFile([]);
                    setIsUplaoded(true);
                }
            } else {
                alert("Încărcați un singur fișier")
            }
        } else {
            alert("Fișierul încărcat nu est PDF")
        }
    };

    const [config, setConfig] = useState({message: '', startDate: 0, endDate: 0})

    useEffect(() => {
        let requestURL = `/announcements/projectUploadConfig`;
        if (selectedForm === 'prezentare') requestURL = `/announcements/presentationUploadConfig`;
        fetch(serverUrl + requestURL)
            .then(response => response.json())
            .then(data => {
                setConfig(data)
            });
        setFile([])
    }, [selectedForm]);

    const handleView = async () => {
        let requestURL = `/file/${session.id}/ownProject`;
        if (selectedForm === 'prezentare') requestURL = `/file/${session.id}/ownPresentation`;
        try {
            const response = await fetch(serverUrl + requestURL, {
                method: 'GET', headers: {
                    'Accept': 'application/pdf'
                }
            });
            if (!response.ok) {
                throw new Error('Eroare de retea');
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url);

        } catch (error) {
            console.error('Cererea a esuat:', error);
        }
    }

    useEffect(() => {
        let requestURL = `/file/${session.id}/uploadedProject`;
        if (selectedForm === 'prezentare') requestURL = `/file/${session.id}/uploadedPresentation`;
        fetch(serverUrl + requestURL)
            .then(response => response.json())
            .then(data => {
                setIsUplaoded(data.isUploaded === 1);
                setFileNames('');
                if (data.isUploaded > 0) setFileNames(data.fileName);
            });
    }, [selectedForm]);

    const getTimeLeft = () => {
        const now = new Date();
        const timeDiff = config.endDate * 1000 - now.getTime();
        const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `${daysLeft} zile, ${hoursLeft} ore, ${minutesLeft} minute`;
    }

    const isOpen = () => {
        if (config.startDate === 0)
            return false;
        const now = new Date().getTime();
        return config.startDate * 1000 <= now;
    }

    const getEndDate = () => {
        let endDate = new Date(config.endDate * 1000);
        const options = {
            weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit'
        };
        return endDate.toLocaleString('ro-RO', options);
    }

    const getStartDate = () => {
        let startDate = new Date(config.startDate * 1000);
        const options = {
            weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit'
        };
        return startDate.toLocaleString('ro-RO', options);
    }

    return (<div>
        <div className="tabel-container">
            <h2 className="title-page">Înscriere licență</h2>
        </div>
        <div className="button-container">
            <button
                className={`form-toggle-button ${selectedForm === 'documentatie' ? 'active' : ''}`}
                onClick={() => setSelectedForm('documentatie')}
            >
                Încarcare Documentație
            </button>
            <button
                className={`form-toggle-button ${selectedForm === 'prezentare' ? 'active' : ''}`}
                onClick={() => setSelectedForm('prezentare')}
            >
                Încarcare Prezentare
            </button>
        </div>
        <div className="upload-container">
            <h2>Încarcă {selectedForm === 'documentatie' ? 'documentația' : 'prezentarea'}</h2>
            <div className="upload-instructions">
                <p className="text-info">{config.message}</p>
                {isOpen() ? (
                    <p className="text-info">Termen limită: {getEndDate()} ({getTimeLeft()}).</p>
                ) : (
                    (config.startDate === 0) ? ("Nu este disponibil!") : (
                        <p className="text-info">Se deschide la: {getStartDate()}.</p>
                    )
                )}
            </div>
            {isOpen() && (<>
                    {isUploaded === false && (<div className="upload-form" {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p className="drag-drop-text">Plasați fișierle aici sau apasăți click pentru a le selecta</p>
                    </div>)}
                </>
            )}
            {file.length > 0 && (<div className="uploaded-files">
                <h3>Fișiere încărcate:</h3>
                <ul>
                    {file.map((file, index) => (<li key={index}>
                        <span>{file.name}</span>
                        <button onClick={() => handleDeleteFile(index)}>Șterge</button>
                    </li>))}
                </ul>
            </div>)}
            {isUploaded === true && fileNames.length > 0 && (<div className="uploaded-files">
                <h3>Fișiere trimise:</h3>
                <ul>
                    {[fileNames].map((submittedFile, index) => (<li key={index}>
                        <span className="link" title="Vezi lucrarea" onClick={handleView}>{submittedFile}</span>
                    </li>))}
                </ul>
            </div>)}
            {file.length > 0 && (<button className="custom-file-upload" onClick={handleSubmit}>
                Trimite
            </button>)}
        </div>
    </div>);
}

export default Upload;
