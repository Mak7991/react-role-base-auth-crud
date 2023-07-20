import Axios from 'axios';

const getUploadUrl = filename => {
	return Axios.get(`api/v1/s3/get/url?key=${filename}`);
};

const uploadFile = (file, name) => {
	return new Promise((resolve, reject) => {
		let url = '';
		let key = '';
		getUploadUrl(name)
			.then(res => {
				url = res.data.presignedUrl;
				key = res.data.key;

				const config = {
					method: 'put',
					url,
					headers: {
						'Content-Type': file.type
					},
					data: file
				};
				const newAxios = Axios.create({});
				delete newAxios.defaults.headers.common.Authorization;
				newAxios(config)
					.then(() => {
						// append key with s3 bucket url
						resolve(key);
					})
					.catch(error => {
						reject(error);
					});
			})
			.catch(err => {
				reject(err);
			});
	});
};

export { uploadFile };
