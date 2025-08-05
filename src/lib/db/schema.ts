import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 50 }).notNull().default('student'), // student, instructor, admin
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata').default({}),
});

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  curriculum: jsonb('curriculum').default({}),
  instructorId: uuid('instructor_id').references(() => users.id),
  maxStudents: integer('max_students').default(30),
  currentStudents: integer('current_students').default(0),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  price: integer('price').default(0),
  status: varchar('status', { length: 50 }).default('active'), // active, inactive, completed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Course Registrations table
export const courseRegistrations = pgTable('course_registrations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id),
  courseId: uuid('course_id').references(() => courses.id),
  status: varchar('status', { length: 50 }).default('pending'), // pending, approved, rejected, completed
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'), // pending, paid, refunded
  paymentId: varchar('payment_id', { length: 255 }),
  registeredAt: timestamp('registered_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
});

// Attendance table
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id),
  courseId: uuid('course_id').references(() => courses.id),
  date: timestamp('date').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // present, absent, late
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Assignments table
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid('course_id').references(() => courses.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  maxScore: integer('max_score').default(100),
  fileUrl: varchar('file_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Assignment Submissions table
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: uuid('assignment_id').references(() => assignments.id),
  userId: uuid('user_id').references(() => users.id),
  fileUrl: varchar('file_url', { length: 500 }),
  content: text('content'),
  score: integer('score'),
  feedback: text('feedback'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  gradedAt: timestamp('graded_at'),
});

// Announcements table
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  courseId: uuid('course_id').references(() => courses.id), // null for global announcements
  category: varchar('category', { length: 50 }).default('general'), // general, academic, event, urgent, maintenance
  priority: varchar('priority', { length: 50 }).default('normal'), // low, normal, high, urgent
  isEmailSent: boolean('is_email_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Announcement Reads table (for tracking read status)
export const announcementReads = pgTable('announcement_reads', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  announcementId: uuid('announcement_id').references(() => announcements.id),
  userId: uuid('user_id').references(() => users.id),
  readAt: timestamp('read_at').defaultNow(),
});

// Community Posts table (Q&A, Free Board)
export const communityPosts = pgTable('community_posts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  courseId: uuid('course_id').references(() => courses.id), // null for general posts
  category: varchar('category', { length: 50 }).notNull(), // qna, free, notice
  isAnswered: boolean('is_answered').default(false), // for Q&A posts
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Community Comments table
export const communityComments = pgTable('community_comments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid('post_id').references(() => communityPosts.id),
  authorId: uuid('author_id').references(() => users.id),
  content: text('content').notNull(),
  parentId: uuid('parent_id'), // self-reference for nested comments - will be set up later
  isAnswer: boolean('is_answer').default(false), // for Q&A answers
  likeCount: integer('like_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id', { length: 255 }).unique().notNull(),
  userId: uuid('user_id').references(() => users.id),
  courseId: uuid('course_id').references(() => courses.id),
  amount: integer('amount').notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // tosspayments, iamport
  paymentKey: varchar('payment_key', { length: 255 }),
  method: varchar('method', { length: 50 }), // card, bank, phone, kakaopay, naverpay
  status: varchar('status', { length: 50 }).default('pending'), // pending, paid, failed, cancelled, refunded
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  receiptUrl: varchar('receipt_url', { length: 500 }),
  failReason: text('fail_reason'),
  approvedAt: timestamp('approved_at'),
  cancelledAt: timestamp('cancelled_at'),
  refundedAt: timestamp('refunded_at'),
  refundReason: text('refund_reason'),
  refundAmount: integer('refund_amount'),
  metadata: jsonb('metadata'), // 추가 결제 정보
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// SQL function for UUID generation (imported above)

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type CourseRegistration = typeof courseRegistrations.$inferSelect;
export type NewCourseRegistration = typeof courseRegistrations.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type NewAssignmentSubmission = typeof assignmentSubmissions.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
export type AnnouncementRead = typeof announcementReads.$inferSelect;
export type NewAnnouncementRead = typeof announcementReads.$inferInsert;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type NewCommunityPost = typeof communityPosts.$inferInsert;
export type CommunityComment = typeof communityComments.$inferSelect;
export type NewCommunityComment = typeof communityComments.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert; 