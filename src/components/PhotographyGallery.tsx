import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ThirtyThree from '@/assets/33.jpeg';
import ThirtyTwo from '@/assets/32.jpeg';
import Seventeen from '@/assets/17.jpeg';

interface Photo {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

export const PhotographyGallery = () => {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const photos: Photo[] = [
    {
      id: 1,
      src: ThirtyThree,
      alt: "A white cat with green eyes looking up at camera",
      title: "A Cat's selfie",
      description: "Cat taking a selfie. Thats it"
    },
    {
      id: 2,
      src: ThirtyTwo,
      alt: "Vibrant orange flowers",
      title: "An Atlas moth - Worlds biggest moth",
      description: "The Atlas moth (Attacus atlas) is a large, distinctive moth known for its impressive wingspan, found in the Malabar region"
    },
    {
      id: 3,
      src: Seventeen,
      alt: "Golden Lake Sunset",
      title: "Golden Lake Sunset",
      description: "Golden sunset over a calm lake with silhouettes of palm trees, buildings, and vegetation reflected in the water"
    }
  ];

  // Only show first 3 photos
  const displayedPhotos = photos.slice(0, 3);

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + displayedPhotos.length) % displayedPhotos.length
      : (currentIndex + 1) % displayedPhotos.length;
    
        setCurrentIndex(newIndex);
        setSelectedPhoto(displayedPhotos[newIndex]);
  };

  return (
    <section className="py-20 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 matrix-bg opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Camera className="h-8 w-8 text-primary" />
              <h2 className="text-4xl lg:text-5xl font-bold cyber-text-glow">
                My Gallery
              </h2>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          {/* Photo Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayedPhotos.map((photo, index) => (
              <div 
                key={photo.id}
                className="tech-card group cursor-pointer overflow-hidden"
                onClick={() => openLightbox(photo, index)}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <img 
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Photo Info */}
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {photo.title}
                    </h3>
                    <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {photo.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* See More Button */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/gallery')}
              className="cyber-button group text-lg px-8 py-4"
            >
              See More
              <Camera className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>

            {/* Main Image */}
            <div className="relative">
              <img 
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedPhoto.title}
                </h3>
                <p className="text-gray-200">
                  {selectedPhoto.description}
                </p>
              </div>
            </div>

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 bg-black/50 rounded-full px-3 py-1">
              <span className="text-white text-sm">
                {currentIndex + 1} / {displayedPhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};