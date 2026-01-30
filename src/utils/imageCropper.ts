import ImageCropPicker from 'react-native-image-crop-picker';
import ImageCompressor from 'react-native-compressor';
import { fileUriWrapper } from './index';

export interface CroppedImageResult {
  uri: string;
  type: string;
  name: string;
  width?: number;
  height?: number;
}

export interface ImageCropperOptions {
  /** Size of the square crop (default: 400) */
  cropSize?: number;
  /** Quality of the output image 0-1 (default: 0.8) */
  quality?: number;
  /** Whether to use circular overlay like WhatsApp (default: true) */
  circularOverlay?: boolean;
  /** Custom file name prefix (default: 'cropped_image') */
  fileNamePrefix?: string;
  /** Whether to compress the final image (default: true) */
  compress?: boolean;
  /** Compression quality 0-1 (default: 0.8) */
  compressionQuality?: number;
  /** Max width for compression (default: 800) */
  maxWidth?: number;
  /** Max height for compression (default: 800) */
  maxHeight?: number;
}

const defaultOptions: Required<ImageCropperOptions> = {
  cropSize: 400,
  quality: 0.8,
  circularOverlay: true,
  fileNamePrefix: 'cropped_image',
  compress: true,
  compressionQuality: 0.8,
  maxWidth: 800,
  maxHeight: 800,
};

/**
 * Opens image gallery with built-in cropper (WhatsApp-like flow)
 * Uses react-native-image-crop-picker's openPicker with cropping enabled
 * This is more reliable than using a separate gallery + cropper
 */
export const selectAndCropImage = async (
  options?: ImageCropperOptions,
): Promise<CroppedImageResult | null> => {
  const opts = { ...defaultOptions, ...options };

  try {
    // Use openPicker with cropping enabled - this handles gallery selection + cropping in one flow
    const image = await ImageCropPicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: opts.cropSize,
      height: opts.cropSize,
      cropperCircleOverlay: opts.circularOverlay,
      cropperToolbarTitle: 'Crop Photo',
      cropperToolbarColor: '#000000',
      cropperToolbarWidgetColor: '#FFFFFF',
      cropperActiveWidgetColor: '#FFFFFF',
      freeStyleCropEnabled: false,
      showCropFrame: true,
      showCropGuidelines: false,
      hideBottomControls: false,
      enableRotationGesture: true,
      compressImageQuality: opts.quality,
      forceJpg: true,
    });

    console.log('Image selected and cropped:', JSON.stringify(image, null, 2));

    let finalUri = fileUriWrapper(image.path);

    // Optionally compress the cropped image
    if (opts.compress) {
      try {
        const compressedImage = await ImageCompressor.Image.compress(
          finalUri,
          {
            quality: opts.compressionQuality,
            maxWidth: opts.maxWidth,
            maxHeight: opts.maxHeight,
          },
        );
        finalUri = fileUriWrapper(compressedImage);
        console.log('Compressed image URI:', finalUri);
      } catch (compressError) {
        console.warn('Compression failed, using cropped image:', compressError);
      }
    }

    return {
      uri: finalUri,
      type: image.mime || 'image/jpeg',
      name: `${opts.fileNamePrefix}_${Date.now()}.jpg`,
      width: image.width,
      height: image.height,
    };
  } catch (error: any) {
    if (error?.code === 'E_PICKER_CANCELLED') {
      console.log('User cancelled image selection/cropping');
    } else {
      console.error('Error selecting/cropping image:', error);
    }
    return null;
  }
};

/**
 * Opens cropper directly on an existing image path
 * Useful when you already have an image and just want to crop it
 */
export const cropExistingImage = async (
  imagePath: string,
  options?: ImageCropperOptions,
): Promise<CroppedImageResult | null> => {
  const opts = { ...defaultOptions, ...options };

  try {
    const croppedImage = await ImageCropPicker.openCropper({
      path: imagePath,
      width: opts.cropSize,
      height: opts.cropSize,
      cropperCircleOverlay: opts.circularOverlay,
      cropping: true,
      cropperToolbarTitle: 'Crop Photo',
      cropperToolbarColor: '#000000',
      cropperToolbarWidgetColor: '#FFFFFF',
      cropperActiveWidgetColor: '#FFFFFF',
      freeStyleCropEnabled: false,
      showCropFrame: true,
      showCropGuidelines: false,
      hideBottomControls: false,
      enableRotationGesture: true,
      compressImageQuality: opts.quality,
      mediaType: 'photo',
    });

    let finalUri = fileUriWrapper(croppedImage.path);

    if (opts.compress) {
      try {
        const compressedImage = await ImageCompressor.Image.compress(
          finalUri,
          {
            quality: opts.compressionQuality,
            maxWidth: opts.maxWidth,
            maxHeight: opts.maxHeight,
          },
        );
        finalUri = fileUriWrapper(compressedImage);
      } catch (compressError) {
        console.warn('Compression failed, using cropped image:', compressError);
      }
    }

    return {
      uri: finalUri,
      type: croppedImage.mime || 'image/jpeg',
      name: `${opts.fileNamePrefix}_${Date.now()}.jpg`,
      width: croppedImage.width,
      height: croppedImage.height,
    };
  } catch (error: any) {
    if (error?.code === 'E_PICKER_CANCELLED') {
      console.log('User cancelled image cropping');
    } else {
      console.error('Error cropping image:', error);
    }
    return null;
  }
};

/**
 * Clean up temporary files created by the image crop picker
 * Should be called when you're done with the images
 */
export const cleanupCropperCache = async (): Promise<void> => {
  try {
    await ImageCropPicker.clean();
  } catch (error) {
    console.warn('Failed to clean cropper cache:', error);
  }
};
