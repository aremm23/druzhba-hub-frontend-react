import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

export default function PostDetails({ postId, token }) {
    const [postDetails, setPostDetails] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [categoryDetails, setCategoryDetails] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const postResponse = await axios.get(`http://127.0.0.1:8080/api/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPostDetails(postResponse.data);

                const eventResponse = await axios.get(`http://127.0.0.1:8080/api/events/${postResponse.data.eventId}`, {
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
            } catch (error) {
                setError('Не удалось получить данные поста.');
                console.error(error);
            }
        };

        fetchPostDetails();
    }, [postId, token]);

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
                <Button type="primary" shape="circle" icon={<HeartOutlined />} className="text-red-500" />
                <span className="text-gray-600 ml-2">{postDetails.amountOfLikes}</span>
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
        </Card>
    );
}
