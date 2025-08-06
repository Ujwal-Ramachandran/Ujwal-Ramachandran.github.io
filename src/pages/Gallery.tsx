import { useState } from 'react';
import { Button } from '@/components/ui/button';
import One from '@/assets/1.jpeg';
import Two from '@/assets/2.jpeg';
import Three from '@/assets/3.jpeg';
import Four from '@/assets/4.jpeg';
import Five from '@/assets/5.jpeg';
import Six from '@/assets/6.jpeg';
import Seven from '@/assets/7.jpeg';
import Eight from '@/assets/8.jpeg';
import Nine from '@/assets/9.jpeg';
import Ten from '@/assets/10.jpeg';
import Eleven from '@/assets/11.jpeg';
import Twelve from '@/assets/12.jpeg';
import Thirteen from '@/assets/13.jpeg';
import Fourteen from '@/assets/14.jpeg';
import Fifteen from '@/assets/15.jpeg';
import Sixteen from '@/assets/16.jpeg';
import Seventeen from '@/assets/17.jpeg';
import Eighteen from '@/assets/18.jpeg';
import Nineteen from '@/assets/19.jpeg';
import Twenty from '@/assets/20.jpeg';
import TwentyOne from '@/assets/21.jpeg';
import TwentyTwo from '@/assets/22.jpeg';
import TwentyThree from '@/assets/23.jpeg';
import TwentyFour from '@/assets/24.jpeg';
import TwentyFive from '@/assets/25.jpeg';
import TwentySix from '@/assets/26.jpeg';
import TwentySeven from '@/assets/27.jpeg';
import TwentyEight from '@/assets/28.jpeg';
import TwentyNine from '@/assets/29.jpeg';
import Thirty from '@/assets/30.jpeg';
import ThirtyOne from '@/assets/31.jpeg';
import ThirtyTwo from '@/assets/32.jpeg';
import ThirtyThree from '@/assets/33.jpeg';
import ThirtyFour from '@/assets/34.jpeg';
import ThirtyFive from '@/assets/35.jpeg';

const Gallery = () => {
  const [images, setImages] = useState([
    { id: 1, src: One, alt: "Serene sunrise over misty forest landscape with layered hills and golden sky", title: "Dawn's Embrace" },
  { id: 2, src: Two, alt: "Golden ornamental grass swaying in natural field with purple and amber hues", title: "Nature's Canvas" },
  { id: 3, src: Three, alt: "Traditional oil lamp with bright flame creating warm ambient lighting in dark setting", title: "Sacred Light" },
  { id: 4, src: Four, alt: "Vibrant pink wildflowers blooming in garden setting with lush green foliage", title: "Garden Bliss" },
  { id: 5, src: Five, alt: "Red weaver ants working together on a large green leaf with detailed leaf venation visible", title: "Weaver Ants on Leaf" },
  { id: 6, src: Six, alt: "Close-up view of green moss growing on weathered concrete surface with delicate sporophytes visible", title: "Moss Growing on Stone" },
  { id: 7, src: Seven, alt: "Pink feather held against blue sky with sunlight streaming through creating a soft ethereal glow", title: "Pink Feather in Sunlight" },
  { id: 8, src: Eight, alt: "Field of bright yellow coreopsis flowers blooming in golden sunlight with trees silhouetted in the background", title: "Coreopsis Flower Garden" },
  { id: 9, src: Nine, alt: "Spiky brown seed pod from sweet gum tree lying on forest floor surrounded by fallen leaves and natural debris", title: "Sweet Gum Seed Pod" },
  { id: 10, src: Ten, alt: "Close-up of white dandelion seed with delicate pappus dispersal structure on reflective surface", title: "Dandelion Seed Pappus" },
  { id: 11, src: Eleven, alt: "Small bird perched on green leafy branch in urban setting during golden hour with blurred background", title: "Bird on Urban Branch" },
  { id: 12, src: Twelve, alt: "Warm orange paper lanterns glowing softly in darkness creating atmospheric ambient lighting", title: "Warm Orange Lanterns" },
  { id: 13, src: Thirteen, alt: "Close-up of glowing white disc-shaped lanterns in the dark", title: "Glowing Paper Lanterns" },
  { id: 14, src: Fourteen, alt: "Top view of a cluster of yellow-hued candle lights forming a spherical shape against a black background", title: "Yellow Candle Cluster" },
  { id: 15, src: Fifteen, alt: "An orange hibiscus flower illuminated by sunlight with green foliage behind", title: "Sunlit Hibiscus Blossom" },
  { id: 16, src: Sixteen, alt: "A small brown gecko clinging to the tiled corner of a white wall", title: "My Scaly Friend" },
  { id: 17, src: Seventeen, alt: "Golden sunset over a calm lake with silhouettes of palm trees, buildings, and vegetation reflected in the water", title: "Golden Lake Sunset" },
  { id: 18, src: Eighteen, alt: "A clear glass mug with golden sunlight filtering through it, creating warm reflections on a wooden surface with trees in the background", title: "Sunlit Glass Mug" },
  { id: 19, src: Nineteen, alt: "Close-up of an orange and yellow hibiscus flower with prominent red stamens and pistil surrounded by green leaves", title: "Hibiscus Flower Detail" },
  { id: 20, src: Twenty, alt: "A colorful red and green parrot perched on the brass railing of what appears to be a vintage car or vehicle", title: "Parrot on Brass Rail" },
  { id: 21, src: TwentyOne, alt: "Vibrant pink bougainvillea flowers with green leaves creating a soft-focused floral background", title: "Pink Bougainvillea Blooms" },
  { id: 22, src: TwentyTwo, alt: "Golden flowering plant spikes backlit by bright sunlight in a garden courtyard with buildings in the background", title: "Sunlit Golden Flowers" },
  { id: 23, src: TwentyThree, alt: "A delicate pink hibiscus flower with prominent stamens in a lush garden setting", title: "Pink Hibiscus Garden" },
  { id: 24, src: TwentyFour, alt: "A reddish-brown millipede crawling on dark asphalt pavement with scattered debris", title: "Millipede on Pavement" },
  { id: 25, src: TwentyFive, alt: "A dark millipede with yellow stripes crawling on a concrete ledge", title: "Striped Millipede" },
  { id: 26, src: TwentySix, alt: "Green moss or small plants growing on weathered concrete with buildings visible in the background", title: "Moss on Concrete" },
  { id: 27, src: TwentySeven, alt: "A white swan with yellow beak standing in shallow water with its head tucked back", title: "Resting Swan" },
  { id: 28, src: TwentyEight, alt: "Two black ostriches in an outdoor enclosure with green grass and concrete pathways", title: "Ostriches in Enclosure" },
  { id: 29, src: TwentyNine, alt: "Urban residential buildings with a rainbow arcing across the cloudy sky above green hills", title: "Rainbow Over my hostels" },
  { id: 30, src: Thirty, alt: "Brown autumn leaves hanging from tree branches with a blurred lake and landscape in the background", title: "Autumn Leaves by Lake" },
  { id: 31, src: ThirtyOne, alt: "Vibrant pink flowering tree with delicate blooms and green leaves in a garden setting", title: "Pink Flowering Tree" },
  { id: 32, src: ThirtyTwo, alt: "An Atlas moth - Worlds biggest moth", title: "An Atlas moth - Worlds biggest moth" },
  { id: 33, src: ThirtyThree, alt: "Cat taking a selfie", title: "Cat taking a selfie" },
  { id: 34, src: ThirtyFour, alt: "Rusty rope or cable attachment on weathered structure", title: "Weathered Connection" },
  { id: 35, src: ThirtyFive, alt: "Garden plants with small yellow flowers in dappled sunlight", title: "Garden in Sunlight" },
  ]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            src: e.target?.result as string,
            alt: file.name,
            title: file.name.split('.')[0]
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden matrix-bg">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 cyber-text-glow">
              My Gallery
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full animate-glow mb-6" />
            <p className="text-xl text-muted-foreground">
              A collection of my photography work and visual explorations
            </p>
          </div>
        </div>
      </section>
      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div 
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl cyber-border-glow hover:scale-105 transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                      onClick={() => setSelectedImage(image.src)}
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4">
                      <h4 className="text-white font-semibold">{image.title}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            className="cyber-button"
          >
            Back to Home
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Gallery;