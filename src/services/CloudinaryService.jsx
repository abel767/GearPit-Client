import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

const uploadImageToCloudinary = async (files) => {
    try {
        const { data } = await axios.get(`${axiosInstance}/admin/generate-upload-url`);
        const { signature, timestamp, uploadPreset, apiKey, cloudName } = data;

        const imageUrls = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('api_key', apiKey);

            const response = await axios.post(`http://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
            console.log('Image uploaded successfully', response.data.secure_url);
            imageUrls.push(response.data.secure_url);
        }

        return imageUrls;  // Returning the URLs for storage in MongoDB
    } catch (uploadError) {
        console.log('Error uploading individual image:', uploadError.response ? uploadError.response.data : uploadError.message);
    }
};

export default uploadImageToCloudinary;
