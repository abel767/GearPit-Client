import axios from 'axios';

const uploadImageToCloudinary = async (files) => {
    try {
        // Fetch the Cloudinary config from the backend
        const response = await axios.get('http://localhost:3000/admin/generate-upload-url', {
            withCredentials: true
        });
        
        console.log('Backend response:', response.data); // Debug log
        
        const { signature, timestamp, uploadPreset, apiKey, cloudName, uploadUrl } = response.data;

        // Validate required fields
        const requiredFields = { cloudName, signature, timestamp, uploadPreset, apiKey };
        Object.entries(requiredFields).forEach(([key, value]) => {
            if (!value) {
                console.error(`Missing ${key} from backend response`);
            }
        });

        if (!Object.values(requiredFields).every(Boolean)) {
            throw new Error('Missing required configuration from backend');
        }

        const imageUrls = [];
        
        // Upload images sequentially
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('api_key', apiKey);

            try {
                console.log('Uploading to Cloudinary with params:', {
                    uploadPreset,
                    timestamp,
                    signature: signature.substring(0, 10) + '...', // Log partial signature for security
                    apiKey: apiKey.substring(0, 10) + '...' // Log partial API key for security
                });

                const uploadResponse = await axios.post(
                    uploadUrl || `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (!uploadResponse.data?.secure_url) {
                    console.error('Invalid Cloudinary response:', uploadResponse.data);
                    throw new Error('Invalid response from Cloudinary');
                }

                console.log('Image uploaded successfully:', uploadResponse.data.secure_url);
                imageUrls.push(uploadResponse.data.secure_url);
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', {
                    message: uploadError.message,
                    response: uploadError.response?.data,
                    status: uploadError.response?.status
                });
                throw new Error(`Failed to upload image: ${uploadError.response?.data?.error?.message || uploadError.message}`);
            }
        }

        return imageUrls;
    } catch (error) {
        console.error('Image upload process failed:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

export default uploadImageToCloudinary;