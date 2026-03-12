import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';
import { authGoogle } from '../api';

export default function LoginButton() {
    const { login } = useAuth();
    const [error, setError] = useState(null);

    const handleSuccess = async (credentialResponse) => {
        try {
            const data = await authGoogle(credentialResponse.credential);
            // The backend returns an access_token and a user object
            login(data.access_token, data.user);
        } catch (err) {
            console.error('Failed to authenticate with backend', err);
            setError('Det oppstod en feil ved innlogging.');
        }
    };

    const handleError = () => {
        console.error('Google verification failed completely');
        setError('Google innlogging feilet.');
    };

    return (
        <div>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_black"
                shape="pill"
            />
            {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</p>}
        </div>
    );
}
