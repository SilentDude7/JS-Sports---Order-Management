import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const NewArrivals = () => {
  const newArrivals = [
    {
      _id: "1",
      name: "Stylish Jacket",
      price: 120,
      images: {
        url: "https://picsum.photos/500/500?random=1",
        alt: "Stylish Jacket"
      }
    },
    {
      _id: "2",
      name: "Cool Hoodie",
      price: 100,
      images: {
        url: "https://picsum.photos/500/500?random=2",
        alt: "Cool Hoodie"
      }
    },
    {
      _id: "3",
      name: "Trendy Coat",
      price: 150,
      images: {
        url: "https://picsum.photos/500/500?random=3",
        alt: "Trendy Coat"
      }
    },
    {
      _id: "4",
      name: "Modern Jacket",
      price: 130,
      images: {
        url: "https://picsum.photos/500/500?random=4",
        alt: "Modern Jacket"
      }
    },
    {
      _id: "5",
      name: "Urban Blazer",
      price: 140,
      images: {
        url: "https://picsum.photos/500/500?random=5",
        alt: "Urban Blazer"
      }
    },
    {
      _id: "6",
      name: "Winter Wear",
      price: 160,
      images: {
        url: "https://picsum.photos/500/500?random=6",
        alt: "Winter Wear"
      }
    },
    {
      _id: "7",
      name: "Denim Jacket",
      price: 110,
      images: {
        url: "https://picsum.photos/500/500?random=7",
        alt: "Denim Jacket"
      }
    },
    {
      _id: "8",
      name: "Fleece Jacket",
      price: 125,
      images: {
        url: "https://picsum.photos/500/500?random=8",
        alt: "Fleece Jacket"
      }
    }
  ];

  const scrollRef = useRef(null);

  // Scroll left by 300px
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Scroll right by 300px
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section>
      <div className="container mx-auto text-center mb-10 relative px-4">
        <h2 className="text-3xl font-bold mb-4">Explore the New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest styles straight off the runway — freshly added to keep your wardrobe
          on the cutting edge of sporting fashion.
        </p>

        {/* Buttons container */}
        <div className="absolute right-4 top-0 flex space-x-2 mb-2 z-10">
          <button
            onClick={scrollLeft}
            className="p-2 rounded border bg-white text-black hover:bg-gray-100 shadow"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded border bg-white text-black hover:bg-gray-100 shadow"
            aria-label="Scroll right"
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="relative overflow-x-auto scrollbar-hide"
          style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
        >
          <div className="flex space-x-6 px-12">
            {newArrivals.map((product) => (
              <div
                key={product._id}
                className="flex-shrink-0 w-64 h-72 rounded-2xl overflow-hidden relative group cursor-pointer"
              >
                <img
                  src={product.images.url}
                  alt={product.images.alt || product.name}
                  className="w-full h-full object-cover rounded-2xl transition duration-300 group-hover:blur-sm"
                />
                <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-md p-3 rounded-lg text-center w-[90%] opacity-0 group-hover:opacity-100 transition duration-300">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-gray-700">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
