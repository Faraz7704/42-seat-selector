import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';

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
        <header>
            <div className="p-5 text-center bg-light">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
           </div>
        </header>
    );
} 