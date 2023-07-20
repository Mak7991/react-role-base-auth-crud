import axios from 'axios';


const postmessaging = data => {
    return axios.post('api/v1/conversations', data) ;
};

export { postmessaging};