import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import TableData from './tableData';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {

    const state = useLocation().state;
    let headers = {};

    const events = [
        { label: "Math Final Exam", value: 11167 },
        { label: "Startup journey", value: 11396 },
        { label: "New Joiners", value: 11060 }
    ];
    const urls = [
        { label: "One Time Generate", value: 1},
        { label: "Generate", value: 2},
        { label: "Get Seats", value: 3},
        { label: "Send Emails", value: 4}
    ];

    const [eventSelected, setEventSelected] = useState(events[0].value);
    const [urlSelected, setUrlSelected] = useState(urls[0].value);
    const [data, getData] = useState([])

    const handleEventChange = event => {
        setEventSelected(event);
    };

    const handleUrlChange = url => {
        setUrlSelected(url);
    };

    function buttonClicked() {
        headers = state.headers;
        console.log(headers);
        if (eventSelected.value == undefined)
            return;
        if (urlSelected.value === 1) {
            headers['Content-Type'] = 'application/json'
            fetch(`/exams_seats/${eventSelected.value}/otg`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    labs: [ "lab1", "lab2" ]
                })
            }).then(response => {
                response.json().then(data => {
                    console.log(data);
                    getData(data);
                })
            })
        } else if (urlSelected.value === 2) {
            headers['Content-Type'] = 'application/json'
            fetch(`/exams_seats/${eventSelected.value}/generate`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    labs: [ "lab1", "lab2" ]
                })
            }).then(response => {
                console.log(response);
                getData(response);
            });
        } else if (urlSelected.value === 3) {
            fetch(`/exams_seats/${eventSelected.value}`, {
                method: 'GET',
                headers: headers,
            }).then(response => {
                response.json().then(data => {
                    console.log(data);
                    getData(data);
                })
            })
        } else if (urlSelected.value === 4) {
            fetch(`/exams_seats/${eventSelected.value}/send_emails`, {
                method: 'POST',
                headers: headers
            }).then(response => {
                console.log(response);
                getData(response);
            })
        }
    }

    // useEffect(() => {
    //     fetch("/about", {
    //         method: 'GET',
    //         headers: headers
    //     }).then(response => {
    //         response.json().then(data => {
    //             console.log(data);
    //         })
    //     });
    // }, []);

    return (
        <div>
            <header>
                <div className="p-5 text-center bg-light">
                    <h1 className="mb-3">Demo</h1>
                    <div className="container text-center">
                        <div className="row">
                        <div className="col-md-4"></div>
                        <div className="col-md-4">
                            <Select options={ events } defaultValue={events[0].value} value={eventSelected} onChange={handleEventChange} />
                        </div>
                        <div style={{ padding: "2rem" }} className="col-md-4"></div>
                        </div>
                        <div className="row">
                        <div className="col-md-4"></div>
                        <div className="col-md-4">
                            <Select options={ urls } defaultValue={urls[0].value} value={urlSelected} onChange={handleUrlChange} />
                        </div>
                        <div style={{ padding: "2rem" }} className="col-md-4"></div>
                        </div>
                    </div>
                    <a className="btn btn-primary" href="#" onClick={buttonClicked} role="button">Generate Seats</a>
                </div>
            </header>
            <TableData data={data}/>
        </div>
    );
}