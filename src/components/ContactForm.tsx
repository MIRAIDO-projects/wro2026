import React, { useState } from 'react';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        subject: '',
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (name: string, value: string) => {
        let error = '';
        if (name === 'subject' && !value) error = '件名を選択してください';
        if (name === 'name' && !value.trim()) error = 'お名前を入力してください';
        if (name === 'email') {
            if (!value.trim()) error = 'メールアドレスを入力してください';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'メールアドレスの形式が正しくありません';
        }
        if (name === 'message' && !value.trim()) error = 'お問い合わせ内容を入力してください';
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validate(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        // Only prevent default if validation fails
        const newErrors: Record<string, string> = {};
        Object.keys(formData).forEach(key => {
            const error = validate(key, formData[key as keyof typeof formData]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            e.preventDefault(); // Stop submission only if errors exist
            setErrors(newErrors);
            return;
        }

        // If no errors, let the browser handle the POST submission naturally to the action URL.
    };

    return (
        <div className="w-full text-left">
            <form
                action="https://hyperform.jp/api/t1ePaX2M"
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
            >
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-600 mb-2">件名</label>
                    <div className="relative">
                        <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:outline-none transition-colors text-slate-900 appearance-none ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                            required
                            aria-invalid={!!errors.subject}
                            aria-describedby={errors.subject ? "subject-error" : undefined}
                        >
                            <option value="" disabled>件名を選択してください</option>
                            <option value="General Inquiry">一般的なお問い合わせ</option>
                            <option value="About Entry">参加・エントリーについて</option>
                            <option value="Partnership">パートナー・協賛について</option>
                            <option value="Media / Press">取材・メディア掲載について</option>
                            <option value="Other">その他</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                    {errors.subject && <p id="subject-error" className="mt-2 text-sm text-red-500">{errors.subject}</p>}
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-2">お名前</label>
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
                    <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">メールアドレス</label>
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
                    <label htmlFor="message" className="block text-sm font-medium text-slate-600 mb-2">お問い合わせ内容</label>
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

                <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-full hover:bg-slate-700 transition-colors flex justify-center items-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    送信する
                </button>
            </form>
        </div>
    );
}
