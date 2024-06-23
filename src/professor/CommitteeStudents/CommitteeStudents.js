import React, {useContext, useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {RoleContext} from "../../RoleContext";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";

import './CommitteeStudents.css';
import serverUrl from "../../server";

const RandTabel = ({index, student}) => {
    const [session] = useContext(RoleContext);
    const [popupVisible, setPopupVisible] = useState(false);
    const [projectGrade, setProjectGrade] = useState('');
    const [knowledgeGrade, setKnowledgeGrade] = useState('');
    const [examGrade, setExamGrade] = useState('');
    const [status, setStatus] = useState('fa-circle-question');
    const [file, setFile] = useState([]);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [isUploaded, setIsUploaded] = useState(student === undefined ? 0 : student.pvUploaded);

    useEffect(() => {
        if (student.examGrade.mean !== 0) {
            setExamGrade(student.examGrade.mean)
        }
        setStatus(student.examGrade.status === '1' ? 'fa-circle-check' : student.examGrade.status === '2' ? 'fa-triangle-exclamation' : 'fa-circle-question')
    }, []);

    const handleEditareNota = () => {
        setPopupVisible(!popupVisible);
    };

    const handleSalvare = async () => {
        const confirmare = window.confirm(`Ești sigur că dorești să salvezi nota?`);
        if (confirmare) {
            let studentId = student.userId
            console.log(studentId)
            try {
                await fetch(serverUrl + `/exam/${session.id}/grade`, {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json',
                    }, body: JSON.stringify({knowledgeGrade, projectGrade, studentId}),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        setExamGrade(data.mean);
                        if (data.status !== 3) {
                            setPopupVisible(false);
                        }
                        setStatus(data.status === '1' ? 'fa-circle-check' : data.status === '2' ?
                            'fa-triangle-exclamation' : 'fa-circle-question')
                    });
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleSendFile = async () => {
        if (file[0].name.toString().endsWith(".pdf")) {
            if(file.length === 1) {
                const confirmare = window.confirm(`Ești sigur că vrei să trimiți următorul fișier?\n${file[0].name}`);

                if (confirmare) {
                    for (const file1 of file) {
                        const formData = new FormData();
                        formData.append('files', file1);
                        try {
                            const response = await fetch(serverUrl + `/file/${student.userId}/pv/${file1.name}`, {
                                method: 'POST', body: formData,
                            });

                            if (response.ok) {
                                console.log('Fișierele au fost trimise cu succes!');
                            } else {
                                console.error('A apărut o eroare la trimiterea fișierelor:', response.statusText);
                            }
                        } catch (error) {
                            console.error('A apărut o eroare la trimiterea fișierelor:', error);
                        }
                    }
                    setFile([]);
                    setIsFileSelected(false);
                    setIsUploaded(1);
                }
            } else {
                alert("Încărcați un singur fișier")
            }
        } else {
            alert("Fișierul încărcat nu est PDF")
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

    const handleView = async () => {
        try {
            const response = await fetch(serverUrl + `/file/${student.userId}/project`, {
                method: 'GET', headers: {
                    'Accept': 'application/pdf'
                }
            });
            if (!response.ok) {
                console.log(response)
                throw new Error('Eroare de retea');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url);
        } catch (error) {
            console.error('Cererea a esuat:', error);
        }
    }

    const handleViewEvaluation = async () => {
        try {
            const response = await fetch(serverUrl + `/file/${student.userId}/appendix`, {
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

    const fileInputId = `file-upload-${index}`;

    return (<tr>
        <td>{student.firstName + ' ' + student.lastName}</td>
        <td>
            <a className="link" title="Vezi lucrarea" onClick={handleView}>{student.projectName}</a>
        </td>
        <td>
            <a className="link" title="Vezi evaluare coordonatorului"
               onClick={handleViewEvaluation}>{student.coordName}</a>
        </td>
        <td>{student.coordGrade}</td>
        <td>{student.schoolGrade}</td>
        {session.isSecretary === 0 && <td>
            {examGrade !== null && (examGrade + "\t")}
            <>
                <button onClick={handleEditareNota}>
                    <i className="fa-solid fa-pen"></i>
                </button>
                {popupVisible && (<div className="popup-container">
                    <div className="input-group">
                        <input
                            className="textarea-field"
                            type="number"
                            placeholder="Nota proiect"
                            value={projectGrade}
                            onChange={(e) => setProjectGrade(e.target.value)}
                        />
                        <input
                            className="textarea-field"
                            type="number"
                            placeholder="Nota cunoștințe"
                            value={knowledgeGrade}
                            onChange={(e) => setKnowledgeGrade(e.target.value)}
                        />
                        <button className="salvare-button" onClick={handleSalvare}>Salvează</button>
                    </div>
                </div>)}
            </>
        </td>}
        {session.isSecretary === 1 && <td>
            {(student.pvUploaded === 0 && isUploaded === 0) ? (<div className="coordinatorStudents-action">
                <input id={fileInputId} type="file" onChange={handleFileUpload} multiple
                       style={{display: 'none'}}/>
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
        </td>}
        {session.isSecretary === 0 && <td><i className={`fa-solid ${status}`}
                                             style={{color: (status === 'fa-circle-question' ? 'orange' : status === 'fa-circle-check' ? 'green' : 'red')}}
                                             title={status === 'fa-circle-question' ? 'Nota este în curs de evaluare.' : status === 'fa-circle-check' ? 'Nota a fost confirmată.' : 'Nota necesită atenție suplimentară.'}>
        </i></td>}
    </tr>);
};

function CommitteeStudents() {
    const [session] = useContext(RoleContext);
    const [loading, setLoading] = useState(true)
    const [count, setCount] = useState(0)
    const [comisie, setComisie] = useState(null)
    const [pagina, setPagina] = useState(1);
    const randuriPerPage = session.isSecretary === 1 ? 10 : 13;
    const [students, setStudents] = useState({
        userId: null, firstName: null, lastName: null, projectName: null, hour: null, schoolGrade: null,
    })

    useEffect(() => {
        fetch(serverUrl + `/committees/${session.id}/students`)
            .then(response => response.json())
            .then(data => {
                setLoading(false)
                setStudents(data.students);
                setCount(data.count)
                setComisie(data.committeeId)
            });
    }, []);

    const handleDownload = async () => {
        try {
            const response = await fetch(serverUrl + `/file/pvTemplate`, {
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
            link.setAttribute('download', 'PV_Sustinere.doc');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Cererea a esuat:', error);
        }
    }

    const numarTotalPagini = Math.ceil(count / randuriPerPage);

    const startIndex = (pagina - 1) * randuriPerPage;

    const endIndex = Math.min(startIndex + randuriPerPage, count);

    const paginaUrmatoare = () => {
        setPagina(Math.min(pagina + 1, numarTotalPagini));
    };

    const paginaAnterioara = () => {
        setPagina(Math.max(pagina - 1, 1));
    };

    return (<div>
        {loading === false && (<div className="tabel-container">
            <h2 className="titlu-tabel">Listă candidați comisia {comisie}</h2>
            <div className="button-grades-container">
                <Link to="/allGrades" className="button-grades">
                    <FontAwesomeIcon icon={faEdit}/> Vezi toate notele
                </Link>
            </div>
            <table>
                <thead>
                <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                    <th>Nume candidat</th>
                    <th>Nume lucrare</th>
                    <th>Profesor coordonator</th>
                    <th>Notă coordonator</th>
                    <th>Notă 4 ani studiu</th>
                    {session.isSecretary === 0 && <th>Notă finală</th>}
                    {session.isSecretary === 1 && <th>Proces verbal {"\t"}
                        <a className="download-document" onClick={handleDownload}
                           target="_blank" title="Vezi proces verbal"><i
                            className="fa-solid fa-download"></i></a></th>}
                    {session.isSecretary === 0 && <th>Status</th>}
                </tr>
                </thead>
                <tbody>
                {Array.from({length: endIndex - startIndex}, (_, index) => (
                    <RandTabel key={startIndex + index} index={startIndex + index + 1}
                               student={students[startIndex + index]}/>))}
                </tbody>
            </table>
            <div className="navigare">
                <button onClick={paginaAnterioara} disabled={pagina === 1}>
                    Pagina Anterioară
                </button>
                <span>
                    Pagina {pagina} din {numarTotalPagini === 0 ? 1 : numarTotalPagini}
                </span>
                <button onClick={paginaUrmatoare} disabled={numarTotalPagini === 0 || pagina === numarTotalPagini}>
                    Pagina Următoare
                </button>
            </div>
        </div>)}
    </div>);
}

export default CommitteeStudents;
