import React, {useEffect, useState} from 'react';
import XLSX from 'xlsx-js-style';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDownload} from '@fortawesome/free-solid-svg-icons';

import "./StudentsStats.css";
import serverUrl from "../../server";

const StudentsStats = () => {
    const [stats, setStats] = useState([]);
    const [searchTermCoordonator, setSearchTermCoordonator] = useState('');
    const [searchTermComisie, setSearchTermComisie] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(serverUrl + `/exam/stats`)
            .then(response => response.json())
            .then(data => {
                setLoading(false);
                setStats(data.studentStats);
            });
    }, []);

    const headers = [{label: 'Nr. Crt.', key: 'index'}, {label: 'Nume', key: 'studName'}, {
        label: 'Nume Lucrare', key: 'projectName'
    }, {label: 'Nume coordonator', key: 'coordName'}, {label: 'Comisie', key: 'committeeId'}, {
        label: 'Notă 4 ani', key: 'schoolGrade'
    }, {label: 'Notă coordonator', key: 'coordGrade'}, {
        label: 'Notă cunoștințe', key: 'knowledgeMean'
    }, {label: 'Notă proiect', key: 'projectMean'}, {label: 'Notă licență', key: 'examGrade'}];

    const filteredData = stats.filter(
        item => item.coordName.toLowerCase().includes(searchTermCoordonator.toLowerCase()) &&
            item.committeeId.toString().includes(searchTermComisie.toLowerCase())
    );

    const [pagina, setPagina] = useState(1);
    const randuriPerPage = 15;

    const numarTotalPagini = Math.ceil(stats.length / randuriPerPage);

    const startIndex = (pagina - 1) * randuriPerPage;
    const endIndex = Math.min(startIndex + randuriPerPage, stats.length);

    const paginaUrmatoare = () => {
        setPagina(Math.min(pagina + 1, numarTotalPagini));
    };

    const paginaAnterioara = () => {
        setPagina(Math.max(pagina - 1, 1));
    };

    const handleDownload = () => {
        const year = new Date();
        const title = `Statistică note candidați ${year.getFullYear() - 1} - ${year.getFullYear()}`;
        const wsData = [[title], // Title row
            headers.map(header => header.label), // Header row
            ...filteredData.map((item, index) => [
                startIndex + index + 1,
                item.studName, item.projectName,
                item.coordName, item.committeeId,
                item.schoolGrade,
                item.coordGrade,
                item.knowledgeMean,
                item.projectMean,
                item.examGrade
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = headers.map(() => ({wpx: 100}));

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

        ws['A1'].s = titleStyle;
        ws['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: headers.length - 1}}];

        headers.forEach((header, index) => {
            const cellAddress = XLSX.utils.encode_cell({c: index, r: 1});
            if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: header.label};
            ws[cellAddress].s = headerStyle;
        });

        filteredData.forEach((item, rowIndex) => {
            const row = [
                startIndex + rowIndex + 1,
                item.studName, item.projectName,
                item.coordName, item.committeeId,
                item.schoolGrade, item.coordGrade,
                item.knowledgeMean,
                item.projectMean,
                item.examGrade
            ];

            row.forEach((cellValue, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: rowIndex + 2});
                if (!ws[cellAddress]) ws[cellAddress] = {t: 's', v: cellValue};
                ws[cellAddress].s = dataStyle;
            });
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Statistică note candidați ${year.getFullYear()}`);
        XLSX.writeFile(wb, `Statistică_note_candidați ${year.getFullYear() - 1}-${year.getFullYear()}.xlsx`);
    };

    const handleView = async (student) => {
        try {
            const response = await fetch(serverUrl + `/file/${student.studentId}/pv`, {
                method: 'GET', headers: {
                    'Accept': 'application/pdf'
                }
            });
            if (!response.ok) {
                throw new Error('Eroare de rețea');
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url);

        } catch (error) {
            console.error('Cererea a eșuat:', error);
        }
    }

    return (<div>
        {loading === false && (<>
            <div className="generate-container">
                <h2 className="titlu-tabel">Statistică note studenți</h2>
            </div>
            <div className="tabel-container">
                <div className="search-bar">
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
                        {headers.map((header, index) => (<th key={index}>{header.label}</th>))}
                    </tr>
                    </thead>
                    <tbody>
                        {filteredData.slice(startIndex, endIndex).map((stat, index) => (<tr key={index}>
                            <td>{startIndex + index + 1}</td>
                            <td className="link" title="Vezi proces verbal" onClick={() => handleView(stat)}>{stat.studName}</td>
                            <td>{stat.projectName}</td>
                            <td>{stat.coordName}</td>
                            <td>{stat.committeeId}</td>
                            <td>{stat.schoolGrade}</td>
                            <td>{stat.coordGrade}</td>
                            <td>{stat.knowledgeMean}</td>
                            <td>{stat.projectMean}</td>
                            <td>{stat.examGrade}</td>
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
            </div>
        </>)}
    </div>);
};

export default StudentsStats;
