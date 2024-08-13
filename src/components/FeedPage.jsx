import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, message, Tag, Spin, Button, Modal, List } from 'antd';
import { LikeOutlined, UserOutlined, CalendarOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import './PostFeedPage.css';

export function PostFeedPage({ token, currentUserId }) {
    const [posts, setPosts] = useState([]);
    const [recommendedProfiles, setRecommendedProfiles] = useState([]);
    const [events, setEvents] = useState({});
    const [categories, setCategories] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likes, setLikes] = useState([]);
    const [avatars, setAvatars] = useState({});
    const [usernames, setUsernames] = useState({});

    useEffect(() => {
        fetchPosts();
        fetchProfiles();
    }, [token, currentUserId]);

    const fetchPosts = () => {
        axios.get(`http://127.0.0.1:8080/api/posts/recommended/${currentUserId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            setPosts(response.data);
            fetchEvents(response.data);
        }).catch(error => {
            message.error("Ошибка при получении рекомендованных постов!");
        }).finally(() => {
            setLoadingPosts(false);
        });
    };

    const fetchProfiles = () => {
        axios.get(`http://127.0.0.1:8080/api/profiles/recommended/${currentUserId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            setRecommendedProfiles(response.data);
        }).catch(error => {
            message.error("Ошибка при получении рекомендованных профилей!");
        }).finally(() => {
            setLoadingProfiles(false);
        });
    };

    const fetchEvents = (posts) => {
        const uniqueEventIds = [...new Set(posts.map(post => post.eventId))];
        const eventRequests = uniqueEventIds.map(id => axios.get(`http://127.0.0.1:8080/api/events/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }));

        Promise.all(eventRequests).then(responses => {
            const eventsData = {};
            responses.forEach(response => {
                eventsData[response.data.id] = response.data;
            });
            setEvents(eventsData);
            fetchCategories(eventsData);
        }).catch(error => {
            message.error("Ошибка при получении мероприятий!");
        });
    };

    const fetchCategories = (events) => {
        const uniqueCategoryIds = [...new Set(Object.values(events).map(event => event.categoryId))];
        const categoryRequests = uniqueCategoryIds.map(id => axios.get(`http://127.0.0.1:8080/api/categories/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }));

        Promise.all(categoryRequests).then(responses => {
            const categoriesData = {};
            responses.forEach(response => {
                categoriesData[response.data.id] = response.data.name;
            });
            setCategories(categoriesData);
        }).catch(error => {
            message.error("Ошибка при получении категорий!");
        });
    };

    const fetchLikes = async (postId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8080/api/likes/post/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const likesData = response.data;
            setLikes(likesData);

            const profileRequests = likesData.map(like => axios.get(`http://127.0.0.1:8080/api/profiles/${like.profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }));

            const profileResponses = await Promise.all(profileRequests);
            const avatarsData = {};
            const usernamesData = {};
            profileResponses.forEach(profileResponse => {
                avatarsData[profileResponse.data.id] = profileResponse.data.avatarUrl;
                usernamesData[profileResponse.data.id] = profileResponse.data.username;
            });

            setAvatars(avatarsData);
            setUsernames(usernamesData);
            setShowLikesModal(true);
        } catch (error) {
            message.error("Ошибка при получении лайков!");
        }
    };

    const toggleLike = async (post) => {
        try {
            const liked = post.likedByCurrentUser;
            if (liked) {
                await axios.delete(`http://127.0.0.1:8080/api/likes/${post.likeId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                const response = await axios.post('http://127.0.0.1:8080/api/likes', {
                    profileId: currentUserId,
                    postId: post.id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                post.likeId = response.data.id;
            }
            post.likedByCurrentUser = !liked;
            post.amountOfLikes += liked ? -1 : 1;
            setPosts([...posts]);
        } catch (error) {
            message.error("Ошибка при изменении статуса лайка!");
        }
    };

    const renderPost = (post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md p-6 mb-6 transition-transform transform hover:scale-[1.01]">
            <div className="flex items-center mb-4">
                <Avatar size={64} src={post.profileAvatarUrl} icon={<UserOutlined />} />
                <div className="ml-4">
                    <a href={`/profile/${post.profileId}`} className="text-lg font-semibold text-purple-600">{post.profileUsername}</a>
                </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800">{post.summary}</p>
            </div>
            {events[post.eventId] && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <Tag color="blue">{categories[events[post.eventId].categoryId]}</Tag>
                    </div>
                    <div className="flex items-center mb-2">
                        <CalendarOutlined className="mr-2" /> {new Date(events[post.eventId].startAt).toLocaleString()}
                    </div>
                    <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2" /> {events[post.eventId].location}
                    </div>
                    {!events[post.eventId].isCreatedByAdmin && <Tag color="red" className="mt-2">Пользовательское мероприятие</Tag>}
                    {events[post.eventId].isCreatedByAdmin && <Tag color="green" className="mt-2">Подтвержденное модерацией</Tag>}
                </div>
            )}
            <div className="mt-4 flex items-center">
                <Button
                    type="primary"
                    shape="circle"
                    icon={post.likedByCurrentUser ? <HeartFilled /> : <HeartOutlined />}
                    className="text-red-500"
                    onClick={() => toggleLike(post)}
                />
                <Button type="link" onClick={() => fetchLikes(post.id)} >{post.amountOfLikes} Показать всех</Button>
            </div>
        </div>
    );

    const renderProfiles = () => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">Рекомендованные профили</h3>
            {loadingProfiles ? (
                <div className="text-center"><Spin tip="Загрузка профилей..." /></div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {recommendedProfiles.map(profile => (
                        <div key={profile.id} className="text-center transition-transform transform hover:scale-105">
                            <Avatar size={64} src={profile.avatarUrl} icon={<UserOutlined />} className="mx-auto" />
                            <a href={`/profile/${profile.id}`} className="block mt-2 text-sm font-semibold text-purple-600">{profile.username}</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 post-feed-page flex">
            <div className="w-3/4 pr-4">
                <h1 className="text-3xl font-bold text-purple-700 text-center mb-8">Рекомендованные посты</h1>
                {loadingPosts ? (
                    <div className="text-center"><Spin tip="Загрузка постов..." /></div>
                ) : (
                    <div>
                        {posts.map((post, index) => (
                            <React.Fragment key={post.id}>
                                {renderPost(post)}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
            <div className="w-1/4 pl-4">
                {renderProfiles()}
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
        </div>
    );
}

export default PostFeedPage;
