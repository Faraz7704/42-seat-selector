import React, { useEffect } from 'react';
import {useLocation} from 'react-router-dom';

export default function Home() {

    const state = useLocation().state;

    useEffect(() => {
        fetch("/about", {
            method: 'GET',
            headers: state.headers
        }).then(response => {
            response.json().then(data => {
                console.log(data);
            })
        });
    }, []);

    return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Home</h2>
        </main>
    );
}