// src/components/LeadFormModal.jsx
import { useState } from 'react';
import { plants } from '../data/plantData';

export default function LeadFormModal({ isOpen, onClose, plantName = "Your Plant" }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: '',
    timeline: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    // Allow letters, spaces, hyphens, apostrophes, and common international characters
    const nameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/;
    return nameRegex.test(name);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    } else if (!validateName(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email address is too long';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Lead submitted:', { ...formData, selectedPlant: plantName });
      setSubmitted(true);
      
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({ name: '', email: '', interest: '', timeline: '' });
        setErrors({});
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto relative"
           style={{
             boxShadow: '8px 8px 0px rgba(41, 74, 56, 0.3)'
           }}>
        
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
          >
            ×
          </button>

          {!submitted ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-forest mb-2"
                    style={{ fontFamily: 'Rubik Mono One, monospace' }}>
                  GET {plantName.toUpperCase()}
                </h2>
                <p className="text-gray-600 font-sans text-sm">
                  You deserve the perfect plant for your space, and that's {plantName}!
                </p>
              </div>

              <div className="space-y-3">
                {/* Name Field with Validation */}
                <div>
                  <label className="block text-forest font-sans font-medium mb-1 text-sm">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border-2 font-sans text-sm transition-colors duration-200 ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-forest/20 focus:border-forest'
                    }`}
                    style={{ 
                      boxShadow: errors.name 
                        ? '2px 2px 0px rgba(239, 68, 68, 0.2)' 
                        : '2px 2px 0px rgba(41, 74, 56, 0.1)' 
                    }}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.name}</p>
                  )}
                </div>

                {/* Email Field with Validation */}
                <div>
                  <label className="block text-forest font-sans font-medium mb-1 text-sm">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border-2 font-sans text-sm transition-colors duration-200 ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-forest/20 focus:border-forest'
                    }`}
                    style={{ 
                      boxShadow: errors.email 
                        ? '2px 2px 0px rgba(239, 68, 68, 0.2)' 
                        : '2px 2px 0px rgba(41, 74, 56, 0.1)' 
                    }}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.email}</p>
                  )}
                </div>

                {/* Interest Field */}
                <div>
                  <label className="block text-forest font-sans font-medium mb-1 text-sm">
                    I'm interested because:
                  </label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-forest/20 focus:border-forest font-sans text-sm transition-colors duration-200"
                    style={{ boxShadow: '2px 2px 0px rgba(41, 74, 56, 0.1)' }}
                  >
                    <option value="">Select a reason...</option>
                    <option value="beginner">I'm a beginner and want something easy</option>
                    <option value="expand">I want to expand my plant collection</option>
                    <option value="specific">I'm very lonely</option>
                    <option value="gift">It's for a gift</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Timeline Field */}
                <div>
                  <label className="block text-forest font-sans font-medium mb-1 text-sm">
                    When are you looking to get your plant?
                  </label>
                  <div className="space-y-1">
                    {[
                      { value: 'week', label: 'This week' },
                      { value: 'month', label: 'This month' }, 
                      { value: 'browsing', label: 'Just browsing' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="timeline"
                          value={option.value}
                          checked={formData.timeline === option.value}
                          onChange={handleInputChange}
                          className="mr-2 w-3 h-3 text-forest"
                        />
                        <span className="font-sans text-gray-700 text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-forest hover:bg-forest/90 text-white font-sans font-bold text-base py-3 mt-4
                           transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1
                           disabled:opacity-50 disabled:transform-none"
                  style={{ boxShadow: '3px 3px 0px rgba(41, 74, 56, 0.6)' }}
                >
                  {isSubmitting ? 'Sending...' : 'Get My Plant Info!'}
                </button>
              </div>

              <p className="text-xs text-gray-500 font-sans mt-3 text-center">
                We'll never spam you. Plant promise!
              </p>
            </>
          ) : (
<div className="text-center py-6">
  {/* Circular Plant Image */}
  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
    <img
      src={`/plants/${plants.find(plant => plant.name === plantName)?.image}`}
      alt={plantName}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
    <div className="hidden w-full h-full items-center justify-center text-3xl">🌱</div>
  </div>
  
  <h3 className="text-xl font-bold text-forest mb-2"
      style={{ fontFamily: 'Rubik Mono One, monospace' }}>
    SUCCESS!
  </h3>
  <p className="text-gray-600 font-sans text-sm">
    We'll be in touch about {plantName} soon!
  </p>
</div>
          )}
        </div>
      </div>
    </div>
  );
}