import React, {useEffect, useState} from 'react';
import './UploadCreator.css';
import serverUrl from "../../server";

function UploadCreator() {
    const [message, setMessage] = useState('');
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('');
    const [selectedForm, setSelectedForm] = useState('documentatie');
    console.log("s: " + startDate)

    useEffect(() => {
        let requestURL = `/announcements/projectUploadConfig`;
        if (selectedForm === 'prezentare') requestURL = `/announcements/presentationUploadConfig`;
        fetch(serverUrl + requestURL)
            .then(response => response.json())
            .then(data => {
                if(data.startDate !== 0 && data.endDate !== 0) {
                    setMessage(data.message)
                    setStartDate(new Date(data.startDate * 1000).toISOString().substring(0, 16))
                    setEndDate(new Date(data.endDate * 1000).toISOString().substring(0, 16))
                }
            });
    }, [selectedForm]);

    const handleSubmission = async () => {
        if (message && startDate && endDate) {
            if(startDate < endDate) {
                const confirmare = window.confirm(`Ești sigur că vrei să salvezi setările?`);
                console.log(startDate)
                if(confirmare) {
                    let requestURL = `/announcements/projectUploadConfig`;
                    if (selectedForm === 'prezentare')
                        requestURL = `/announcements/presentationUploadConfig`;
                    try {
                        await fetch(serverUrl + requestURL, {
                            method: 'POST', headers: {
                                'Content-Type': 'application/json',
                            }, body: JSON.stringify({
                                message,
                                startDate: (new Date(startDate).getTime() / 1000),
                                endDate: (new Date(endDate).getTime() / 1000)}),
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }
            } else {
                alert("Date invalide!")
            }
        } else {
            alert('Te rog completează toate câmpurile.');
        }
    };

    const switchUpload = (type) => {
        setMessage('');
        setStartDate('');
        setEndDate('');
        setSelectedForm(type)
    }

    return (
        <div>
            <div className="uploadSettings-container">
                <h2 className="title-page">Setări încărcare</h2>
            </div>
            <div className="button-container">
                <button
                    className={`form-toggle-button ${selectedForm === 'documentatie' ? 'active' : ''}`}
                    onClick={() => switchUpload('documentatie')}
                >
                    Încarcare Documentație
                </button>
                <button
                    className={`form-toggle-button ${selectedForm === 'prezentare' ? 'active' : ''}`}
                    onClick={() => switchUpload('prezentare')}
                >
                    Încarcare Prezentare
                </button>
            </div>
            <div className="secretary-page-container">
                <div className="secretary-form">
                    <label htmlFor="message-input" className="input-label">Mesaj:</label>
                    <textarea
                        id="message-input"
                        className="textarea-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <label htmlFor="start-date-input" className="input-label">Termen pornire:</label>
                    <input
                        type="datetime-local"
                        id="start-date-input"
                        className="date-time-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <label htmlFor="end-date-input" className="input-label">Termen oprire:</label>
                    <input
                        type="datetime-local"
                        id="end-date-input"
                        className="date-time-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <button className="submit-button" onClick={handleSubmission}>Salveaza</button>
                </div>
            </div>
        </div>
    );
}

export default UploadCreator;
