import React, {useContext, useEffect, useState} from 'react';
import {RoleContext} from "../../RoleContext";
import XLSX from "xlsx-js-style";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDownload, faSyncAlt} from '@fortawesome/free-solid-svg-icons';

import "./PresidentTable.css";
import serverUrl from "../../server";

const NoteStudenti = () => {

    const [otherGrades, setOtherGrades] = useState([]);
    const [professorsName, setProfessorsName] = useState([]);
    const [session] = useContext(RoleContext);
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)
    const [status, setStatus] = useState('fa-circle-question');
    const [committeeId, setCommitteeId] = useState(0);

    useEffect(() => {
        fetch(serverUrl + `/exam/${session.id}/otherGrades`)
            .then(response => response.json())
            .then(data => {
                setCommitteeId(data.committeeId)
                setOtherGrades(data.students)
                setProfessorsName(data.professors)
                setLoading(false)
                setRefresh(false)
                console.log(data);
                setStatus(data.status === '1' ? 'fa-circle-check' : data.status === '2' ? 'fa-triangle-exclamation' : 'fa-circle-question')
            });
    }, [refresh]);

    const headers = [{label: 'Nr. Crt.', key: 'id'}, {
        label: 'Nume', key: 'studName'
    }, ...professorsName.flatMap((name, index) => [{label: `${name}`, key: `knowledgeGrade${index}`}, {
        label: `${name}`, key: `projectGrade${index}`
    }]), {label: 'Medie cunoștințe', key: 'knowledgeMean'}, {
        label: 'Medie proiect', key: 'projectMean'
    }, {label: 'Medie finală', key: 'mean'}];

    const processedData = otherGrades.map((student, index) => {
        const grades = {};
        student.grades.forEach((grade, idx) => {
            grades[`knowledgeGrade${idx}`] = grade.knowledgeGrade || '';
            grades[`projectGrade${idx}`] = grade.projectGrade || '';
        });
        return {
            id: index + 1,
            studName: student.studName, ...grades,
            knowledgeMean: student.knowledgeMean,
            projectMean: student.projectMean,
            mean: student.mean
        };
    });

    const handleDownload = () => {
        const title = `Note candidați comisia ${committeeId}`;
        const wsData = [[title], // Title row
            headers.map(header => header.label), // First header row
            [ // Second header row
                '', '', ...professorsName.flatMap(() => ['Notă cunoștințe', 'Notă proiect']), '', '', ''], ...processedData.map((student) => {
                return [
                    student.id,
                    student.studName,
                    ...professorsName.flatMap((_, idx) => [
                        student[`knowledgeGrade${idx}`] || '',
                        student[`projectGrade${idx}`] || ''
                    ]),
                    student.knowledgeMean,
                    student.projectMean,
                    student.mean];
            })];

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
        ws['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: headers.length - 1}},
            ...professorsName.map((_, idx) => ({
                s: {r: 1, c: 2 + idx * 2}, e: {r: 1, c: 3 + idx * 2}
            }))
        ];
        ws[XLSX.utils.encode_cell({c: 0, r: 2})].s = headerStyle;
        ws[XLSX.utils.encode_cell({c: 1, r: 2})].s = headerStyle;
        ws[XLSX.utils.encode_cell({c: 10, r: 2})].s = headerStyle;
        ws[XLSX.utils.encode_cell({c: 11, r: 2})].s = headerStyle;
        ws[XLSX.utils.encode_cell({c: 12, r: 2})].s = headerStyle;

        headers.forEach((header, index) => {
            const cellAddress1 = XLSX.utils.encode_cell({c: index, r: 1});
            if (!ws[cellAddress1]) ws[cellAddress1] = {t: 's', v: header.label};
            ws[cellAddress1].s = headerStyle;
        });

        const subheaderIndexOffset = 2;
        professorsName.forEach((_, index) => {
            const cellAddress2a = XLSX.utils.encode_cell({c: subheaderIndexOffset + index * 2, r: 2});
            const cellAddress2b = XLSX.utils.encode_cell({c: subheaderIndexOffset + index * 2 + 1, r: 2});
            ws[cellAddress2a] = {t: 's', v: 'Notă cunoștințe', s: headerStyle};
            ws[cellAddress2b] = {t: 's', v: 'Notă proiect', s: headerStyle};
        });

        processedData.forEach((student, rowIndex) => {
            const row = [student.id, student.studName, ...professorsName.flatMap((_, idx) => [
                student[`knowledgeGrade${idx}`] || '',
                student[`projectGrade${idx}`] || '']),
                student.knowledgeMean, student.projectMean, student.mean];

            row.forEach((cellValue, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: rowIndex + 3});
                if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: cellValue};
                ws[cellAddress].s = dataStyle;
            });
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Note candidați comisia ${committeeId}`);
        XLSX.writeFile(wb, `Note candidați comisia ${committeeId}.xlsx`);
    };

    const [pagina, setPagina] = useState(1);
    const randuriPerPage = 15;

    const numarTotalPagini = Math.ceil(otherGrades.length / randuriPerPage);

    const startIndex = (pagina - 1) * randuriPerPage;
    const endIndex = Math.min(startIndex + randuriPerPage, otherGrades.length);

    const paginaUrmatoare = () => {
        setPagina(Math.min(pagina + 1, numarTotalPagini));
    };

    const paginaAnterioara = () => {
        setPagina(Math.max(pagina - 1, 1));
    };

    const handleRefresh = () => {
        setRefresh(true);
    }

    return (<div>{loading === false && (<div className="tabel-container">
        <h2 className="titlu-tabel">Note candidați comisia {committeeId}</h2>
        <div className="button-download-update-container">
            <button className="button-download-update" onClick={handleDownload}>
                <FontAwesomeIcon icon={faDownload}/> Descarcă Tabelul
            </button>
            <button className="button-download-update" onClick={handleRefresh}>
                <FontAwesomeIcon icon={faSyncAlt}/> Actualizează
            </button>
        </div>

        <table>
            <thead>
            <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                <th>Nr. Crt.</th>
                <th>Nume candidat</th>
                {professorsName.map((name, index) => (<th colSpan={2}>{name}</th>))}
                <th>Medie cunoștințe</th>
                <th>Medie proiect</th>
                <th>Medie finală</th>
                <th>Status</th>
            </tr>
            <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                <th></th>
                <th></th>
                {professorsName.map((name, index) => (<>
                    <th>Notă cunoștințe</th>
                    <th>Notă proiect</th>
                </>))}
                <th></th>
                <th></th>
                <th></th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {otherGrades.slice(startIndex, endIndex).map((student, index) => (<tr key={student.id}>
                <td>{startIndex + index + 1}</td>
                <td>{student.studName}</td>
                {student.grades.map((grade, index) => (<>
                    <td>{grade.knowledgeGrade === 0 ? "" : grade.knowledgeGrade}</td>
                    <td>{grade.projectGrade === 0 ? "" : grade.projectGrade}</td>
                </>))}
                <td>{student.knowledgeMean}</td>
                <td>{student.projectMean}</td>
                <td>{student.mean}</td>
                <td><i
                    className={`fa-solid ${student.status === '1' ? 'fa-circle-check' : student.status === '2' ? 'fa-triangle-exclamation' : 'fa-circle-question'}`}
                    style={{color: (student.status === '3' ? 'orange' : student.status === '1' ? 'green' : 'red')}}
                    title={student.status === 'fa-circle-question' ? 'Nota este în curs de evaluare.' : student.status === 'fa-circle-check' ? 'Nota a fost confirmată.' : 'Nota necesită atenție suplimentară.'}>
                </i></td>
            </tr>))}
            </tbody>
        </table>

        <div className="navigare">
            <button onClick={paginaAnterioara} disabled={pagina === 1}>
                Pagina Anterioară
            </button>
            <span>
                Pagina {pagina} din {numarTotalPagini === 0 ? 1 : numarTotalPagini}
            </span>
            <button onClick={paginaUrmatoare}
                    disabled={numarTotalPagini === 0 || pagina === numarTotalPagini}>
                Pagina Următoare
            </button>
        </div>
    </div>)}
    </div>);
};

export default NoteStudenti;
