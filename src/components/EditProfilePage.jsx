import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Upload, message, Typography, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export function EditProfilePage({ token, currentUserId }) {
    const [profile, setProfile] = useState({
        username: '',
        selfSummary: '',
        rate: 0.0,
        subscribers: 0,
        subscribedTo: 0,
        posts: [],
        reviewsFromThis: [],
        reviewsOnThis: []
    });

    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        axios.get(`http://127.0.0.1:8080/api/profiles/${currentUserId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            setProfile(response.data);
        }).catch(error => {
            message.error("Ошибка при получении данных профиля!");
        });
    }, [currentUserId, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleFormSubmit = () => {
        axios.put(`http://127.0.0.1:8080/api/profiles/${currentUserId}/username`, {
            username: profile.username
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            message.success('Имя пользователя успешно обновлено');
        }).catch(error => {
            message.error('Ошибка при обновлении имени пользователя!');
        });

        axios.put(`http://127.0.0.1:8080/api/profiles/${currentUserId}/summary`, {
            selfSummary: profile.selfSummary
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            message.success('Описание профиля успешно обновлено');
        }).catch(error => {
            message.error('Ошибка при обновлении описания профиля!');
        });
    };

    const handleImageChange = (info) => {
        const file = info.file.originFileObj;
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = () => {
        const formData = new FormData();
        formData.append('file', profileImage);

        axios.post(`http://127.0.0.1:8080/images/profile/${currentUserId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            message.success('Изображение профиля успешно загружено');
        }).catch(error => {
            message.error('Ошибка при загрузке изображения профиля!');
        });
    };

    return (
        <Card className="max-w-4xl mx-auto p-8 rounded-2xl shadow-lg">
            <Title level={2} className="text-center text-purple-700">Редактирование профиля</Title>
            <Form layout="vertical" onFinish={handleFormSubmit}>
                <Form.Item label="Имя пользователя">
                    <Input
                        name="username"
                        value={profile.username}
                        onChange={handleInputChange}
                    />
                </Form.Item>
                <Form.Item label="О себе">
                    <TextArea
                        name="selfSummary"
                        value={profile.selfSummary}
                        onChange={handleInputChange}
                        rows={4}
                    />
                </Form.Item>
                <Form.Item label="Изображение профиля">
                    <Upload
                        listType="picture"
                        maxCount={1}
                        beforeUpload={() => false}
                        onChange={handleImageChange}
                        className="w-full"
                    >
                        <Button icon={<UploadOutlined />}>Выберите изображение</Button>
                    </Upload>
                    {imagePreview && (
                        <img src={imagePreview} alt="Profile Preview" className="mt-4 w-32 h-32 rounded-full" />
                    )}
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        onClick={handleImageUpload}
                        className="w-full mb-4"
                    >
                        Загрузить изображение
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full"
                    >
                        Сохранить изменения
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default EditProfilePage;
