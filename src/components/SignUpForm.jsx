import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spin, Steps } from 'antd';
import { UserOutlined, SolutionOutlined, LoadingOutlined, SmileOutlined } from '@ant-design/icons';

export default function SignUpForm({ toggleForm, onSuccess }) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAdditionalForm, setShowAdditionalForm] = useState(false);
    const [userId, setUserId] = useState(null);
    const [selfSummary, setSelfSummary] = useState('');
    const [age, setAge] = useState('');
    const [place, setPlace] = useState('');
    const [emailConfirming, setEmailConfirming] = useState(false);
    const [emailConfirmed, setEmailConfirmed] = useState(false);

    const currentStep = emailConfirming ? 2 : (showAdditionalForm ? 1 : 0);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        if (password !== confirmPassword) {
            setErrorMessage("Пароли не совпадают!");
            setLoading(false);
            return;
        }

        const data = {
            email: email,
            password: password,
            role: "USER",
            username: username
        };

        try {
            const response = await axios.post('http://127.0.0.1:8080/api/security/register', data);
            setUserId(response.data.id);
            setSuccessMessage("Расскажите немного о себе.");
            setShowAdditionalForm(true);
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

    const handleAdditionalSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        const additionalData = {
            selfSummary: selfSummary,
            age: parseInt(age),
            place: place
        };

        try {
            await axios.put(`http://localhost:8080/api/profiles/${userId}/general`, additionalData);
            setSuccessMessage("Вы успешно зарегистрировались. Осталось подтвердить email. Для этого перейдите по ссылке присланной вам на почту.");
            setEmailConfirming(true);
            checkEmailConfirmation();
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

    const checkEmailConfirmation = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8080/api/security/is-confirmed/${userId}`);
            if (response.data.isEmailConfirmed) {
                setEmailConfirming(false);
                setEmailConfirmed(true);
            } else {
                setTimeout(checkEmailConfirmation, 10000);
            }
        } catch (error) {
            setErrorMessage("Failed to check email confirmation status.");
            setEmailConfirming(false);
        }
    };

    return (
        <div className="bg-white px-10 py-20 rounded-3xl border-2 border-gray-200">
            <h1 className="text-5xl font-semibold">Регистрация</h1>
            <p className="font-medium text-lg text-gray-500 mt-4">Пожалуйста, заполните форму для создания аккаунта. Перед использованием приложения подтвердите email.</p>
            <Steps
                current={currentStep}
                className="p-6 h-auto"
                items={[
                    {
                        title: 'Регистрация',
                        status: currentStep > 0 ? 'finish' : 'process',
                        icon: <UserOutlined />,
                    },
                    {
                        title: 'О себе',
                        status: currentStep > 1 ? 'finish' : (currentStep === 1 ? 'process' : 'wait'),
                        icon: <SolutionOutlined />,
                    },
                    {
                        title: 'Подтверждение',
                        status: emailConfirming ? 'process' : (currentStep > 1 ? 'finish' : 'wait'),
                        icon: <LoadingOutlined />,
                    },
                    {
                        title: 'Готово',
                        status: emailConfirmed ? 'finish' : 'wait',
                        icon: <SmileOutlined />,
                    },
                ]}
            />
            {emailConfirming ? (
                <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <Spin size="large" />
                    <p className="mt-4 text-xl">Пожалуйста, подтвердите email...</p>
                </div>
            ) : emailConfirmed ? (
                <div className="text-center">
                    <p className="text-2xl mt-8">Теперь вы можете залогиниться в аккаунт.</p>
                    <button
                        className="active:scale-[.98] active:duration-75 p-6 mt-7 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl bg-violet-500 text-white text-lg font-bold"
                        onClick={toggleForm}
                    >
                        Продолжить
                    </button>
                </div>
            ) : (
                <>
                    {!showAdditionalForm ? (
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
                                <label className="text-lg font-medium">Email</label>
                                <input
                                    type="email"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Введите email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-lg font-medium">Уникальное имя пользователя</label>
                                <input
                                    type="text"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Введите имя пользователя"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-lg font-medium">Пароль</label>
                                <input
                                    type="password"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Введите пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-lg font-medium">Подтвердите пароль</label>
                                <input
                                    type="password"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Подтвердите пароль"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-8 flex flex-col gap-y-4">
                                <button
                                    type="submit"
                                    className="active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl bg-violet-500 text-white text-lg font-bold"
                                    disabled={loading}
                                >
                                    Зарегистрироваться
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleAdditionalSubmit} className="mt-8">
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
                                <input
                                    type="text"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Расскажите о себе, рекомендуется оставить ссылку на вашу соц сеть"
                                    value={selfSummary}
                                    onChange={(e) => setSelfSummary(e.target.value)}
                                    maxLength={300}
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-lg font-medium">Возраст</label>
                                <input
                                    type="number"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Введите ваш возраст"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    min={18}
                                    max={99}
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-lg font-medium">Город</label>
                                <input
                                    type="text"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Введите ваш город"
                                    value={place}
                                    onChange={(e) => setPlace(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-8 flex flex-col gap-y-4">
                                <button
                                    type="submit"
                                    className="active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl bg-violet-500 text-white text-lg font-bold"
                                    disabled={loading}
                                >
                                    Отправить
                                </button>
                            </div>
                        </form>
                    )}
                    <div className="mt-8 flex flex-col gap-y-4">
                        <p className="font-medium text-base">Уже есть аккаунт?</p>
                        <span
                            className="text-violet-500 text-base font-medium ml-2 cursor-pointer"
                            onClick={toggleForm}
                        >
                            Войти
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
