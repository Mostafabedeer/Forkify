import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, newRecipe = undefined) {
  try {
    const fetchPro = newRecipe
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRecipe),
        })
      : fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    if (!res.ok) throw new Error(`${data.message}, ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
};
/*
export const getJson = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    if (!res.ok) throw new Error(`${data.message}, ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
};

export const sendJson = async function (url, newRecipe) {
  try {
    const res = await Promise.race([
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecipe),
      }),
      timeout(TIMEOUT_SEC),
    ]);
    // if (!res.ok) throw new Error(`${data.message}, ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
};
*/
