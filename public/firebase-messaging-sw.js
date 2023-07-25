

importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');
self.addEventListener('fetch', () => {
	const urlParams = new URLSearchParams(location.search);
	self.firebaseConfig = Object.fromEntries(urlParams);
});


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const defaultConfig = {
	apiKey: true,
	authDomain: true,
	projectId: true,
	storageBucket: true,
	messagingSenderId: true,
	appId: true,
	measurementId: true
};

firebase.initializeApp(self.firebaseConfig || defaultConfig);

// Retrieve firebase messaging
firebase.messaging();

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('../firebase-messaging-sw.js')
		.then(function(registration) {
			// registration.active.postMessage("your message");
			console.log('Registration successful, scope is:', registration.scope);
		})
		.catch(function(err) {
			console.log('Service worker registration failed, error:', err);
		});
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
	console.log('ABC ', payload);
	self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function(clients) {
		//you can see your main window client in this list.
		clients.forEach(function(client) {
			console.log(client);
			client.postMessage(payload);
		});
	});
	// Customize notification here
	if (payload.notification) {
		const notificationTitle = payload.notification.title;
		const notificationOptions = {
			body: payload.notification.body,
			icon: payload.notification.title
		};
		self.registration.showNotification(notificationTitle, notificationOptions);
	}
});
