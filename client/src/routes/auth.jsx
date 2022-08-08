import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Auth() {

    const navigate = useNavigate();
    const search = useLocation().search;
    const code = new URLSearchParams(search).get('code');

    useEffect(() => {
        fetch("/oauth/token", {
            method: 'POST',
            body: new URLSearchParams({
                code: code
            })
        }).then(response => {
            response.json().then(data => {
                if (data.status === 200)
                    navigate("/home", {
                        state: {
                            headers: {
                                authorization: `Bearer ${data.token.access_token}`
                            }
                        }
                    });
                else
                    navigate("/");
            })
        });
    }, []);

    return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Sign in...</h2>
        </main>
    );
} 