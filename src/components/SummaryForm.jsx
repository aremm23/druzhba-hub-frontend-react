import React, { useState } from 'react';
import axios from 'axios';
import { Spin } from 'antd';

export default function SummaryForm({ token, userId }) {
    const [bio, setBio] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        const data = {
            selfSummary: bio
        };

        try {
            console.log(userId)
            console.log(token)
            const response = await axios.put(`http://127.0.0.1:8080/api/profiles/${userId.toString()}/summary`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
            }
            });
            console.log(response.data);
            setSuccessMessage("Информация о себе успешно сохранена.");
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white px-10 py-20 rounded-3xl border-2 border-gray-200">
            <h1 className="text-5xl font-semibold">Информация о себе</h1>
            <p className="font-medium text-lg text-gray-500 mt-4">Пожалуйста, заполните информацию о себе</p>
            <form onSubmit={handleSubmit} className="mt-8">
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Ошибка!</strong>
                        <span className="block sm:inline"> {errorMessage}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Успех!</strong>
                        <span className="block sm:inline"> {successMessage}</span>
                    </div>
                )}
                {loading && (
                    <div className="flex justify-center items-center mb-4">
                        <Spin size="large" />
                    </div>
                )}
                <div>
                    <label className="text-lg font-medium">О себе</label>
                    <textarea
                        className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                        placeholder="Введите информацию о себе"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-8 flex flex-col gap-y-4">
                    <button
                        type="submit"
                        className="active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl bg-violet-500 text-white text-lg font-bold"
                        disabled={loading}
                    >
                        Сохранить
                    </button>
                </div>
            </form>
        </div>
    );
}
