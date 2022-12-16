import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

const loginForm = document.querySelector('.form--login');
if (loginForm) {
    loginForm.addEventListener('submit', ev => {
        ev.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

const logOutBtn = document.querySelector('a.nav__el.nav__el--logout');
if (logOutBtn) {
    logOutBtn.addEventListener('click', ev => {
        ev.preventDefault();
        logout();
    });
}

const userDataForm = document.querySelector('.form-user-data');
if (userDataForm) {
    userDataForm.addEventListener('submit', ev => {
        ev.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const photo = document.getElementById('photo').files[0];
        const fd = new FormData();
        fd.append('name', name);
        fd.append('email', email);
        fd.append('photo', photo);
        // for (var kv of fd.entries()) {
        //     console.log(kv[0] + ', ' + kv[1]);
        // }
        updateSettings(fd, 'data');
    });
}

const userPasswordForm = document.querySelector('.form-user-settings');
if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async ev => {
        ev.preventDefault();
        const btn = document.querySelector('.btn--save-password');
        btn.textContent = 'Updating...';
        const currentPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const newPasswordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ currentPassword, newPassword, newPasswordConfirm }, 'password');
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
        btn.textContent = 'Save password';
    });
}

const bookBtn = document.getElementById('book-tour')
if (bookBtn) {
    bookBtn.addEventListener('click', ev => {
        bookBtn.textContent = 'Processing...';
        const { tourId } = bookBtn.dataset;
        bookTour(tourId);
    })
}
