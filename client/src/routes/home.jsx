import React, { useEffect } from 'react';

export default function Home() {

    useEffect(() => {
        fetch("/about", {
            method: 'GET'
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