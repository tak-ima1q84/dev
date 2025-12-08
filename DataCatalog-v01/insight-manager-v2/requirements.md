# Requirements Document

## 1. System Overview

This system is a Web application for managing content data, display logic, and related images for "Insights (notifications/marketing cards)" displayed on a mobile app.

## 2. User Roles

- **Admin**: System Administrator. Can manage insights, manage dropdown items, and manage users.
- **Manager**: Operations Staff. Can register, edit, delete insights, and download CSVs.
- **Viewer**: Viewer. Can only view insights.

## 3. Functional Requirements

### 3.1. Data Management

**[Ubiquitous]** The system must retain the following items (a1 to f2) as insight data:

- a1. Creation Number (Integer 1-19999)
- b1. Insight Subject
- c1. Insight ID
- d1. Insight Display Status
- e1. Distribution Start Date
- f1. Update Date
- g1. Distribution Stop Date
- h1. Insight Type
- i1. Main Category
- j1. Sub Category
- k1. Data Category
- l1. Financial Data Usage Banks (Multiple selection allowed)
- m1-1. Display Logic
- m1-2. Usage Data Tables (Multiple selection allowed)
- n1. Target Audience (Bulleted list)
- o1. Related Insight
- p1. Revenue Category
- q1. Icon Type
- r1. Score
- s1. Relevance Policy Type
- t1. Relevance Score
- u1. Display Count
- v1. Selection Count
- w1. Next Display Policy
- x1. Next Display Setting Value
- y1. In-App Transition Destination
- z1. External Transition Destination
- a2. Teaser Screen Image
- b2. Story Screen Image (Max 3 images)
- c2. Next Scheduled Maintenance Date
- d2. Maintenance Reason
- e2. Remarks
- f2. Updated By

**[Ubiquitous]** The system must accept only the preset options defined in the design document for the input of items d1, h1, i1, k1, l1, m1-2, p1, q1, s1, and w1.

### 3.2. Insight Operations

**[Event-driven]** When an Admin or Manager selects "New Registration", the system must display an input form for all items.

**[Event-driven]** When an Admin or Manager saves insight information, the system must validate the input values and save them to the database.

**[Event-driven]** When an Admin or Manager selects "Edit", the system must display a form with all current values for modification.

**[Event-driven]** When an Admin or Manager selects "Delete", the system must delete the target insight.

**[State-driven]** While a user has Viewer privileges, the system must disable (hide or make inoperable) the functions for "New Registration", "Edit", "Delete", "CSV Import", and "Dropdown Management".

### 3.3. Search and List View

**[Event-driven]** When a user enters search conditions (a1, b1, c1, d1, h1, i1, j1, k1, m1-1, l1, m1-2, c2), the system must search for matching insights using partial matching for text fields and exact matching for dropdown fields.

**[Event-driven]** When a user clicks the "Search" button, the system must execute the search with current parameters.

**[Ubiquitous]** The system must display the main insight items (b1, c1, d1, h1, i1, j1, k1, c2) as a list in the search results.

**[Ubiquitous]** The system must place an "Image Display Button" and "Edit Button" on each row of the list view.

### 3.4. Detail Display and Preview

**[Event-driven]** When a user clicks on the "Insight Subject (b1)" in the list screen, the system must display all items (a1 to f2) of that insight in a separate screen (or modal).

**[Event-driven]** When a user presses the "Image Display Button" in the list screen, the system must display the "Teaser Screen Image (a2)" and "Story Screen Image (b2)" distinctly in a separate preview screen.

### 3.5. Image Upload

**[Event-driven]** When an Admin or Manager uploads an image file (PNG/JPEG), the system must save it to the uploads directory and return the URL.

**[Ubiquitous]** The system must support both URL input and file upload for images.

**[Ubiquitous]** The system must display image previews for both uploaded files and URL-entered images.

### 3.6. CSV Features

**[Event-driven]** When an Admin or Manager presses the "CSV Download" button, the system must output a CSV file containing text items (excluding images) of all registered insights.

### 3.7. Master Data Management

**[Event-driven]** When an Admin creates a new master option, the system must add it to the database and update dropdown options.

**[Event-driven]** When an Admin modifies, adds, or deletes dropdown items, the system must immediately update the options in the input forms.

**[Ubiquitous]** The system must prevent duplicate master options from being displayed.

## 4. Non-Functional Requirements

**[Ubiquitous]** The system must operate using **Bun** as the runtime environment.

**[Ubiquitous]** The system must provide a **Dockerfile** for containerization.

**[Ubiquitous]** The system UI must be displayed in Japanese.

**[Ubiquitous]** The system must use PostgreSQL as the database.

**[Ubiquitous]** The system must use JWT for authentication.
