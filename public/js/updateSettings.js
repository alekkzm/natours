import axios from 'axios'
import { showAlert } from './alerts'

export const updateSettings = async (data, type) => {
    try {
        if (!type) throw new Error();
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/update${type === 'password' ? 'MyPassword' : 'Me'}`,
            data
        })
        if (res.data.status === 'success')
            showAlert('success', `${type[0].toUpperCase() + type.slice(1)} successfully updated!`);
        // else throw new Error();
    } catch (err) {
        console.log(err)
        showAlert('error', (err.response && err.response.data && err.response.data.message) || 'Cannot update user settings! Try again later.');
    }
}