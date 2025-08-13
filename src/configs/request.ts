import type { AxiosInstance } from 'axios'
import axios from 'axios'

import { cleareStorage, getTokenCSR } from './storage'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const isCSR = typeof window !== 'undefined'

// @ts-ignore
function createAxios() {
  const token = isCSR ? getTokenCSR() : undefined

  const $request = axios.create({
    baseURL: API_URL,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    }
  })

  $request.interceptors.request.use(
    config => {
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  $request.interceptors.response.use(
    response => {
      return response
    },
    error => {
      let message

      switch (error.response?.status) {
        case 500:
          message = 'Внутренняя ошибка сервера!'
          break
        case 401:
          message = error.response?.data?.message

          if (typeof window !== 'undefined') {
            cleareStorage()
            window.location.href = `/`
          }

          break
        case 400:
          message = error.response?.data?.message
          break
        default:
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          message = error.response?.data?.message
      }

      throw error
    }
  )

  return $request
}

function request(): AxiosInstance {
  return createAxios()
}

export { request }
