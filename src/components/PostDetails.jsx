import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Modal, List, Avatar } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

export default function PostDetails({ postId, currentUserId, token }) {
    const [postDetails, setPostDetails] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [categoryDetails, setCategoryDetails] = useState(null);
    const [likes, setLikes] = useState([]);
    const [avatars, setAvatars] = useState({});
    const [usernames, setUsernames] = useState({});
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPostDetails(response.data);

                const eventResponse = await axios.get(`http://127.0.0.1:8080/api/events/${response.data.eventId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setEventDetails(eventResponse.data);

                const categoryResponse = await axios.get(`http://127.0.0.1:8080/api/categories/${eventResponse.data.categoryId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCategoryDetails(categoryResponse.data);

                const likesResponse = await axios.get(`http://127.0.0.1:8080/api/likes/post/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setLikes(likesResponse.data);

                // Fetch avatars and usernames for all likes
                const avatarPromises = likesResponse.data.map(like =>
                    axios.get(`http://127.0.0.1:8080/images/profile/${like.profileId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                );

                const usernamePromises = likesResponse.data.map(like =>
                    axios.get(`http://127.0.0.1:8080/api/profiles/${like.profileId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                );

                const avatarResponses = await Promise.all(avatarPromises);
                const usernameResponses = await Promise.all(usernamePromises);

                const avatarUrls = avatarResponses.reduce((acc, response, index) => {
                    const profileId = likesResponse.data[index].profileId;
                    if (response.data.length > 0) {
                        acc[profileId] = response.data[response.data.length - 1].url;
                    } else {
                        acc[profileId] = "https://t4.ftcdn.net/jpg/03/59/58/91/360_F_359589186_JDLl8dIWoBNf1iqEkHxhUeeOulx0wOC5.jpg";
                    }
                    return acc;
                }, {});

                const usernamesMap = usernameResponses.reduce((acc, response, index) => {
                    const profileId = likesResponse.data[index].profileId;
                    acc[profileId] = response.data.username;
                    return acc;
                }, {});

                setAvatars(avatarUrls);
                setUsernames(usernamesMap);
            } catch (error) {
                setError('Не удалось получить данные поста.');
                console.error(error);
            }
        };

        fetchPostDetails();
    }, [postId, token]);

    const handleLike = async () => {
        try {
            const userLike = likes.find(like => like.profileId === currentUserId);
            if (userLike) {
                // Удаление лайка
                await axios.delete(`http://127.0.0.1:8080/api/likes/${userLike.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                // Добавление лайка
                await axios.post('http://127.0.0.1:8080/api/likes', {
                    profileId: currentUserId,
                    postId
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            // Обновление списка лайков
            const likesResponse = await axios.get(`http://127.0.0.1:8080/api/likes/post/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLikes(likesResponse.data);

            // Fetch avatars and usernames for new likes
            const avatarPromises = likesResponse.data.map(like =>
                axios.get(`http://127.0.0.1:8080/images/profile/${like.profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            );

            const usernamePromises = likesResponse.data.map(like =>
                axios.get(`http://127.0.0.1:8080/api/profiles/${like.profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            );

            const avatarResponses = await Promise.all(avatarPromises);
            const usernameResponses = await Promise.all(usernamePromises);

            const avatarUrls = avatarResponses.reduce((acc, response, index) => {
                const profileId = likesResponse.data[index].profileId;
                if (response.data.length > 0) {
                    acc[profileId] = response.data[response.data.length - 1].url;
                } else {
                    acc[profileId] = "https://t4.ftcdn.net/jpg/03/59/58/91/360_F_359589186_JDLl8dIWoBNf1iqEkHxhUeeOulx0wOC5.jpg";
                }
                return acc;
            }, {});

            const usernamesMap = usernameResponses.reduce((acc, response, index) => {
                const profileId = likesResponse.data[index].profileId;
                acc[profileId] = response.data.username;
                return acc;
            }, {});

            setAvatars(avatarUrls);
            setUsernames(usernamesMap);
        } catch (error) {
            setError('Не удалось поставить или удалить лайк.');
            console.error(error);
        }
    };

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
    }

    if (!postDetails || !eventDetails || !categoryDetails) {
        return <div>Загрузка...</div>;
    }

    return (
        <Card className="mb-6" hoverable>
            <div className="post-summary mb-4">
                <h4 className="text-lg font-medium text-gray-700">{postDetails.summary}</h4>
                <Button
                    type="primary"
                    shape="circle"
                    icon={likes.some(like => like.profileId === currentUserId) ? <HeartFilled /> : <HeartOutlined />}
                    className="text-red-500"
                    onClick={handleLike}
                />
                <span className="text-gray-600 ml-2">{likes.length}</span>
                <Button type="link" onClick={() => setShowLikesModal(true)}>
                    Показать всех
                </Button>
            </div>
            <div className="event-details p-4 rounded-lg bg-gray-100">
                <h3 className="text-xl font-semibold text-gray-700">Мероприятие: {eventDetails.summary}</h3>
                <p className="text-gray-600">Место: {eventDetails.location}</p>
                <p className="text-gray-600">Дата и время: {new Date(eventDetails.startAt).toLocaleString()}</p>
                <div className="mt-2 flex items-center">
                    <i className="fas fa-calendar-alt text-purple-700 mr-2"></i>
                    <span className="category-badge bg-purple-200 text-purple-700 px-2 py-1 rounded">{categoryDetails.name}</span>
                </div>
            </div>
            <Modal
                title="Пользователи, лайкнувшие пост"
                open={showLikesModal}
                onCancel={() => setShowLikesModal(false)}
                footer={null}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={likes}
                    renderItem={like => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={avatars[like.profileId]} />}
                                title={usernames[like.profileId]} // Use the fetched username
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Лайков нет.' }}
                />
            </Modal>
        </Card>
    );
}
