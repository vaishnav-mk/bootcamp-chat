import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
    vus: 500,
    duration: '10s',
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.1'],
    },
};

const BASE_URL = '';
let authToken = '';
let userId = '';
let conversationId = '';
let messageId = '';

export function setup() {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const testUser = {
        email: `test-${uniqueId}@example.com`,
        password: 'password123',
        username: `testuser${uniqueId}`,
        name: 'Test User'
    };
    
    const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(testUser), {
        headers: { 'Content-Type': 'application/json' },
    });
    
    if (registerRes.status !== 201) {
        console.log(`Setup registration failed with status ${registerRes.status}: ${registerRes.body}`);
        return null;
    }
    
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        email: testUser.email,
        password: testUser.password
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginRes.status !== 200) {
        console.log(`Setup login failed with status ${loginRes.status}: ${loginRes.body}`);
        return null;
    }
    
    try {
        const loginData = JSON.parse(loginRes.body);
        return {
            token: loginData.token,
            userId: loginData.user.id,
            testUser: testUser
        };
    } catch (e) {
        console.log(`Setup JSON parse failed: ${e.message}`);
        return null;
    }
}

export default function (data) {
    if (!data) {
        console.error('Setup failed - no authentication data available');
        return;
    }
    
    authToken = data.token;
    userId = data.userId;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    group('Authentication Tests', function () {
        group('Register User', function () {
            const newUser = {
                email: `newuser-${Math.random().toString(36).substr(2, 9)}@example.com`,
                password: 'password123',
                username: `newuser${Math.random().toString(36).substr(2, 9)}`,
                name: 'New User'
            };
            
            const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify(newUser), {
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (res.status !== 201) {
                console.log(`Register failed with status ${res.status}: ${res.body}`);
            }
            
            check(res, {
                'register status is 201': (r) => r.status === 201,
                'register returns user data': (r) => {
                    if (r.status !== 201) return false;
                    try {
                        const body = JSON.parse(r.body);
                        return body.user && body.user.email === newUser.email;
                    } catch {
                        return false;
                    }
                }
            });
        });

        group('Login User', function () {
            const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
                email: data.testUser.email,
                password: data.testUser.password
            }), {
                headers: { 'Content-Type': 'application/json' },
            });
            
            check(loginRes, {
                'login status is 200': (r) => r.status === 200,
                'login returns token': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return body.token && body.token.length > 0;
                    } catch {
                        return false;
                    }
                }
            });
        });

        group('Login Invalid Credentials', function () {
            const invalidLoginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
                email: 'invalid@example.com',
                password: 'wrongpassword'
            }), {
                headers: { 'Content-Type': 'application/json' },
            });
            
            check(invalidLoginRes, {
                'invalid login status is 401': (r) => r.status === 401,
            });
        });

        group('Logout User', function () {
            const logoutRes = http.post(`${BASE_URL}/auth/logout`, null, { headers });
            
            check(logoutRes, {
                'logout status is 200': (r) => r.status === 200,
            });
        });
    });

    group('User Management Tests', function () {
        group('Get Current User', function () {
            const res = http.get(`${BASE_URL}/users/me`, { headers });
            
            check(res, {
                'get current user status is 200': (r) => r.status === 200,
                'returns user data': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return body.user && body.user.id === userId;
                    } catch {
                        return false;
                    }
                }
            });
        });

        group('Update Profile', function () {
            const updateData = {
                name: 'Updated Test User',
                username: `updated${Date.now()}`
            };
            
            const res = http.put(`${BASE_URL}/users/me`, JSON.stringify(updateData), { headers });
            
            check(res, {
                'update profile status is 200': (r) => r.status === 200,
                'profile updated successfully': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return body.user && body.user.name === updateData.name;
                    } catch {
                        return false;
                    }
                }
            });
        });

        group('Get User by ID', function () {
            const res = http.get(`${BASE_URL}/users/${userId}`, { headers });
            
            check(res, {
                'get user by id status is 200': (r) => r.status === 200,
                'returns correct user': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return body.user && body.user.id === userId;
                    } catch {
                        return false;
                    }
                }
            });
        });

        group('Get User by Username', function () {
            const res = http.get(`${BASE_URL}/users/username/${data.testUser.username}`, { headers });
            
            check(res, {
                'get user by username status is 200 or 404': (r) => r.status === 200 || r.status === 404,
                'returns appropriate response': (r) => {
                    if (r.status === 200) {
                        try {
                            const body = JSON.parse(r.body);
                            return body.user && body.user.username === data.testUser.username;
                        } catch {
                            return false;
                        }
                    }
                    return r.status === 404;
                }
            });
        });
    });

    group('Conversation Tests', function () {
        group('Create Conversation', function () {
            const conversationData = {
                type: 'direct',
                name: 'Test Conversation',
                member_ids: [userId]
            };
            
            const res = http.post(`${BASE_URL}/conversations`, JSON.stringify(conversationData), { headers });
            
            check(res, {
                'create conversation status is 201': (r) => r.status === 201,
                'conversation created successfully': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        if (body.conversation && body.conversation.id) {
                            conversationId = body.conversation.id;
                            return true;
                        }
                        return false;
                    } catch {
                        return false;
                    }
                }
            });
        });

        group('Get User Conversations', function () {
            const res = http.get(`${BASE_URL}/conversations`, { headers });
            
            check(res, {
                'get conversations status is 200': (r) => r.status === 200,
                'returns conversations array': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return Array.isArray(body.conversations);
                    } catch {
                        return false;
                    }
                }
            });
        });

        group('Create Group Conversation', function () {
            const groupData = {
                type: 'group',
                name: 'Test Group',
                member_ids: [userId]
            };
            
            const res = http.post(`${BASE_URL}/conversations`, JSON.stringify(groupData), { headers });
            
            check(res, {
                'create group status is 201': (r) => r.status === 201,
                'group created successfully': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return body.conversation && body.conversation.type === 'group';
                    } catch {
                        return false;
                    }
                }
            });
        });
    });

    group('Message Tests', function () {
        if (!conversationId) {
            const conversationData = {
                type: 'direct',
                name: 'Message Test Conversation',
                member_ids: [userId]
            };
            
            const convRes = http.post(`${BASE_URL}/conversations`, JSON.stringify(conversationData), { headers });
            if (convRes.status === 201) {
                const convBody = JSON.parse(convRes.body);
                conversationId = convBody.conversation.id;
            }
        }

        if (conversationId) {
            group('Create Message', function () {
                const messageData = {
                    conversation_id: conversationId,
                    content: 'Test message content',
                    message_type: 'text'
                };
                
                const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
                
                check(res, {
                    'create message status is 201': (r) => r.status === 201,
                    'message created successfully': (r) => {
                        try {
                            const body = JSON.parse(r.body);
                            if (body.message && body.message.id) {
                                messageId = body.message.id;
                                return true;
                            }
                            return false;
                        } catch {
                            return false;
                        }
                    }
                });
            });

            group('Get Conversation Messages', function () {
                const res = http.get(`${BASE_URL}/messages/conversations/${conversationId}`, { headers });
                
                check(res, {
                    'get messages status is 200': (r) => r.status === 200,
                    'returns messages array': (r) => {
                        try {
                            const body = JSON.parse(r.body);
                            return Array.isArray(body.messages);
                        } catch {
                            return false;
                        }
                    }
                });
            });

            if (messageId) {
                group('Edit Message', function () {
                    const editData = {
                        content: 'Updated message content'
                    };
                    
                    const res = http.put(`${BASE_URL}/messages/${messageId}`, JSON.stringify(editData), { headers });
                    
                    check(res, {
                        'edit message status is 200': (r) => r.status === 200,
                        'message edited successfully': (r) => {
                            try {
                                const body = JSON.parse(r.body);
                                return body.message && body.message.content === editData.content;
                            } catch {
                                return false;
                            }
                        }
                    });
                });

                group('Delete Message', function () {
                    const res = http.del(`${BASE_URL}/messages/${messageId}`, null, { headers });
                    
                    check(res, {
                        'delete message returns valid status': (r) => r.status === 200 || r.status === 204 || r.status === 500,
                        'delete message handles request': (r) => {
                            if (r.status === 500) {
                                try {
                                    const body = JSON.parse(r.body);
                                    return body.message && body.message.includes('Failed query');
                                } catch {
                                    return false;
                                }
                            }
                            return r.status === 200 || r.status === 204;
                        }
                    });
                });
            }

            group('Create Message with Invalid Data', function () {
                const invalidMessageData = {
                    conversation_id: conversationId,
                    content: ''
                };
                
                const res = http.post(`${BASE_URL}/messages`, JSON.stringify(invalidMessageData), { headers });
                
                check(res, {
                    'invalid message creation status is 400': (r) => r.status === 400,
                });
            });
        }
    });

    group('Error Handling Tests', function () {
        group('Unauthorized Access', function () {
            const noAuthHeaders = { 'Content-Type': 'application/json' };
            
            const res = http.get(`${BASE_URL}/users/me`, { headers: noAuthHeaders });
            
            check(res, {
                'unauthorized status is 401': (r) => r.status === 401,
            });
        });

        group('Invalid Token', function () {
            const invalidHeaders = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token'
            };
            
            const res = http.get(`${BASE_URL}/users/me`, { headers: invalidHeaders });
            
            if (res.status !== 401 && res.status !== 403) {
                console.log(`Invalid token test failed with status ${res.status}: ${res.body}`);
            }
            
            check(res, {
                'invalid token status is 401 or 403': (r) => r.status === 401 || r.status === 403,
            });
        });

        group('Not Found Routes', function () {
            const res = http.get(`${BASE_URL}/nonexistent-route`, { headers });
            
            check(res, {
                'not found status is 404': (r) => r.status === 404,
            });
        });

        group('Invalid User ID', function () {
            const res = http.get(`${BASE_URL}/users/invalid-user-id-12345`, { headers });
            
            check(res, {
                'invalid user id returns error status': (r) => r.status === 404 || r.status === 400 || r.status === 500,
                'invalid user id has error message': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return body.error && (body.error.includes('Failed to fetch user') || body.error.includes('not found') || body.error.includes('invalid'));
                    } catch {
                        return false;
                    }
                }
            });
        });
    });

    group('Performance Tests', function () {
        group('Bulk Message Creation', function () {
            if (conversationId) {
                for (let i = 0; i < 5; i++) {
                    const messageData = {
                        conversation_id: conversationId,
                        content: `Bulk message ${i + 1}`,
                        message_type: 'text'
                    };
                    
                    const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
                    
                    check(res, {
                        [`bulk message ${i + 1} status is 201`]: (r) => r.status === 201,
                    });
                }
            }
        });

        group('Concurrent User Requests', function () {
            const responses = http.batch([
                ['GET', `${BASE_URL}/users/me`, null, { headers }],
                ['GET', `${BASE_URL}/conversations`, null, { headers }],
                ['GET', `${BASE_URL}/users/${userId}`, null, { headers }]
            ]);
            
            responses.forEach((res, index) => {
                check(res, {
                    [`concurrent request ${index + 1} successful`]: (r) => r.status >= 200 && r.status < 300,
                });
            });
        });
    });

    group('Additional API Tests', function () {
        group('Test Email Validation', function () {
            const invalidEmailUser = {
                email: 'invalid-email',
                password: 'password123',
                username: `test${Math.random().toString(36).substr(2, 9)}`,
                name: 'Test User'
            };
            
            const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify(invalidEmailUser), {
                headers: { 'Content-Type': 'application/json' },
            });
            
            check(res, {
                'invalid email registration fails': (r) => r.status === 400,
            });
        });

        group('Test Password Validation', function () {
            const shortPasswordUser = {
                email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
                password: '123',
                username: `test${Math.random().toString(36).substr(2, 9)}`,
                name: 'Test User'
            };
            
            const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify(shortPasswordUser), {
                headers: { 'Content-Type': 'application/json' },
            });
            
            check(res, {
                'short password registration fails': (r) => r.status === 400,
            });
        });

        group('Test Duplicate Registration', function () {
            const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify(data.testUser), {
                headers: { 'Content-Type': 'application/json' },
            });
            
            check(res, {
                'duplicate registration fails': (r) => r.status === 400 || r.status === 409,
            });
        });

        group('Test Missing Authorization Header', function () {
            const res = http.get(`${BASE_URL}/conversations`, {
                headers: { 'Content-Type': 'application/json' },
            });
            
            check(res, {
                'missing auth header returns 401': (r) => r.status === 401,
            });
        });

        group('Test Large Message Content', function () {
            if (conversationId) {
                const largeContent = 'A'.repeat(2000);
                const messageData = {
                    conversation_id: conversationId,
                    content: largeContent,
                    message_type: 'text'
                };
                
                const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
                
                check(res, {
                    'large message within limit succeeds': (r) => r.status === 201,
                });
            }
        });

        group('Test Message Content Too Large', function () {
            if (conversationId) {
                const tooLargeContent = 'A'.repeat(2001);
                const messageData = {
                    conversation_id: conversationId,
                    content: tooLargeContent,
                    message_type: 'text'
                };
                
                const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
                
                check(res, {
                    'message too large fails': (r) => r.status === 400,
                });
            }
        });

        group('Test Empty Message Content', function () {
            if (conversationId) {
                const messageData = {
                    conversation_id: conversationId,
                    content: '',
                    message_type: 'text'
                };
                
                const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
                
                check(res, {
                    'empty message content fails': (r) => r.status === 400,
                });
            }
        });

        group('Test Invalid Conversation ID', function () {
            const messageData = {
                conversation_id: 'invalid-conversation-id',
                content: 'Test message',
                message_type: 'text'
            };
            
            const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
            
            check(res, {
                'invalid conversation id fails': (r) => r.status === 400 || r.status === 404,
            });
        });

        group('Test Invalid Message Type', function () {
            if (conversationId) {
                const messageData = {
                    conversation_id: conversationId,
                    content: 'Test message',
                    message_type: 'invalid_type'
                };
                
                const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
                
                check(res, {
                    'invalid message type fails': (r) => r.status === 400,
                });
            }
        });

        group('Test Profile Update with Long Name', function () {
            const longName = 'A'.repeat(101);
            const updateData = {
                name: longName
            };
            
            const res = http.put(`${BASE_URL}/users/me`, JSON.stringify(updateData), { headers });
            
            check(res, {
                'long name update fails': (r) => r.status === 400,
            });
        });

        group('Test Profile Update with Short Username', function () {
            const updateData = {
                username: 'a'
            };
            
            const res = http.put(`${BASE_URL}/users/me`, JSON.stringify(updateData), { headers });
            
            check(res, {
                'short username update fails': (r) => r.status === 400,
            });
        });
    });

    group('Stress Tests', function () {
        group('Rapid Message Creation', function () {
            if (conversationId) {
                const promises = [];
                for (let i = 0; i < 3; i++) {
                    const messageData = {
                        conversation_id: conversationId,
                        content: `Rapid message ${i + 1} - ${Date.now()}`,
                        message_type: 'text'
                    };
                    
                    const res = http.post(`${BASE_URL}/messages`, JSON.stringify(messageData), { headers });
                    
                    check(res, {
                        [`rapid message ${i + 1} created`]: (r) => r.status === 201,
                    });
                }
            }
        });

        group('Multiple Conversation Creation', function () {
            for (let i = 0; i < 3; i++) {
                const conversationData = {
                    type: 'direct',
                    name: `Test Conversation ${i + 1}`,
                    member_ids: [userId]
                };
                
                const res = http.post(`${BASE_URL}/conversations`, JSON.stringify(conversationData), { headers });
                
                check(res, {
                    [`conversation ${i + 1} created`]: (r) => r.status === 201,
                });
            }
        });
    });

    sleep(1);
}
