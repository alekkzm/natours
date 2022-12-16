import axios from 'axios';

export const bookTour = async tourId => {
    try {
        const stripe = Stripe('pk_test_51MEdCuER9F8ESyY4PGMvxgMGiXwfn0Pj6ztruxRqUQEPsy1xVvSrbNTtKssg1LX0FiibEVO43He8Asq0Ky8HbnZ100o3B64MHl');
        const res = await axios({
            method: 'GET',
            url: `http://192.168.79.128:3000/api/v1/bookings/checkout-session/${tourId}`
        })
        console.log(await stripe.redirectToCheckout({ sessionId: res.data.session.id }));
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
}