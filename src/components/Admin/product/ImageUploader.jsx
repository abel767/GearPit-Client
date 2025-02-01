import { useState, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import Cropper from 'react-easy-crop';

const ImageUploader = ({ 
  images = [], 
  onImagesChange,
  showCrop = true 
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    const fileType = originalFile?.type || 'image/png';

    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        resolve({
          file: blob,
          url: URL.createObjectURL(blob)
        });
      }, fileType);
    });
  };

  const handleFileSelect = (e) => {
    e.preventDefault(); // Prevent form submission
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (showCrop) {
            setCurrentImage(reader.result);
            setOriginalFile(file);
            setModalOpen(true);
          } else {
            const newImages = [...images, { 
              preview: reader.result,
              file
            }];
            onImagesChange(newImages);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset the input value
    e.target.value = '';
  };

  const handleRemoveImage = (e, index) => {
    e.preventDefault(); // Prevent form submission
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = useCallback(async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      if (!croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(currentImage, croppedAreaPixels);
      
      const newImages = [...images, {
        preview: croppedImage.url,
        file: croppedImage.file
      }];
      
      onImagesChange(newImages);
      setModalOpen(false);
      setCurrentImage(null);
      setOriginalFile(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  }, [croppedAreaPixels, currentImage, images, onImagesChange]);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
          id="image-upload"
        />
        <label 
          htmlFor="image-upload" 
          className="flex flex-col items-center justify-center cursor-pointer p-4"
        >
          <div className="p-2 bg-gray-100 rounded-full mb-2">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-sm text-gray-600">Click to upload images</span>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={typeof image === 'string' ? image : image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button" // Explicitly set type to button
                onClick={(e) => handleRemoveImage(e, index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crop Image</h3>
              <button 
                type="button" // Explicitly set type to button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-96">
                <Cropper
                  image={currentImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button" // Explicitly set type to button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button" // Explicitly set type to button
                    onClick={handleCropSave}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;