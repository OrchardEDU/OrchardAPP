import React from 'react';
import './Features.css';

const Features = () => {
    const features = [
        {
            icon: "📤",
            title: "Upload Materials",
            description: "Simply drag and drop your existing lecture slides, PDFs, and test banks. We support all major formats."
        },
        {
            icon: "🧠",
            title: "AI Generation",
            description: "Our advanced AI analyzes your content and creates high-quality, relevant multiple-choice questions automatically."
        },
        {
            icon: "📊",
            title: "Instant Grading",
            description: "Students get immediate feedback on their exams. You get detailed analytics on class performance."
        }
    ];

    return (
        <section id="features" className="features">
            <div className="container">
                <div className="section-header">
                    <h2>Everything You Need to Assess Learning</h2>
                    <p>Streamline your workflow from exam creation to grading.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div className="feature-card" key={index}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
