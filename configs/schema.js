import { pgTable,serial,varchar,json,integer,boolean , text} from "drizzle-orm/pg-core";

export const CourseList = pgTable("courseList", {
    id: serial("id").primaryKey(),
    courseId:varchar("courseId").notNull(),
    name:varchar("name").notNull(),

    catagory: varchar("catagory").notNull(),
    level:varchar("level").notNull(),
    includeVideo:varchar("includeVideo").notNull().default("Yes"),
    courseOutput:json("courseOutput").notNull(),
    createdBy:varchar("createdBy").notNull(),
    userName:varchar("userName"),
    userProfileImage:varchar("userProfileImage"),
    isPublished: boolean('is_published').default(false),
thumbnail: text('thumbnail')
    
    })



    export const Chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  chapterId: integer("chapterId").notNull(),
  content: json("content").notNull(),
  videoId: varchar("video_Id").notNull()
})