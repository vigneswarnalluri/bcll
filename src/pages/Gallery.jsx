import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './Gallery.css';

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [lightboxImage, setLightboxImage] = useState(null);

    const categories = [
        'All',
        'Programs',
        'Field Work',
        'Rehabilitation & Livelihood',
        'Training & Camps',
        'Events',
        'Volunteers'
    ];

    const galleryImages = [
        // Programs
        { id: 1, category: 'Programs', src: '/image copy 4.png', caption: 'Serving nutritious meals to the hungry' },
        { id: 2, category: 'Programs', src: '/image copy 6.png', caption: 'Clothing distribution for children' },
        { id: 3, category: 'Programs', src: '/image copy 7.png', caption: 'Health camp medical checkups' },

        // Rehabilitation & Livelihood
        { id: 4, category: 'Rehabilitation & Livelihood', src: '/image copy 10.png', caption: 'Skill development workshop' },
        { id: 5, category: 'Rehabilitation & Livelihood', src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', caption: 'Small business unit training' },
        { id: 6, category: 'Rehabilitation & Livelihood', src: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&w=800&q=80', caption: 'Women empowerment tailoring unit' },

        // Field Work
        { id: 7, category: 'Field Work', src: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80', caption: 'Community survey and identification' },
        { id: 8, category: 'Field Work', src: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80', caption: 'On-ground counseling session' },

        // Training & Camps
        { id: 9, category: 'Training & Camps', src: 'https://images.unsplash.com/photo-1544531696-cb478dc02046?auto=format&fit=crop&w=800&q=80', caption: 'Fellowship youth training' },
        { id: 10, category: 'Training & Camps', src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b955?auto=format&fit=crop&w=800&q=80', caption: 'Awareness program in school' },

        // Volunteers
        { id: 11, category: 'Volunteers', src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80', caption: 'Volunteers sorting donations' },
        { id: 12, category: 'Volunteers', src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80', caption: 'Team coordination meeting' },

        // Events
        { id: 13, category: 'Events', src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', caption: 'Fundraising charity run' },
        { id: 14, category: 'Events', src: '/image copy 3.png', caption: 'Annual Day celebration' },
    ];

    const filteredImages = activeCategory === 'All'
        ? galleryImages
        : galleryImages.filter(img => img.category === activeCategory);

    return (
        <div className="gallery-page">
            {/* 1. HERO SECTION */}
            <div className="gallery-hero">
                <div className="container text-center">
                    <h1>Gallery</h1>
                    <p className="gallery-subtitle">Real work. Real people. Real impact.</p>
                </div>
            </div>

            {/* 2. MAIN LAYOUT (Sidebar + Grid) */}
            <div className="container section gallery-container-split">

                {/* SIDEBAR FILTERS */}
                <aside className="gallery-sidebar">
                    <h3>Categories</h3>
                    <div className="gallery-tabs-vertical">
                        {categories.map(cat => {
                            const count = cat === 'All'
                                ? galleryImages.length
                                : galleryImages.filter(img => img.category === cat).length;

                            return (
                                <button
                                    key={cat}
                                    className={`tab-btn-vertical ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    <span>{cat}</span>
                                    <span className="tab-count-vertical">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* MAIN GRID */}
                <main className="gallery-main">
                    <div key={activeCategory} className="gallery-grid-v2 animate-grid">
                        {filteredImages.map((img) => (
                            <div
                                key={img.id}
                                className="gallery-card"
                                onClick={() => setLightboxImage(img)}
                            >
                                <div className="img-wrapper">
                                    <img src={img.src} alt={img.caption} loading="lazy" />
                                </div>
                                <div className="gallery-caption">
                                    <p>{img.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* 5. LIGHTBOX */}
            {lightboxImage && (
                <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setLightboxImage(null)}>
                            <FaTimes />
                        </button>
                        <img src={lightboxImage.src} alt={lightboxImage.caption} />
                        <div className="lightbox-caption">
                            <p>{lightboxImage.caption}</p>
                            <span className="lightbox-cat">{lightboxImage.category}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. FOOTER NOTE */}
            <div className="gallery-footer-note text-center">
                <div className="container">
                    <p>Images shown are from actual programs and field activities carried out by Bharath Cares Life Line Foundation.</p>
                    <div className="note-actions">
                        <a href="/reports" className="note-link">View Reports</a>
                        <span className="separator">•</span>
                        <a href="/donate" className="note-link">Support Our Work</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gallery;
