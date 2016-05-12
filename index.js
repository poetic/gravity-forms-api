import CryptoJS from 'crypto-js';

class GravityFormsApi {
  constructor(apiCreds) {
    const isValid = options => options.apiKey && options.domain && options.privateKey;

    if (isValid(apiCreds)) {
      this._setup(apiCreds);
    } else {
      this._throwError('Invalid api credentials');
    }
  }

  static setup(options) {
    const { apiKey, domain, privateKey } = options;

    this.apiKey = apiKey;
    this.privateKey = privateKey;
    this.baseEndPoint = `${domain}/gravityformsapi`;
  }

  static convertToFutureUnixTime(expirationInSeconds) {
    const currentDate = new Date();
    const unixTimeInSeconds = parseInt(currentDate.getTime() / 1000, 10);

    return unixTimeInSeconds + expirationInSeconds;
  }

  static throwError(desc) {
    throw new Error(desc);
  }

  createSignature(method, route, expirationInSeconds = 600) {
    if (!method || !route) {
      this._throwError('GravityFormsApi.createSignature is Missing required arguments');
    }

    const futureUnixTime = this.convertToFutureUnixTime(expirationInSeconds);

    const stringToSign = `${this.apiKey}:${method}:${route}:${futureUnixTime}`;

    const hash = CryptoJS.HmacSHA1(stringToSign, this.privateKey);
    const base64 = hash.toString(CryptoJS.enc.Base64);

    return encodeURIComponent(base64);
  }

  request(domain, route, signature, expirationInSeconds = 600, maxResults = 10, cb) {
    if (!domain || !route || !signature) {
      this._throwError('GravityFormsApi.request is Missing required arguments');
    }

    const futureUnixTime = this.convertToFutureUnixTime(expirationInSeconds);
    const url = (
      `${this.baseEndPoint}/${route}?api_key=${this.apiKey}&signature=${signature}` +
      `&expires=${futureUnixTime}&paging[page_size]=${maxResults}`
    );

    return HTTP.get(url, {}, cb);
  }
}

exports.GravityFormsApi = GravityFormsApi;
