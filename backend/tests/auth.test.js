import request from 'supertest';
import app from '../server.js'; // Assuming we export app
import mongoose from 'mongoose';
import User from '../modules/users/User.js';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/authra_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register/user')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('success');
  });

  it('should prevent registration with weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register/user')
      .send({
        email: 'weak@example.com',
        password: 'password',
        firstName: 'Weak',
        lastName: 'User'
      });

    expect(res.statusCode).toEqual(400);
  });
});
