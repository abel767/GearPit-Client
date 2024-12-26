import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
})

console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);


axiosInstance.interceptors.response.use(
    (response) => response,
    async (error)=>{
        const originalRequest = error.config
        console.log('Error from refresh request', error)

        if(error.response?.status === 403 && !originalRequest._retry){
            originalRequest._retry = true

            try{
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/user/refresh-token`,
                    {},
                    {withCredentials: true}
                )

                const newAccessToken = refreshResponse.date.accesToken
                console.log('newAccessToken', newAccessToken)

                axiosInstance.defaults.headers.common['Authorization'] =   `Bearer ${newAccessToken}`
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                
                return axiosInstance(originalRequest)

            }catch(refreshError){
                console.error('failed to refresh token', refreshError)
                return Promise.reject(refreshError)
            }
        }
    }
)


export default axiosInstance