import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Departments (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let createdDepartmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    connection = moduleFixture.get(getConnectionToken());
    await app.init();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('POST /api/v1/departments', () => {
    it('should create a new department', () => {
      return request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'Human Resources',
          departmentCode: 'HR-001',
          description: 'HR Department',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('_id');
          expect(response.body.departmentName).toBe('Human Resources');
          expect(response.body.departmentCode).toBe('HR-001');
          expect(response.body.isActive).toBe(true);
          createdDepartmentId = response.body._id;
        });
    });

    it('should fail with duplicate department code', () => {
      return request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'HR Department 2',
          departmentCode: 'HR-001',
          description: 'Duplicate code',
        })
        .expect(409);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'H', // Too short
          departmentCode: '',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/departments', () => {
    it('should get all departments with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/departments')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('total');
          expect(response.body).toHaveProperty('page');
          expect(response.body).toHaveProperty('limit');
          expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    it('should filter departments by search term', () => {
      return request(app.getHttpServer())
        .get('/api/v1/departments?search=Human')
        .expect(200)
        .then((response) => {
          expect(response.body.data.length).toBeGreaterThan(0);
          expect(response.body.data[0].departmentName).toContain('Human');
        });
    });
  });

  describe('GET /api/v1/departments/:id', () => {
    it('should get a department by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/departments/${createdDepartmentId}`)
        .expect(200)
        .then((response) => {
          expect(response.body._id).toBe(createdDepartmentId);
          expect(response.body.departmentName).toBe('Human Resources');
        });
    });

    it('should return 404 for non-existent department', () => {
      return request(app.getHttpServer())
        .get('/api/v1/departments/507f1f77bcf86cd799439011')
        .expect(404);
    });

    it('should return 400 for invalid id format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/departments/invalid-id')
        .expect(400);
    });
  });

  describe('PATCH /api/v1/departments/:id', () => {
    it('should update a department', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/departments/${createdDepartmentId}`)
        .send({
          description: 'Updated HR Department Description',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.description).toBe('Updated HR Department Description');
        });
    });

    it('should fail with duplicate code on update', async () => {
      // Create another department
      const response = await request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'Finance',
          departmentCode: 'FIN-001',
        });

      const financeId = response.body._id;

      // Try to update with existing code
      return request(app.getHttpServer())
        .patch(`/api/v1/departments/${financeId}`)
        .send({
          departmentCode: 'HR-001',
        })
        .expect(409);
    });
  });

  describe('GET /api/v1/departments/hierarchy', () => {
    it('should get department hierarchy', async () => {
      // Create parent and child departments
      const parentResponse = await request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'IT Department',
          departmentCode: 'IT-001',
        });

      await request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'Software Development',
          departmentCode: 'IT-DEV-001',
          parentDepartmentId: parentResponse.body._id,
        });

      return request(app.getHttpServer())
        .get('/api/v1/departments/hierarchy')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          const itDept = response.body.find(d => d.departmentCode === 'IT-001');
          expect(itDept).toBeDefined();
          expect(itDept.children).toBeDefined();
          expect(itDept.children.length).toBeGreaterThan(0);
        });
    });
  });

  describe('DELETE /api/v1/departments/:id', () => {
    it('should soft delete a department', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/departments/${createdDepartmentId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.message).toContain('deleted successfully');
        });
    });

    it('should fail to delete department with sub-departments', async () => {
      // Create parent department
      const parentResponse = await request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'Marketing',
          departmentCode: 'MKT-001',
        });

      // Create child department
      await request(app.getHttpServer())
        .post('/api/v1/departments')
        .send({
          departmentName: 'Digital Marketing',
          departmentCode: 'MKT-DIG-001',
          parentDepartmentId: parentResponse.body._id,
        });

      // Try to delete parent
      return request(app.getHttpServer())
        .delete(`/api/v1/departments/${parentResponse.body._id}`)
        .expect(400);
    });
  });

  describe('POST /api/v1/departments/:id/restore', () => {
    it('should restore a soft-deleted department', async () => {
      // First delete a department
      await request(app.getHttpServer())
        .delete(`/api/v1/departments/${createdDepartmentId}`)
        .expect(200);

      // Then restore it
      return request(app.getHttpServer())
        .post(`/api/v1/departments/${createdDepartmentId}/restore`)
        .expect(201)
        .then((response) => {
          expect(response.body.isActive).toBe(true);
        });
    });
  });
});