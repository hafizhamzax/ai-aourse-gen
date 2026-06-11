import { pgTable, serial, varchar, json, integer, boolean, text } from "drizzle-orm/pg-core";

export const CourseList = pgTable("courseList", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  name: varchar("name").notNull(),

  catagory: varchar("catagory").notNull(),
  level: varchar("level").notNull(),
  includeVideo: varchar("includeVideo").notNull().default("Yes"),
  courseOutput: json("courseOutput").notNull(),
  createdBy: varchar("createdBy").notNull(),
  userName: varchar("userName"),
  userProfileImage: varchar("userProfileImage"),
  isPublished: boolean('is_published').default(false),
  thumbnail: text('thumbnail'),
})



export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  imageUrl: varchar("imageUrl"),
  role: varchar("role").notNull().default("user"), // 'admin' or 'user'
})

export const AuthCredentials = pgTable("auth_credentials", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
})


export const Chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  chapterId: integer("chapterId").notNull(),
  content: json("content").notNull(),
  videoId: varchar("video_Id"),
  videoUrl: text("custom_video_url")
})

export const CourseQuiz = pgTable("courseQuiz", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  questions: json("questions").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt"),
})

export const UserQuizAttempt = pgTable("userQuizAttempt", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  userId: varchar("userId").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("totalQuestions").notNull(),
  isPass: boolean("isPass").default(false),
  attemptedAt: varchar("attemptedAt"),
})
