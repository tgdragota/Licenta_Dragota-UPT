import React, {useContext, useEffect, useState} from 'react';
import {RoleContext} from "../../RoleContext";

import '../CommitteeStudents/CommitteeStudents.css';
import './CoordinatorStudents.css'
import serverUrl from "../../server";

const RandTabel = ({id, student}) => {
    const [session] = useContext(RoleContext);
    const [popupVisible, setPopupVisible] = useState(false);
    const [projectGrade, setProjectGrade] = useState(student.grade);
    const [inputProjectGrade, setInputProjectGrade] = useState(0);
    const [file, setFile] = useState([]);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [isUploaded, setIsUploaded] = useState(student.appendixUploaded);

    const handleEditareNota = () => {
        setPopupVisible(!popupVisible);
    };

    const handleSalvare = async () => {
        const confirmare = window.confirm(`Ești sigur că dorești să salvezi nota?`);
        if (confirmare) {
            setProjectGrade(inputProjectGrade)
            try {
                await fetch(serverUrl + `/coordinator/${session.id}/grade`, {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json',
                    }, body: JSON.stringify({studentId: student.studentId, grade: inputProjectGrade}),
                });
            } catch (error) {
                console.log(error);
            }
            setPopupVisible(false);
        }
    };

    const handleFileUpload = (event) => {
        const newFiles = [...event.target.files];
        setFile([...file, ...newFiles]);
        setIsFileSelected(true);
    };

    const handleDeleteFile = (index) => {
        const newFiles = [...file];
        newFiles.splice(index, 1);
        setFile(newFiles);
        setIsFileSelected(newFiles.length > 0);
    };

    const handleSendFile = async () => {
        if (file[0].name.toString().endsWith(".pdf")) {
            if (file.length === 1) {
                const confirmare = window.confirm(`Ești sigur că vrei să trimiți următorul fișier?\n${file[0].name}`);
                if (confirmare) {
                    for (const file1 of file) {
                        const formData = new FormData();
                        formData.append('files', file1);
                        try {
                            const response = await fetch(serverUrl + `/file/${student.studentId}/appendix/${file1.name}`, {
                                method: 'POST', body: formData,
                            });

                            if (response.ok) {
                                console.log('Fișierele au fost trimise cu succes!');
                            } else {
                                console.error('A apărut o eroare la trimiterea fișierului:', response.statusText);
                            }
                        } catch (error) {
                            console.error('A apărut o eroare la trimiterea fișierului:', error);
                        }
                    }
                    setFile([]);
                    setIsFileSelected(false);
                    setIsUploaded(1)
                }
            } else {
                alert("Încărcați un singur fișier")
            }
        } else {
            alert("Fișierul încărcat nu est PDF")
        }
    };

    const handleView = async () => {
        try {
            const response = await fetch(serverUrl + `/file/${student.studentId}/project`, {
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

    const fileInputId = `file-upload-${id}`;

    return (<tr>
        <td>{student.studentName}</td>
        <td>
            <a className="link" title="Vezi lucrarea" onClick={handleView}>{student.projectName}</a>
        </td>
        <td>{student.schoolGrade}</td>
        <td>
            {projectGrade !== 0 ? (projectGrade) : (<>
                <button onClick={handleEditareNota}>
                    <i className="fa-solid fa-pen"></i>
                </button>
                {popupVisible && (<div className="popup-container">
                    <input
                        className="textarea-field"
                        type="number"
                        placeholder="Nota proiect"
                        onChange={(e) => setInputProjectGrade(e.target.value)}
                    />
                    <button className="salvare-button" onClick={handleSalvare}>Salvează</button>
                </div>)}
            </>)}
        </td>
        <td>
            {(student.appendixUploaded === 0 && isUploaded === 0) ? (<div className="coordinatorStudents-action">
                <input id={fileInputId} type="file" onChange={handleFileUpload} multiple style={{display: 'none'}}/>
                {isFileSelected ? <button onClick={handleSendFile}>Încarcă</button> :
                    <label htmlFor={fileInputId} className="custom-file-upload">
                        Alege fișierul
                    </label>}
            </div>) : (<i className="fa-solid fa-circle-check" style={{color: "green"}}/>)}
            {file.length > 0 && (<div className="uploaded-file">
                <ul>
                    {file.map((file, index) => (<li key={index}>
                        <span>{file.name}</span>
                        <button onClick={() => handleDeleteFile(index)}>Șterge</button>
                    </li>))}
                </ul>
            </div>)}
        </td>
    </tr>);
};

const CoordinatorStudents = () => {
    const [pagina, setPagina] = useState(1);
    const [studenti, setStudenti] = useState([]);
    const randuriPerPage = 9;
    const [session] = useContext(RoleContext);
    const [students, setStudents] = useState(new Map())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(serverUrl + `/coordinator/${session.id}/students`)
            .then(response => response.json())
            .then(data => {
                setLoading(false);
                const mapStudents = new Map();
                const newStudenti = [];
                for (let i = 0; i < data.count; i++) {
                    mapStudents.set(i + 1, data.students[i])
                    newStudenti.push({id: i + 1})
                }
                setStudents(mapStudents)
                setStudenti(newStudenti)
            });
    }, []);

    const getRanduriPaginaCurenta = () => {
        const startIndex = (pagina - 1) * randuriPerPage;
        const endIndex = Math.min(startIndex + randuriPerPage, studenti.length);
        return studenti.slice(startIndex, endIndex);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(serverUrl + `/file/appendixTemplate`, {
                method: 'GET', headers: {
                    'Accept': 'application/octet-stream'
                }
            });
            if (!response.ok) {
                throw new Error('Eroare de retea');
            }
            const data = await response.blob();
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Anexa 4 ro - Fisa evaluare diploma-licenta.docx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Cererea a esuat', error);
        }
    }

    const paginaUrmatoare = () => {
        setPagina(Math.min(pagina + 1, Math.ceil(studenti.length / randuriPerPage)));
    };

    const paginaAnterioara = () => {
        setPagina(Math.max(pagina - 1, 1));
    };

    return (<div>
        {loading === false && (<div className="tabel-container">
            <h2 className="titlu-tabel">Listă studenți</h2>
            <table>
                <thead>
                <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                    <th>Nume candidat</th>
                    <th>Numele lucrare</th>
                    <th>Notă 4 ani</th>
                    <th>Notă lucrare</th>
                    <th>Fișă evaluare {"\t"}
                        <a className="download-document" onClick={handleDownload} title="Vezi fișa de evaluare"><i
                            className="fa-solid fa-download"></i></a>
                    </th>
                </tr>
                </thead>
                <tbody>
                {getRanduriPaginaCurenta().map(student => (<RandTabel key={student.id} id={student.id}
                                                                      student={students.get(student.id)}/>))}
                </tbody>
            </table>
            {studenti.length >= randuriPerPage && (<div className="navigare">
                <button onClick={paginaAnterioara} disabled={pagina === 1}>
                    Pagina Anterioară
                </button>
                <span>
                    Pagina {pagina} din {Math.ceil(studenti.length / randuriPerPage)}
                </span>
                <button onClick={paginaUrmatoare}
                        disabled={pagina === Math.ceil(studenti.length / randuriPerPage)}>
                    Pagina Următoare
                </button>
            </div>)}
        </div>)}
    </div>);
};

export default CoordinatorStudents;
