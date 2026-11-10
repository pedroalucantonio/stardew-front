import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL
let csrfCookieRequest

const client = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

function initializeCsrfCookie() {
  if (!baseURL) {
    return Promise.reject(new Error('VITE_API_BASE_URL is not configured'))
  }

  if (!csrfCookieRequest) {
    csrfCookieRequest = client.get('/sanctum/csrf-cookie').catch((error) => {
      csrfCookieRequest = undefined
      throw error
    })
  }

  return csrfCookieRequest
}

export async function api(path, options = {}) {
  await initializeCsrfCookie()

  const { body, ...requestOptions } = options

  try {
    const response = await client.request({
      ...requestOptions,
      url: path,
      data: body,
    })

    return response.data
  } catch (error) {
    if (error.response) {
      error.status = error.response.status
      error.data = error.response.data
    }

    throw error
  }
}

export function resourceData(response) {
  return response?.data ?? response
}
