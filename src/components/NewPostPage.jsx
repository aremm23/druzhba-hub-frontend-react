import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Card, Typography, message, Tag, Drawer, List, Spin, Row, Col, Select, DatePicker, TimePicker } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function NewPostPage({ token, currentUserId }) {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [summary, setSummary] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [eventFormVisible, setEventFormVisible] = useState(false);
    const [newEvent, setNewEvent] = useState({ summary: '', categoryId: null, location: '', startAt: null });

    useEffect(() => {
        // Fetch events and categories
        axios.get('http://127.0.0.1:8080/api/events', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            setEvents(response.data);
        }).catch(error => {
            message.error("Ошибка при получении мероприятий!");
        }).finally(() => {
            setLoading(false);
        });

        axios.get('http://127.0.0.1:8080/api/categories', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            setCategories(response.data);
        }).catch(error => {
            message.error("Ошибка при получении категорий!");
        });
    }, [token]);

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

    const handleNewEventSubmit = () => {
        const eventData = {
            ...newEvent,
            isCreatedByAdmin: false
        };

        axios.post('http://127.0.0.1:8080/api/events', eventData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            message.success('Мероприятие успешно создано');
            const newEventResponse = response.data;
            const category = categories.find(cat => cat.id === newEventResponse.categoryId);
            if (category) {
                newEventResponse.categoryName = category.name;
            }
            setEvents([...events, newEventResponse]);
            setNewEvent({ summary: '', categoryId: null, location: '', startAt: null });
            setEventFormVisible(false);
        }).catch(error => {
            message.error('Ошибка при создании мероприятия!');
        });
    };

    return (
        <Card className="max-w-4xl mx-auto p-8 rounded-2xl shadow-lg">
            <Title level={2} className="text-center text-purple-700">Создание нового поста</Title>
            <Form layout="vertical" onFinish={handleFormSubmit}>
                <Form.Item label="Мероприятие" required>
                    <Button type="dashed" onClick={() => setDrawerVisible(true)} className="w-full">
                        {selectedEvent ? selectedEvent.summary : "Выберите мероприятие"}
                    </Button>
                    <Button type="link" onClick={() => setEventFormVisible(true)} className="w-full">
                        Создать свое мероприятие
                    </Button>
                </Form.Item>
                {selectedEvent && (
                    <Card className="mb-4 p-4 bg-gray-50 rounded-xl">
                        <Title level={4}>{selectedEvent.summary}</Title>
                        <p><strong>Категория:</strong> {selectedEvent.categoryName}</p>
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
                                    <p><strong>Категория:</strong> {categories.find(cat => cat.id === event.categoryId)?.name}</p>
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
            <Drawer
                title="Создать мероприятие"
                placement="right"
                onClose={() => setEventFormVisible(false)}
                visible={eventFormVisible}
                width={400}
            >
                <Form layout="vertical" onFinish={handleNewEventSubmit}>
                    <Form.Item label="Название мероприятия" required>
                        <Input
                            value={newEvent.summary}
                            onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                            maxLength={350}
                            placeholder="Введите название мероприятия"
                        />
                    </Form.Item>
                    <Form.Item label="Категория" required>
                        <Select
                            value={newEvent.categoryId}
                            onChange={(value) => setNewEvent({ ...newEvent, categoryId: value })}
                            placeholder="Выберите категорию"
                        >
                            {categories.map(category => (
                                <Option key={category.id} value={category.id}>{category.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Местоположение" required>
                        <Input
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            placeholder="Введите местоположение"
                        />
                    </Form.Item>
                    <Form.Item label="Дата и время начала" required>
                        <Row gutter={8}>
                            <Col span={12}>
                                <DatePicker
                                    style={{ width: '100%' }}
                                    onChange={(date, dateString) => setNewEvent({ ...newEvent, startAt: dateString ? `${dateString}T${newEvent.startAt ? newEvent.startAt.split('T')[1] : '00:00:00'}` : null })}
                                />
                            </Col>
                            <Col span={12}>
                                <TimePicker
                                    style={{ width: '100%' }}
                                    onChange={(time, timeString) => setNewEvent({ ...newEvent, startAt: newEvent.startAt ? `${newEvent.startAt.split('T')[0]}T${timeString}` : null })}
                                />
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full">Создать мероприятие</Button>
                    </Form.Item>
                </Form>
            </Drawer>
        </Card>
    );
}

export default NewPostPage;
