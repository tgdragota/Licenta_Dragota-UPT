import React, {useEffect, useState} from 'react';

import './CommitteeCreator.css';
import serverUrl from "../../server";
import XLSX from "xlsx-js-style";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";

const CommitteeCreator = () => {

    const [committeesCount, setCommitteesCount] = useState(0);
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [newMember, setNewMember] = useState(null);

    useEffect(() => {
        fetch(serverUrl + `/committees/count`)
            .then(response => response.json())
            .then(data => {
                setLoading(false)
                setCommitteesCount(parseInt(data.count))
                setReload(false);
            });
    }, [reload]);

    const [committee, setCommittee] = useState({
        committeeId: committeesCount + 1, president: '', secretary: '', members: ['']
    })
    const [afiseazaComisia, setAfiseazaComisia] = useState(false);

    const handleChange = (e, memberIndex) => {
        if (memberIndex === 1) {
            let newCommittee = {
                committeeId: committee.committeeId,
                president: e.target.value,
                secretary: committee.secretary,
                members: committee.members
            }
            setCommittee(newCommittee)
        } else if (memberIndex === 2) {
            let newCommittee = {
                committeeId: committee.committeeId,
                president: committee.president,
                secretary: e.target.value,
                members: committee.members
            }
            setCommittee(newCommittee)
        } else {
            let newMembers = committee.members
            newMembers[memberIndex - 3] = e.target.value
            let newCommittee = {
                committeeId: committee.committeeId,
                president: committee.president,
                secretary: committee.secretary,
                members: newMembers
            }
            setCommittee(newCommittee)
        }
    };

    const adaugaRand = () => {
        let newMembers = committee.members
        newMembers.push('')
        let newCommittee = {
            committeeId: committee.committeeId,
            president: committee.president,
            secretary: committee.secretary,
            members: newMembers
        }
        setCommittee(newCommittee)
    };

    const stergeRand = (id) => {
        let newMembers = committee.members
        newMembers.splice(id, 1)
        let newCommittee = {
            committeeId: committee.committeeId,
            president: committee.president,
            secretary: committee.secretary,
            members: newMembers
        }
        setCommittee(newCommittee)
    };

    const salveazaComisia = async () => {
        const confirm = window.confirm("Ești sigur că vrei să salvezi comisia?");
        if (confirm) {
            if (committee.president.trim() === '' || committee.secretary.trim() === '' ||
                committee.members.length === 0 || committee.members.filter(value => value.trim() === '').length !== 0) {
                alert("Date incomplete!")
            } else {
                try {
                    await fetch(serverUrl + `/committees/${committee.committeeId}`, {
                        method: 'POST', headers: {
                            'Content-Type': 'application/json',
                        }, body: JSON.stringify(committee),
                    }).then(() => {
                        setReload(true);
                        setAfiseazaComisia(true);
                    });
                } catch (error) {
                    console.log(error);
                    alert("Date incorecte");
                }
            }
        }
    };

    const afiseazaComisiaSalvata = (index) => {
        fetch(serverUrl + `/committees/${index + 1}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setCommittee(data)
            });
        setAfiseazaComisia(true);
    };

    const intoarceLaCreare = () => {
        let newId = committeesCount + 1
        setCommittee({
            committeeId: newId, president: '', secretary: '', members: ['']
        })
        setAfiseazaComisia(false);
    };

    const toggleEditMode = async (key) => {
        setEditingIndex(key);
        setEditMode(!editMode);
        if (editMode) {
            try {
                await fetch(serverUrl + `/committees/member`, {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json',
                    }, body: JSON.stringify({committeeId: committee.committeeId, position: key, newValue: newMember}),
                });
                afiseazaComisiaSalvata(committee.committeeId - 1)
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewMember(value);
    };

    const handleDeleteMember = async (key) => {
        try {
            await fetch(serverUrl + `/committees/member`, {
                method: 'DELETE', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({committeeId: committee.committeeId, position: key}),
            });
            afiseazaComisiaSalvata(committee.committeeId - 1)
        } catch (error) {
            console.log(error);
        }
    }

    const headers = [
        {label: 'Nr. Crt.', key: 'index'},
        {label: 'Nume profesor', key: 'studName'},
        {label: 'Funcție', key: 'projectName'}
    ];

    const handleDownload = () => {
        const title = `Comisia ${committee.committeeId}`;
        const wsData = [[title], // Title row
            headers.map(header => header.label), // Header row
            [1, committee.president, "Președinte"],
            [2, committee.secretary, "Secretar"],
            ...committee.members.map((item, index) =>
                [index + 3, item, "Membru",])];

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

        ws['!cols'] = headers.map(() => ({wpx: 150}));
        ws['A1'].s = titleStyle;
        ws['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: headers.length - 1}}];

        headers.forEach((header, index) => {
            const cellAddress = XLSX.utils.encode_cell({c: index, r: 1});
            if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: header.label};
            ws[cellAddress].s = headerStyle;
        });

        const presidentRow = [1, committee.president, "Președinte",];

        presidentRow.forEach((cellValue, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: 2});
            if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: cellValue};
            ws[cellAddress].s = dataStyle;
        });

        const secretaryRow = [2, committee.secretary, "Secretar",];

        secretaryRow.forEach((cellValue, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: 3});
            if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: cellValue};
            ws[cellAddress].s = dataStyle;
        });

        committee.members.forEach((item, rowIndex) => {
            const row = [rowIndex + 3, item, "Membru",];

            row.forEach((cellValue, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: rowIndex + 4});
                if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: cellValue};
                ws[cellAddress].s = dataStyle;
            });
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Comisia ${committee.committeeId}`);
        XLSX.writeFile(wb, `Comisia_${committee.committeeId}.xlsx`);
    };

    return (<div>
        {loading === false && (<div className="creare-comisie-wrapper">
            <div className="creare-comisie-container">
                {!afiseazaComisia && (<h2>Creare comisie</h2>)}
                {afiseazaComisia && (<h2>Comisia numărul {committee.committeeId}</h2>)}
                {committeesCount > 0 && Array.from(Array(committeesCount).keys()).map((_, index) => (
                    <button key={index} className="creare-comisie-button"
                            onClick={() => afiseazaComisiaSalvata(index)}>
                        Comisia numărul {index + 1}
                    </button>))}
                {afiseazaComisia && (<button className="creare-comisie-button" onClick={handleDownload}>
                    <FontAwesomeIcon icon={faDownload}/> Descarcă Tabelul
                </button>)}
                {!afiseazaComisia && (<table>
                    <thead>
                    <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                        <th>Nr. crt</th>
                        <th>Nume profesor</th>
                        <th>Funcție</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr key={1}>
                        <td>{1}</td>
                        <td>
                            <input
                                className="textarea-field"
                                type="text"
                                value={committee.president}
                                onChange={(e) => handleChange(e, 1)}
                            />
                        </td>
                        <td>{"Presedinte"}</td>
                        <td></td>
                    </tr>
                    <tr key={2}>
                        <td>{2}</td>
                        <td>
                            <input
                                className="textarea-field"
                                type="text"
                                value={committee.secretary}
                                onChange={(e) => handleChange(e, 2)}
                            />
                        </td>
                        <td>{"Secretar"}</td>
                        <td></td>
                    </tr>
                    {committee.members.map((value, index) => (<tr key={3 + index}>
                        <td>{3 + index}</td>
                        <td>
                            <input
                                className="textarea-field"
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(e, 3 + index)}
                            />
                        </td>
                        <td>{"Membru"}</td>
                        <td>
                            <div className="action">
                                {index > 0 && <button
                                    onClick={() => stergeRand(index)}>Șterge</button>}
                            </div>
                        </td>
                    </tr>))}
                    </tbody>
                </table>)}
                {afiseazaComisia && (loading === false && <table>
                    <thead>
                    <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                        <th>Nr. crt</th>
                        <th>Nume profesor</th>
                        <th>Funcție</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr key={1}>
                        <td>{1}</td>
                        <td>{editMode && editingIndex === 1 ? <>
                            <input className="textarea-field" type="text" name="schoolGrade"
                                   placeholder={'Email profesor'} onChange={handleInputChange}/>
                            <button className="creare-comisie-button" onClick={() => setEditMode(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </> : committee.president}
                        </td>
                        <td>{"Presedinte"}</td>
                        <td>
                            <div className="action">
                                <button
                                    onClick={() => toggleEditMode(1)}>{editingIndex === 1 && editMode ? "Salvează" : "Editează"}</button>
                            </div>
                        </td>
                    </tr>
                    <tr key={2}>
                        <td>{2}</td>
                        <td>{editMode && editingIndex === 2 ? <>
                            <input className="textarea-field" type="text" name="schoolGrade"
                                   placeholder={'Email profesor'}
                                   onChange={handleInputChange}/>
                            <button className="creare-comisie-button" onClick={() => setEditMode(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </> : committee.secretary}</td>
                        <td>{"Secretar"}</td>
                        <td>
                            <div className="action">
                                <button
                                    onClick={() => toggleEditMode(2)}>{editingIndex === 2 && editMode ? "Salvează" : "Editează"}</button>
                            </div>
                        </td>
                    </tr>
                    {committee.members.map((value, index) => (<tr key={3 + index}>
                        <td>{3 + index}</td>
                        <td>{editMode && editingIndex === 3 + index ? <>
                            <input className="textarea-field" type="text" name="schoolGrade"
                                   placeholder={'Email profesor'} onChange={handleInputChange}/>
                            <button className="creare-comisie-button" onClick={() => setEditMode(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </> : value}</td>
                        <td>{"Membru"}</td>
                        <td>
                            <div className="action">
                                <button
                                    onClick={() => toggleEditMode(3 + index)}>{editingIndex === (3 + index) && editMode ? "Salvează" : "Editează"}</button>
                                {index > 0 && <button
                                    onClick={() => handleDeleteMember(3 + index)}>Șterge</button>}
                            </div>
                        </td>
                    </tr>))}
                    </tbody>
                </table>)}
                {!afiseazaComisia && (<>
                    <button className="creare-comisie-button" onClick={salveazaComisia}>
                        Salvează comisia
                    </button>
                    <button className="creare-comisie-button" onClick={adaugaRand}>
                        +
                    </button>
                </>)}
                {afiseazaComisia && (<button className="creare-comisie-button" onClick={intoarceLaCreare}>
                    Creează comisie
                </button>)}
            </div>
        </div>)}
    </div>);
};

export default CommitteeCreator;
