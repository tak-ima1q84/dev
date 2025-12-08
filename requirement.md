
### 1. System Overview
The system is a Data Catalog Web Application that manages Data Table definitions and Data Column definitions as pairs.

### 2. Functional Requirements (EARS Notation)

#### 2.1 Data Management
*   **[Ubiquitous]** The system shall manage Data Column definitions associated with a single Data Table definition.
*   **[Ubiquitous]** The system shall allow input of up to 500 Data Column definitions per Data Table definition.
*   **[While]** While the user has the "Editor" role, the system shall allow creating, updating, deleting, and viewing Data Tables and Data Columns.
*   **[While]** While the user has the "Viewer" role, the system shall allow only viewing of Data Tables and Data Columns, restricting access to create, update, and delete functions.

#### 2.2 Search & View
*   **[When]** When the user inputs a search keyword, the system shall perform a partial match search on "Table Physical Name", "Table Logical Name", "Table Description", "Column Physical Name", and "Column Logical Name", and display the results in a list.
*   **[When]** When the user selects a specific table from the list and clicks the view button, the system shall display the Data Table attributes and Data Column attributes in a tabular format.

#### 2.3 Output
*   **[When]** When the user selects a specific table from the list and executes the download, the system shall generate and download a CSV file containing the target Data Table attributes and Data Column attributes.

#### 2.4 Non-Functional & Environment
*   **[Ubiquitous]** The system shall operate on Local Docker environments and AWS Lightsail.