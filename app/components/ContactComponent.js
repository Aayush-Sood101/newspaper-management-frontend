"use client";

import { useState } from 'react';
import { Mail, User, MessageSquare, Send, Phone, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    if (formData.subject && formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // EmailJS configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
      const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id';
      const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id';
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key';

      // Check if EmailJS is properly configured
      if (serviceID === 'your_service_id' || templateID === 'your_template_id' || publicKey === 'your_public_key') {
        throw new Error('EmailJS configuration not set up. Please configure your EmailJS credentials.');
      }

      // Initialize EmailJS with public key
      emailjs.init(publicKey);

      // Template parameters for EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject || 'Contact Form Submission',
        message: formData.message,
        to_name: 'Support Team',
        reply_to: formData.email,
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        serviceID,
        templateID,
        templateParams
      );

      console.log('Email sent successfully:', response);
      
      setSubmissionDetails({
        name: formData.name,
        email: formData.email,
        timestamp: new Date().toLocaleString()
      });
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to send message. Please try again later or contact us directly.';
      
      if (error.message && error.message.includes('configuration')) {
        errorMessage = 'Email service is not configured. Please contact the administrator.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid email configuration. Please try again later.';
      } else if (error.status === 401) {
        errorMessage = 'Email service authentication failed. Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSubmissionDetails(null);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
  };

  if (isSubmitted && submissionDetails) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Left Side: Success Message */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <h1 className="text-4xl font-bold text-black">Message Sent</h1>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Thank you, {submissionDetails.name}! We have received your message and will respond to {submissionDetails.email} within 24-48 business hours.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Submitted on:</p>
                <p className="text-black font-medium">{submissionDetails.timestamp}</p>
              </div>
              <button 
                onClick={resetForm}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Send Another Message
              </button>
            </div>

            {/* Right Side: Contact Information */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-black p-3 rounded-full">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-black font-medium">aayushsoodhp@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-black p-3 rounded-full">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-black font-medium">+91 9882715895</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left Side: Contact Information */}
          <div className="space-y-8 pt-8">
            <div>
              <h1 className="text-5xl font-bold text-black leading-tight mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                We are available for questions, feedback, or collaboration opportunities. 
                Let us know how we can help you achieve your goals!
              </p>
            </div>
            
            <div className="space-y-6 pt-4">
              <div className="flex items-center space-x-4">
                <div className="bg-black p-3 rounded-full">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium text-black">aayushsoodhp@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-black p-3 rounded-full">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg font-medium text-black">+91 9882715895</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-black mb-2">Get in Touch</h2>
                  <p className="text-gray-600">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                <div className="mb-8 h-px bg-gray-200"></div>

                <div className="space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div>
                      <label className="block text-black font-semibold text-base mb-2">
                        Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your Name"
                          className={`w-full pl-11 pr-4 py-3 text-base bg-white border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1 font-medium">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-black font-semibold text-base mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Your Email"
                          className={`w-full pl-11 pr-4 py-3 text-base bg-white border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-semibold text-base mb-2">
                      Subject (Optional)
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is this regarding?"
                      className={`w-full px-4 py-3 text-base bg-white border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Help us categorize your message.
                    </p>
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1 font-medium">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-black font-semibold text-base mb-2">
                      Message *
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Your Message"
                        rows={8}
                        className={`w-full pl-11 pr-4 py-3 text-base bg-white border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors resize-vertical min-h-40 ${
                          errors.message ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1 font-medium">{errors.message}</p>
                    )}
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-8 py-6 text-center text-sm text-gray-600 space-y-2">
                <p className="text-base font-medium">We respect your privacy and will never share your information.</p>
                <p className="text-base font-medium">Typically, we respond within 24-48 hours.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;