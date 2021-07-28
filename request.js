const request = require("request");
/**
 *  const options = {
      url: "https://api.github.com/user/followers",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${token}`,
        "User-Agent": "request",
      },
    };
 * @param {*} options 
 * @returns 
 */
const doRequest = (options) => {
  return new Promise((resolve, reject) => {
    request({ json: true, ...options }, (error, response, body) => {
      if (response && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
};

module.exports = doRequest;
