import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Card, Typography, message, Tag, Drawer, List, Spin, Row, Col } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

export function NewPostPage({ token, currentUserId }) {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [summary, setSummary] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);

    useEffect(() => {
        // Fetch events
        axios.get('http://127.0.0.1:8080/api/events', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            setEvents(response.data);
            fetchCategories(response.data);
        }).catch(error => {
            message.error("Ошибка при получении мероприятий!");
        }).finally(() => {
            setLoading(false);
        });
    }, [token]);

    const fetchCategories = (events) => {
        const uniqueCategoryIds = [...new Set(events.map(event => event.categoryId))];
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

    const handleFormSubmit = () => {
        axios.post('http://127.0.0.1:8080/api/posts', {
            profileId: currentUserId,
            eventId: selectedEvent.id,
            summary: summary
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            message.success('Пост успешно создан');
            setSummary('');
            setSelectedEvent(null);
            setDrawerVisible(false);
        }).catch(error => {
            message.error('Ошибка при создании поста!');
        });
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setDrawerVisible(false);
    };

    return (
        <Card className="max-w-4xl mx-auto p-8 rounded-2xl shadow-lg">
            <Title level={2} className="text-center text-purple-700">Создание нового поста</Title>
            <Form layout="vertical" onFinish={handleFormSubmit}>
                <Form.Item label="Мероприятие" required>
                    <Button type="dashed" onClick={() => setDrawerVisible(true)} className="w-full">
                        {selectedEvent ? selectedEvent.summary : "Выберите мероприятие"}
                    </Button>
                </Form.Item>
                {selectedEvent && (
                    <Card className="mb-4 p-4 bg-gray-50 rounded-xl">
                        <Title level={4}>{selectedEvent.summary}</Title>
                        <p><strong>Категория:</strong> {categories[selectedEvent.categoryId]}</p>
                        <p><strong>Местоположение:</strong> {selectedEvent.location}</p>
                        <p><strong>Дата и время:</strong> {new Date(selectedEvent.startAt).toLocaleString()}</p>
                        {selectedEvent.isCreatedByAdmin ? (
                            <Tag color="green">Создано администратором</Tag>
                        ) : (
                            <Tag color="red">Создано пользователем</Tag>
                        )}
                    </Card>
                )}
                <Form.Item label="Описание поста" required>
                    <TextArea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={4}
                        placeholder="Введите описание поста"
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full"
                        disabled={!selectedEvent}
                    >
                        Создать пост
                    </Button>
                </Form.Item>
            </Form>
            <Drawer
                title="Выберите мероприятие"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                width={400}
            >
                {loading ? (
                    <Spin />
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={events}
                        renderItem={event => (
                            <List.Item
                                key={event.id}
                                onClick={() => handleEventSelect(event)}
                                className="cursor-pointer"
                            >
                                <Card className="mb-2">
                                    <Title level={4}>{event.summary}</Title>
                                    <p><strong>Категория:</strong> {categories[event.categoryId]}</p>
                                    <p><strong>Местоположение:</strong> {event.location}</p>
                                    <p><strong>Дата и время:</strong> {new Date(event.startAt).toLocaleString()}</p>
                                    {event.isCreatedByAdmin ? (
                                        <Tag color="green">Создано администратором</Tag>
                                    ) : (
                                        <Tag color="red">Создано пользователем</Tag>
                                    )}
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Drawer>
        </Card>
    );
}

export default NewPostPage;
