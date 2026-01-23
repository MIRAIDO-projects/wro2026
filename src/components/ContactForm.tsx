import React, { useState } from 'react';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const validate = (name: string, value: string) => {
        let error = '';
        if (name === 'name' && !value.trim()) error = 'Name is required';
        if (name === 'email') {
            if (!value.trim()) error = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email address';
        }
        if (name === 'message' && !value.trim()) error = 'Message is required';
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validate(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        Object.keys(formData).forEach(key => {
            const error = validate(key, formData[key as keyof typeof formData]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setStatus('submitting');

        // Replace with actual HyperForm endpoint
        const HF_ENDPOINT = "https://hyperform.jp/api/your-form-id";

        try {
            // Simulation of API Call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (e) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 p-8 rounded-lg text-center animate-fade-in border border-green-200">
                <h3 className="text-2xl font-bold text-green-700 mb-4">Thank you!</h3>
                <p className="text-green-800 mb-6">Your message has been received. We will contact you shortly.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="w-full text-left">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-2">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:outline-none transition-colors text-slate-900 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                        required
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && <p id="name-error" className="mt-2 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:outline-none transition-colors text-slate-900 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                        required
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-600 mb-2">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:outline-none transition-colors text-slate-900 ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                        required
                        aria-invalid={!!errors.message}
                    />
                    {errors.message && <p className="mt-2 text-sm text-red-500">{errors.message}</p>}
                </div>

                {status === 'error' && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                        Something went wrong. Please try again.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    {status === 'submitting' ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Send Message'}
                </button>
            </form>
        </div>
    );
}
