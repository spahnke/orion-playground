define(function () {

	function ajaxRequest(method, url, options) {
		return new Promise(function (resolve, reject) {
			options = options || {};
			var xhr = new XMLHttpRequest();

			xhr.onload = function () {
				if (200 <= xhr.status && xhr.status < 400) {
					resolve(xhr.response);
				} else {
					reject(xhr.response);
				}
			};

			xhr.onerror = function () {
				reject(xhr.response);
			};

			xhr.open(method, url, true);
			if (options.timeout) {
				xhr.timeout = options.timeout;
				xhr.ontimeout = function () {
					reject('Timeout exceeded');
				};
			}
			xhr.send(options.data);
		});
	}

	/**
	 * @typedef {Object} RequestOptions
	 * @property {Number} timeout The timeout after which the request is resolved as failure.
	 * @property {Object} data Data to send in a POST/PUT request.
	 */

	/**
	 * @name get
	 * @description Sends a GET request via AJAX.
	 * @param {String} url The URL to the resource to get.
	 * @param {RequestOptions} options Additional options to customize the request.
	 * @returns {Promise} The requested resource as a promise.
	 */
	function get(url, options) {
		return ajaxRequest('GET', url, options);
	}

	return {
		get: get
	};
});