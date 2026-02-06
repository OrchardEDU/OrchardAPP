# OrchardAPP

**OrchardAPP** is an intelligent educational platform that transforms teaching materials into interactive quizzes and assessments using AI-powered question generation. Designed for educators and students, it streamlines the entire workflow from content creation to instant grading.

## Overview

OrchardAPP leverages advanced AI technology to help teachers create high-quality educational assessments with minimal effort. By uploading course materials (lecture slides, PDFs, documents), teachers can automatically generate relevant quiz questions that align with their curriculum. Students can then take these quizzes online and receive immediate feedback, while teachers gain valuable insights into class performance.

## Key Features

### For Teachers

#### Course Management
- **Create and manage courses** with unique join codes for easy student enrollment
- **Student enrollment system** that allows students to join courses using join codes
- **Course materials library** for organizing and storing educational content
- **Student roster management** with the ability to view enrolled students and remove them when needed

#### AI-Powered Quiz Creation
- **Intelligent question generation** using AI models (Ollama or Google Gemini) to create multiple-choice questions from course topics
- **RAG-enhanced generation** that uses uploaded course materials as context for more relevant and accurate questions
- **Manual question creation** with a flexible interface for custom questions
- **Content embedding system** that processes and stores course materials (PDF, DOCX, TXT, MD) in a vector database for context-aware question generation
- **Material management** with the ability to upload, view, and delete embedded course materials

#### Quiz Management
- **Flexible quiz builder** supporting multiple questions with customizable point values
- **Publish/unpublish controls** to control when quizzes are available to students
- **Due date management** for time-bound assessments
- **Submission tracking** to view all student submissions for a quiz
- **Performance analytics** through detailed submission data

### For Students

#### Course Access
- **Join courses** using unique join codes provided by teachers
- **View enrolled courses** with easy navigation to course content
- **Access course quizzes** that are published and available

#### Quiz Taking
- **Interactive quiz interface** for taking assessments online
- **Real-time answer tracking** with the ability to review and change answers before submission
- **Instant feedback** upon quiz submission
- **Submission history** to view past quiz attempts and results

### Technical Features

#### AI Integration
- **Dual AI provider support** - Works with local Ollama instances or Google Gemini API
- **Embedding generation** using Ollama for semantic search and context retrieval
- **Structured output** for consistent question generation
- **RAG (Retrieval-Augmented Generation)** system that uses Qdrant vector database for intelligent context retrieval

#### Security & Authentication
- **Role-based access control** (Teacher/Student roles)
- **Session management** with PostgreSQL-backed sessions
- **Input sanitization** and validation throughout the application
- **Course ownership validation** ensuring teachers can only manage their own courses

#### Demo Mode
- **Standalone demo interface** for showcasing AI capabilities
- **File upload and processing** for demonstration purposes
- **Question generation demo** with RAG context retrieval
- **Password-protected demo access** for controlled access

## Benefits

### For Educators
- **Time Savings**: Reduce hours spent creating quiz questions manually
- **Consistency**: Generate questions that align with your course materials automatically
- **Flexibility**: Combine AI-generated and manually created questions
- **Efficiency**: Manage courses, students, and assessments from a single platform
- **Insights**: Track student performance and identify areas needing attention

### For Students
- **Convenience**: Take quizzes online from anywhere
- **Immediate Feedback**: Know your results instantly after submission
- **Practice Opportunities**: Access to multiple quizzes for learning reinforcement
- **Clear Organization**: Easy access to all course materials and assessments

### For Institutions
- **Scalability**: Handle multiple courses and students efficiently
- **Modern Technology**: Leverage cutting-edge AI for educational enhancement
- **Data-Driven**: Collect valuable analytics on student performance
- **Cost-Effective**: Reduce manual grading time and administrative overhead

## Technology Stack

### Backend
- **Node.js** with Express.js for the API server
- **PostgreSQL** for relational data storage
- **Qdrant** vector database for semantic search and RAG
- **Ollama** for local AI model hosting and embeddings
- **Google Gemini API** as an alternative AI provider
- **express-session** with PostgreSQL session store
- **Multer** for file upload handling
- **pdf-parse** and **mammoth** for document text extraction

### Frontend
- **Next.js** with React for the web application
- **TypeScript** for type-safe development
- **CSS Modules** for component styling
- **Client-side API utilities** for clean backend communication

## Potential Upcoming Features

### Enhanced AI Capabilities
- **Multiple question types** beyond multiple-choice (true/false, short answer, essay)
- **Adaptive difficulty** based on student performance
- **Question quality scoring** to suggest improvements
- **Multi-language support** for international courses

### Advanced Assessment Features
- **Question banks** for reusable question collections
- **Randomized question order** to prevent cheating
- **Time limits** with automatic submission
- **Question explanations** generated by AI
- **Practice mode** with unlimited attempts

### Analytics & Reporting
- **Detailed performance dashboards** for teachers
- **Class-wide analytics** showing question difficulty and common mistakes
- **Individual student progress tracking**
- **Export capabilities** for grades and reports
- **Comparative analytics** across different quiz attempts

### Collaboration Features
- **Question sharing** between teachers
- **Collaborative quiz creation** with multiple teachers
- **Peer review system** for question quality
- **Discussion forums** for course-related questions

### Integration & Export
- **LMS integration** (Canvas, Blackboard, Moodle)
- **Grade book export** in standard formats
- **Bulk import** of students and courses
- **API access** for third-party integrations

### User Experience Enhancements
- **Mobile app** for on-the-go access
- **Offline quiz taking** with sync when online
- **Dark mode** and theme customization
- **Accessibility improvements** (screen reader support, keyboard navigation)
- **Multi-factor authentication** for enhanced security

## Architecture Highlights

- **Modular design** with clear separation between routes, queries, and utilities
- **Lazy initialization** of AI services for efficient resource management
- **Error handling** with comprehensive error middleware
- **Input validation** using express-validator throughout
- **Type safety** with TypeScript on the frontend
- **Scalable database schema** with proper indexing and relationships

## Project Structure

```
OrchardAPP/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/    # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── lib/    # API clients and utilities
│   │   └── types/  # TypeScript type definitions
│   └── public/     # Static assets
│
├── server/          # Express.js backend
│   ├── routes/     # API route handlers
│   ├── db/         # Database queries and schema
│   ├── middleware/ # Express middleware
│   ├── utils/      # Utility functions
│   └── uploads/    # Uploaded file storage
│
└── README.md        # This file
```

---

**OrchardAPP** - Transforming education through intelligent automation.
