// ReviewCard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Rate, Avatar } from 'antd';

const ReviewCard = ({ review, token }) => {
    const [reviewer, setReviewer] = useState(null);
    const [reviewerAvatar, setReviewerAvatar] = useState('');

    useEffect(() => {
        const fetchReviewerDetails = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/profiles/${review.profileFromId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setReviewer(response.data);

                const avatarResponse = await axios.get(`http://127.0.0.1:8080/images/profile/${review.profileFromId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (avatarResponse.data.length > 0) {
                    setReviewerAvatar(avatarResponse.data[0].url);
                }
            } catch (error) {
                console.error('Не удалось получить данные пользователя, оставившего отзыв:', error);
            }
        };

        fetchReviewerDetails();
    }, [review.profileFromId, token]);

    return (
        <Card className="mb-4">
            <div className="flex items-center mb-2">
                <Avatar src={reviewerAvatar} />
                <h3 className="text-xl font-medium text-gray-700 ml-2">{reviewer ? reviewer.username : 'Loading...'}</h3>
            </div>
            <p>{review.comment}</p>
            <div className="flex items-center">
                <Rate disabled defaultValue={review.grade} />
                <span className="ml-2 text-gray-600">({review.grade})</span>
            </div>
        </Card>
    );
};

export default ReviewCard;
