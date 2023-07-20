import axios from 'axios';

const gettopbar = data => {
    return axios.get(`/api/v1/school/tickers/notifications`);
};

export { gettopbar};
