import React, {useEffect, useState} from 'react';
import XLSX from "xlsx-js-style";

import {FaEdit, FaSortAlphaDown, FaSortAlphaUp} from 'react-icons/fa';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";

import './CommitteeStudentsGenerator.css';
import serverUrl from "../../server";


const CommitteeStudentsGenerator = () => {
    const [showTable, setShowTable] = useState(false);
    const [loading, setLoading] = useState(true)

    const handleGenerareRepartizare = async () => {
        try {
            await fetch(serverUrl + '/committees/generate', {
                    method: 'POST'
                }
            ).then(() => {
                setShowTable(true);
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetch(serverUrl + '/committees/areGenerated')
            .then(response => response.json())
            .then(data => {
                setLoading(false)
                const areCommitteesGenerated = data.areCommitteesGenerated.toString() === 'true';
                setShowTable(areCommitteesGenerated)
            });
    }, []);

    return (<div className="generate-container">
        {!showTable && loading === false ? (<div className="titlu-tabel">
            <h1 className="titlu-tabel">Generere repartizări</h1>
            <button className="salvare-button" onClick={handleGenerareRepartizare}>
                Generare Repartizări
            </button>
        </div>) : (<TabelRepartizare/>)}
    </div>);
};

const TabelRepartizare = () => {
    const [searchTermNume, setSearchTermNume] = useState('');
    const [searchTermCoordonator, setSearchTermCoordonator] = useState('');
    const [searchTermComisie, setSearchTermComisie] = useState('');

    const [sortAscNume, setSortAscNume] = useState(true);
    const [sortAscCoordonator, setSortAscCoordonator] = useState(true);
    const [sortAscComisie, setSortAscComisie] = useState(true);

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true)
    const [sortDirections, setSortDirections] = useState({
        nume: true, coordonator: true, comisie: true,
    });

    useEffect(() => {
        fetch(serverUrl + '/committees/all')
            .then(response => response.json())
            .then(data => {
                setStudents(data.students);
                setLoading(false)
            });
    }, []);

    const handleSalvareComisie = (id, newValue) => {
        const newData = students.map(item => {
            if (item.userId === id) {
                return {...item, committeeId: newValue};
            }
            return item;
        });
        setStudents(newData);
    };

    const [pagina, setPagina] = useState(1);
    const randuriPerPage = 15;

    const startIndex = (pagina - 1) * randuriPerPage;
    const endIndex = Math.min(startIndex + randuriPerPage, students.length);

    const paginaUrmatoare = () => {
        setPagina(Math.min(pagina + 1, Math.ceil(students.length / randuriPerPage)));
    };

    const paginaAnterioara = () => {
        setPagina(Math.max(pagina - 1, 1));
    };

    const handleSort = (columnName) => {
        switch (columnName) {
            case 'nume':
                setSortAscNume(!sortAscNume);
                setSortDirections({nume: true, coordonator: false, comisie: false});
                break;
            case 'coordonator':
                setSortAscCoordonator(!sortAscCoordonator);
                setSortDirections({nume: false, coordonator: true, comisie: false});
                break;
            case 'comisie':
                setSortAscComisie(!sortAscComisie);
                setSortDirections({nume: false, coordonator: false, comisie: true});
                break;
            default:
                break;
        }
    };

    const filteredAndSortedData = students.filter(
        item => (item.firstName + ' ' + item.lastName).toLowerCase().includes(searchTermNume.toLowerCase()) &&
        item.coordinatorName.toLowerCase().includes(searchTermCoordonator.toLowerCase()) &&
        item.committeeId.toString().includes(searchTermComisie.toLowerCase()))
        .sort((a, b) => {
            if (sortDirections.nume) {
                return sortAscNume ? (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName) :
                    (b.firstName + ' ' + b.lastName).localeCompare(a.firstName + ' ' + a.lastName);
            } else if (sortDirections.coordonator) {
                return sortAscCoordonator ? a.coordinatorName.localeCompare(b.coordinatorName) : b.coordinatorName.localeCompare(a.coordinatorName);
            } else if (sortDirections.comisie) {
                return sortAscComisie ? (a.committeeId - b.committeeId) : (b.committeeId - a.committeeId);
            }
            return 0;
        });

    const headers = [{label: 'Nr. Crt.', key: 'index'}, {label: 'Nume', key: 'lastName'}, {
        label: 'Prenume', key: 'firstName'
    }, {
        label: 'Nume coordonator', key: 'coordinatorName'
    }, {label: 'Comisie', key: 'committeeId'},];


    const handleDownload = () => {
        const title = "Repartizare Studenți";
        const wsData = [[title], // Title row
            headers.map(header => header.label), // Header row
            ...filteredAndSortedData.map((item, index) => [
                startIndex + index + 1,
                item.lastName,
                item.firstName,
                item.coordinatorName,
                item.committeeId,
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        const headerStyle = {
            font: {bold: true, color: {rgb: "FFFFFF"}},
            fill: {fgColor: {rgb: "2D3192"}},
            alignment: {horizontal: "center"}
        };

        const titleStyle = {
            font: {bold: true, sz: 16, color: {rgb: "2D3192"}}, alignment: {horizontal: "center"}
        };

        const dataStyle = {
            alignment: {horizontal: "center"}
        };

        ws['!cols'] = headers.map(() => ({wpx: 100}));
        ws['A1'].s = titleStyle;
        ws['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: headers.length - 1}}];

        headers.forEach((header, index) => {
            const cellAddress = XLSX.utils.encode_cell({c: index, r: 1});
            if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: header.label};
            ws[cellAddress].s = headerStyle;
        });

        filteredAndSortedData.forEach((item, rowIndex) => {
            const row = [startIndex + rowIndex + 1, item.lastName, item.firstName, item.coordinatorName, item.committeeId];

            row.forEach((cellValue, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: rowIndex + 2});
                if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: cellValue};
                ws[cellAddress].s = dataStyle;
            });
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Repartizare Studenți");
        XLSX.writeFile(wb, "Repartizare_studenti.xlsx");
    };

    return (<div>{loading === false && (<div>
        <div className="generate-container">
            <h2 className="titlu-tabel">Generare repartizare</h2>
        </div>
        <div className="tabel-container">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Caută nume..."
                    value={searchTermNume}
                    onChange={(e) => setSearchTermNume(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Caută coordonator..."
                    value={searchTermCoordonator}
                    onChange={(e) => setSearchTermCoordonator(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Caută comisie..."
                    value={searchTermComisie}
                    onChange={(e) => setSearchTermComisie(e.target.value)}
                />
            </div>
            <table>
                <button className="download-button" onClick={handleDownload}>
                    <FontAwesomeIcon icon={faDownload}/> Descarcă Tabelul
                </button>
                <thead>
                <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                    <th>Nr. Crt</th>
                    <th>
                        Nume candidat{' '}
                        <button className="sort-button" onClick={() => handleSort('nume')}>
                            {sortAscNume ? <FaSortAlphaDown/> : <FaSortAlphaUp/>}
                        </button>
                    </th>
                    <th>
                        Nume coordonator{' '}
                        <button className="sort-button" onClick={() => handleSort('coordonator')}>
                            {sortAscCoordonator ? <FaSortAlphaDown/> : <FaSortAlphaUp/>}
                        </button>
                    </th>
                    <th>
                        Comisie{' '}
                        <button className="sort-button" onClick={() => handleSort('comisie')}>
                            {sortAscComisie ? <FaSortAlphaDown/> : <FaSortAlphaUp/>}
                        </button>
                    </th>
                </tr>
                </thead>
                <tbody>
                {filteredAndSortedData.slice(startIndex, endIndex).map((item, index) => (<tr key={index}>
                    <td>{index + 1 + randuriPerPage * (pagina - 1)}</td>
                    <td>{item.firstName} {item.lastName}</td>
                    <td>{item.coordinatorName}</td>
                    <td>
                        <EditableCell
                            id={item.userId}
                            value={item.committeeId}
                            onSave={handleSalvareComisie}
                        />
                    </td>
                </tr>))}
                </tbody>
            </table>
            <div className="navigare">
                <button onClick={paginaAnterioara} disabled={pagina === 1}>
                    Pagina Anterioară
                </button>
                <span>
                        Pagina {pagina} din {Math.ceil(filteredAndSortedData.length / randuriPerPage)}
                    </span>
                <button onClick={paginaUrmatoare}
                        disabled={pagina === Math.ceil(filteredAndSortedData.length / randuriPerPage)}>
                    Pagina Următoare
                </button>
            </div>
        </div>
    </div>)}
    </div>);
};

const EditableCell = ({id, value, onSave}) => {
    const [editMode, setEditMode] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSave = async () => {
        const confirmare = window.confirm(`Ești sigur că dorești să salvezi comisia?`);
        if (confirmare) {
            try {
                await fetch(serverUrl + `/committees/moveStudent`, {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json',
                    }, body: JSON.stringify({committeeId: inputValue, studentId: id}),
                })
                    .then(() => {
                        onSave(id, inputValue);
                        setEditMode(false);
                    });
            } catch (error) {
                alert("Comisie inexistentă")
                setEditMode(false)
                setInputValue("");
                console.log(error);
            }

        }
    };

    return (<div>
        {editMode ? (<div>
            <button onClick={toggleEditMode}><FaEdit/></button>
            <div className="popup-container">
                <input
                    className="textarea-field"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <button className="salvare-button" onClick={handleSave}>Salvează</button>
            </div>
        </div>) : (<div>
            {value + "\t"}
            <button onClick={toggleEditMode}><FaEdit/></button>
        </div>)}
    </div>);
};

export default CommitteeStudentsGenerator;

