import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostDetails from './PostDetails';
import {Image, Button, Rate} from 'antd';

export default function ProfilePage({ userId, token }) {
    const [userProfile, setUserProfile] = useState(null);
    const [userImages, setUserImages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/profiles/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserProfile(response.data)
                console.log(response.data)
            } catch (error) {
                setError('Не удалось получить профиль пользователя.');
                console.error(error);
            }
        };

        const fetchUserImages = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/images/profile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserImages(response.data);
            } catch (error) {
                setError('Не удалось получить изображения пользователя.');
                console.error(error);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const profileResponse = await axios.get(`http://127.0.0.1:8080/api/profiles/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const postPromises = profileResponse.data.posts.map(postId =>
                    axios.get(`http://127.0.0.1:8080/api/posts/${postId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                );
                const postResponses = await Promise.all(postPromises);
                setPosts(postResponses.map(res => res.data));
            } catch (error) {
                setError('Не удалось получить посты пользователя.');
                console.error(error);
            }
        };

        fetchUserProfile();
        fetchUserImages();
        fetchUserPosts();
    }, [userId, token]);

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
    }

    if (!userProfile) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="bg-gray-100 px-10 py-10 rounded-3xl border-2 border-gray-200 max-w-4xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-5xl font-semibold text-purple-700">{userProfile.username}</h1>
                    <p className="text-lg text-gray-600 mt-4">{userProfile.selfSummary}</p>
                </div>
                {userImages.length > 0 && (
                    <img
                        src={userImages[0].url}
                        alt="Profile Avatar"
                        className="w-60 h-60 rounded-full object-cover border-4 border-purple-500 hover:scale-[1.01]"
                    />
                )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-10">
                <div className="bg-white p-4 rounded-lg shadow">
                    <label className="text-lg font-medium text-gray-600">Подписчики</label>
                    <p className="text-2xl text-purple-700">{userProfile.subscribers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <label className="text-lg font-medium text-gray-600">Подписки</label>
                    <p className="text-2xl text-purple-700">{userProfile.subscribedTo}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <label className="text-lg font-medium text-gray-600">Рейтинг</label>
                    <p className="text-2xl text-purple-700">{userProfile.rate}</p>
                    <Rate disabled defaultValue={userProfile.rate} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-10">
                {userImages.map((image) => (
                    <div key={image.id} className="bg-white rounded-lg shadow">
                        <Image src={image.url} alt={`User image ${image.id}`} className="w-full h-auto rounded-lg" />
                    </div>
                ))}
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Посты</h2>
                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <PostDetails key={post.id} postId={post.id} token={token} />
                        ))}
                    </div>
                ) : (
                    <p className="text-lg text-gray-500">Постов нет.</p>
                )}
            </div>
        </div>
    );
}
