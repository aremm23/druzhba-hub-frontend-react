import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Rate, Carousel, Menu, Button, Modal, List, Avatar, message } from 'antd';
import PostDetails from './PostDetails';
import ReviewCard from './ReviewCard';
import './Carousel.css';
import { UserOutlined, HomeOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

export default function ProfilePage({ currentUserId, token, profileId }) {
    const [userProfile, setUserProfile] = useState(null);
    const [userImages, setUserImages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [showSubscribers, setShowSubscribers] = useState(false);
    const [showSubscriptions, setShowSubscriptions] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/profiles/${profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserProfile(response.data);
            } catch (error) {
                setError('Не удалось получить профиль пользователя.');
                console.error(error);
            }
        };

        const fetchUserImages = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/images/profile/${profileId}`, {
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
                const profileResponse = await axios.get(`http://127.0.0.1:8080/api/profiles/${profileId}`, {
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
                const postData = postResponses.map(res => res.data);

                // Fetch likes and add to post data
                const likePromises = postData.map(post =>
                    axios.get(`http://127.0.0.1:8080/api/likes/post/${post.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                );
                const likesResponses = await Promise.all(likePromises);
                const postsWithLikes = postData.map((post, index) => ({
                    ...post,
                    likes: likesResponses[index].data
                }));

                setPosts(postsWithLikes.reverse());
            } catch (error) {
                setError('Не удалось получить посты пользователя.');
                console.error(error);
            }
        };

        const fetchUserReviews = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/reviews/profile/${profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setReviews(response.data);
            } catch (error) {
                setError('Не удалось получить отзывы.');
                console.error(error);
            }
        };

        const fetchSubscribers = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/subscriptions/subscribers/${profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSubscribers(response.data);
            } catch (error) {
                setError('Не удалось получить подписчиков.');
                console.error(error);
            }
        };

        const fetchSubscriptions = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/subscriptions/subscriptions/${profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSubscriptions(response.data);
            } catch (error) {
                setError('Не удалось получить подписки.');
                console.error(error);
            }
        };

        fetchUserProfile();
        fetchUserImages();
        fetchUserPosts();
        fetchUserReviews();
        fetchSubscribers();
        fetchSubscriptions();
    }, [profileId, token]);

    const handleSubscribe = async () => {
        try {
            await axios.post(`http://127.0.0.1:8080/api/subscriptions/${currentUserId}/${profileId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            message.success('Вы успешно подписались на пользователя.');
            // Обновляем список подписок после подписки
            const response = await axios.get(`http://127.0.0.1:8080/api/subscriptions/subscriptions/${profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSubscriptions(response.data);
        } catch (error) {
            message.error('Не удалось подписаться на пользователя.');
            console.error(error);
        }
    };

    const handleUnsubscribe = async (subscriberId) => {
        try {
            await axios.delete(`http://127.0.0.1:8080/api/subscriptions/${subscriberId}/${profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            message.success('Вы успешно отписались от пользователя.');
            // Обновляем список подписок после отписки
            const response = await axios.get(`http://127.0.0.1:8080/api/subscriptions/subscriptions/${profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSubscriptions(response.data);
        } catch (error) {
            message.error('Не удалось отписаться от пользователя.');
            console.error(error);
        }
    };

    const handleReviewSubmit = async () => {
        try {
            await axios.post(`http://127.0.0.1:8080/api/reviews`, {
                profileFromId: currentUserId,
                profileToId: profileId,
                comment: reviewContent,
                grade: reviewRating
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            message.success('Отзыв успешно добавлен.');
            // После добавления отзыва перезагружаем список отзывов
            const response = await axios.get(`http://127.0.0.1:8080/api/reviews/profile/${profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setReviews(response.data);
            setShowReviewModal(false);
        } catch (error) {
            message.error('Не удалось добавить отзыв.');
            console.error(error);
        }
    };

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
    }

    if (!userProfile) {
        return <div>Загрузка...</div>;
    }

    const isOwnProfile = currentUserId === profileId;

    const menuItems = [
        {
            label: 'Главная лента',
            key: 'home',
            icon: <HomeOutlined />
        },
        {
            label: 'Поиск',
            key: 'search',
            icon: <SearchOutlined />
        },
        {
            label: 'Редактирование аккаунта',
            key: 'edit',
            icon: <EditOutlined />
        }
    ];

    return (
        <div className="bg-gray-100 px-10 py-10 rounded-3xl border-2 border-gray-200 max-w-4xl min-h-full">
            {!isOwnProfile && (
                <div className="mb-4">
                    {subscriptions.includes(currentUserId) ? (
                        <Button type="primary" onClick={() => handleUnsubscribe(currentUserId)}>Отписаться</Button>
                    ) : (
                        <Button type="primary" onClick={handleSubscribe}>Подписаться</Button>
                    )}
                </div>
            )}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-5xl font-semibold text-purple-700">{userProfile.username}</h1>
                    <p className="text-lg text-gray-600 mt-4">{userProfile.selfSummary}</p>
                </div>
                {userImages.length > 0 && (
                    <img
                        src={userImages[userImages.length - 1].url}
                        alt="Profile Avatar"
                        className="w-60 h-60 rounded-full object-cover border-4 border-purple-500 hover:scale-[1.01]"
                    />
                )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-10">
                <div className="bg-white p-4 rounded-lg shadow cursor-pointer" onClick={() => setShowSubscribers(true)}>
                    <label className="text-lg font-medium text-gray-600">Подписчики</label>
                    <p className="text-2xl text-purple-700">{subscribers.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow cursor-pointer" onClick={() => setShowSubscriptions(true)}>
                    <label className="text-lg font-medium text-gray-600">Подписки</label>
                    <p className="text-2xl text-purple-700">{subscriptions.length}</p>
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
            <div className="hover:sc">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Отзывы</h2>
                {reviews.length > 0 ? (
                    <div className="bg-gray-100 rounded-xl p-4">
                        <Carousel autoplay speed={200} arrows={true} className="custom-carousel">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} token={token} />
                            ))}
                        </Carousel>
                    </div>
                ) : (
                    <p className="text-lg text-gray-500">Отзывы отсутствуют.</p>
                )}
                {!isOwnProfile && (
                    <Button type="primary" className="mt-4" onClick={() => setShowReviewModal(true)}>
                        Оставить отзыв
                    </Button>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Посты</h2>
                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <PostDetails key={post.id} postId={post.id} currentUserId={currentUserId} token={token} />
                        ))}
                    </div>
                ) : (
                    <p className="text-lg text-gray-500">Постов нет.</p>
                )}
            </div>

            {/* Модальное окно для отзыва */}
            <Modal
                title="Оставить отзыв"
                open={showReviewModal}
                onCancel={() => setShowReviewModal(false)}
                onOk={handleReviewSubmit}
            >
                <p>Оцените пользователя:</p>
                <Rate value={reviewRating} onChange={(value) => setReviewRating(value)} />
                <p className="mt-2">Напишите отзыв:</p>
                <textarea
                    className="w-full p-2 border rounded mt-2"
                    rows="4"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                />
            </Modal>

            {/* Модальные окна для подписчиков и подписок */}
            <Modal
                title="Подписчики"
                open={showSubscribers}
                onCancel={() => setShowSubscribers(false)}
                footer={null}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={subscribers}
                    renderItem={subscriber => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={<span>{subscriber}</span>}
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Подписчиков нет.' }}
                />
            </Modal>

            <Modal
                title="Подписки"
                open={showSubscriptions}
                onCancel={() => setShowSubscriptions(false)}
                footer={null}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={subscriptions}
                    renderItem={subscription => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={<span>{subscription}</span>}
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Нет подписок.' }}
                />
            </Modal>
        </div>
    );
}
