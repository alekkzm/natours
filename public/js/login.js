import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://192.168.79.128:3000/api/v1/users/login',
            data: { email, password }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message || 'Login error');
    }
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://192.168.79.128:3000/api/v1/users/logout',
        });
        if (res.data.status === 'success') {
            if (['/me', '/my-tours'].includes(window.location.pathname)) window.location.replace('/');
            else window.location.reload(true);
        }
    } catch (err) {
        showAlert('error', 'Error logging out! Try again.')
    }
}
