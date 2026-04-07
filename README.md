<div align="center">
  <h1>❖ Bitrix24 Universal Payment Calculator V2 ❖</h1>
  <p><i>A comprehensive, professional, and automated payment planning tool for Real Estate Management</i></p>
  
  <img src="https://img.shields.io/badge/Frontend-Vanilla_JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

<hr />

## ⧉ Project Overview

The **Bitrix24 Calculator V2** is a highly specialized web application designed specifically for real estate professionals, sales representatives, and property management teams. The primary goal of this tool is to remove the manual effort involved in calculating property prices, designing custom installment plans, and managing payment schedules. 

By integrating directly with the **Bitrix24 CRM**, the calculator acts as an intelligent assistant that links real-time property inventory with client profiles. This ensures that every generated payment plan is accurate, professionally formatted, and securely stored within your existing CRM database without any duplicate data entry. The system is designed to be completely usable by non-technical staff, requiring zero coding knowledge to operate on a daily basis.

---

## ⧉ Comprehensive Feature List

### ✦ Automated Data Retrieval
- **Live Inventory Sync:** Automatically fetches the latest Project Names, Inventory Units, Property Types, and Floor Details directly from Bitrix24.
- **Client Profile Linking:** Directly connects the generated plan to the selected client's profile in the CRM database.

### ✦ Intelligent Payment Calculation
- **Dual Payment Modes:** Users can freely select between **Full Payment** (upfront) or **Installment Plans** (spread over time).
- **Flexible Down Payments:** Allows setting exact down payment percentages or fixed initial amounts.
- **Possession Payments:** Incorporates dedicated logic to calculate amounts due upon handling over possession of the property.
- **Custom Plan Durations:** Spreads the remaining balance over standard durations such as 6 months, 1 year, 2 years, or 3 years.
- **Balloon Payments:** Allows the addition of specific large sum payments at custom intervals. The system will automatically restructure and lower the regular monthly installment amounts to account for these large payments.

### ✦ Export & Communication
- **Professional PDF Generation:** Instantly converts the on-screen summary table into a clean, corporate-styled PDF document. This PDF includes all payment dates, amounts, and project details.
- **Direct WhatsApp Sharing:** Formats the final payment plan into a clean text summary and opens a pre-formatted WhatsApp chat window to instantly send the details to the client's phone.
- **CRM Document Attachment:** With a single button click, the system securely uploads the generated PDF straight to the client's "Lead" folder inside Bitrix24, keeping your records perfectly organized.

---

## ⧉ Step-by-Step User Workflow

This application is built for ease of use. Here is how a typical sales agent would use the platform during a consultation with a client:

1. **Information Gathering:** The agent selects the 'Project Name' and the specific 'Inventory Unit' from the drop-down menus. The system automatically reads the database and fills in the pricing, total area, and client details.
2. **Payment Structuring:** The agent selects 'Installment Plan'. They adjust the 'Down Payment' slider (e.g., to 20%) and the 'On Possession Amount' (e.g., 10%).
3. **Advanced Adjustments:** If the client wants to pay a little extra at certain times of the year, the agent clicks "Add Balloon Payment" and inputs the amount and the specific month.
4. **Instant Review:** The right-hand dashboard panel instantly updates as the user types, displaying the new monthly installment amount and generating a complete schedule for every single month.
5. **Client Delivery:** 
   - The agent clicks **Download PDF** to keep a local printable copy.
   - The agent clicks **Send Through WhatsApp** to forward a quick text snapshot.
   - The agent clicks **Attach to Lead** to safely store the finalized record in the company CRM.

---

## ⧉ Detailed Technical Architecture

To ensure the system is fast, secure, and easy to maintain, it is divided into two distinct components: The **Frontend** (Client-Side) and the **Backend** (Server-Side).

### 1. Frontend (The User Interface)
This is the visual dashboard that the user interacts with in their web browser. It is designed to be lightweight and extremely fast.
- **HTML5:** Provides the structural foundation of the calculator interface.
- **Tailwind CSS:** A beautiful, utility-based styling framework that ensures the dashboard looks modern, corporate, and works perfectly on both large computer monitors and mobile mobile screens.
- **Vanilla JavaScript:** Powers all the live calculations, meaning the numbers update instantly as you type without ever needing to reload the web page.
- **jsPDF & html2canvas:** External libraries specifically utilized to draw and 'paint' the on-screen tables into a downloadable document format.

### 2. Backend (The Data Server)
This is the invisible engine running on a server. It manages secure data transfers and acts as a central protective layer between the calculator and the Bitrix24 CRM.
- **Node.js & Express.js:** A robust web server framework that constantly listens for and handles incoming requests from the frontend dashboard.
- **TypeScript:** A strict, professional version of JavaScript used here to catch errors before the code even runs, ensuring maximum server stability.
- **@bitrix24/b24jssdk:** The official communication library that allows our server to read from and write to the Bitrix24 workspace securely.

---

## ⧉ Complete Project Structure & Folder Definitions

Below is a microscopic look inside the project folders to help developers, and non-technical managers alike, understand exactly where everything lives and what everything does.

```text
Bitrix24-Calculator-V2/
│
├── Frontend/                           [ Everything the user sees and clicks ]
│   │
│   ├── index.html                      # The master webpage. Contains all layout elements like buttons, dropdowns, and tables.
│   ├── style.css                       # Extra design styling for specific animations and custom brand colors.
│   ├── main.js                         # The central nervous system of the interface. It triggers different scripts when buttons are clicked.
│   │
│   └── scripts/                        [ A folder containing highly specialized logic files ]
│       ├── Bitrix24HelperFunctions/    # Scripts to fetch Project Names and Units from the CRM.
│       ├── CreateTableOfInstallments/  # Mathematics script: Divides the remaining balance by months and draws the table.
│       ├── PopulateFilters/            # Fills out the dropdown options (like '6 months', '1 year') on the screen as soon as it loads.
│       ├── attachFileToLead/           # Communicates with the backend server to upload the PDF into a CRM Lead Profile.
│       ├── ballonPayment/              # Specialized mathematics for subtracting large yearly payments from the monthly total.
│       ├── changeFields.js/            # Auto-fills the price and area text boxes when a specific property is selected.
│       ├── changeVisibiltyOfFeilds/    # Intelligently hides the installment options if the user selects "Full Payment" to avoid clutter.
│       ├── generatePDF/                # Translates the HTML table into a beautiful, printable PDF file.
│       └── sendThroughWhatsapp/        # Formats the final financial numbers into a clean text layout and opens WhatsApp Web.
│
├── Backend/                            [ The secure server processing background tasks ]
│   │
│   ├── app.ts                          # The server starter file. It turns on the server and listens for requests.
│   ├── route.ts                        # The map of URLs (endpoints). Tells the server what to do when the frontend asks a question.
│   ├── tsconfig.json                   # Rules for the TypeScript engine (ensures the code is written strictly and securely).
│   ├── package.json                    # A list of external code libraries the server needs to function.
│   │
│   ├── Auth/                           # The security gatekeeper. Proves to Bitrix24 that we are allowed to access the data.
│   ├── Controllers/                    # The business logic. If a request comes in, these files decide how to process the numbers or files.
│   └── Utils/                          # Helper files, like loggers that record any errors into a text file for debugging.
│
└── package.json                        # The overarching instruction manual for setting up the whole project workspace.
```

---

## ⧉ Setup and Installation Guide

Follow these simple steps carefully to install and run this calculator environment on a computer for testing, observation, or further development.

### Prerequisites
Before starting, ensure you have installed:
- **Git** (To download the code repository).
- **Node.js** (Version 18+ recommended) to host the server environment.

### Step 1: Download the Project
Open your computer's terminal (or command prompt) and type:
```bash
git clone https://github.com/iAmHammad261/Bitrix24-Calculator-V2
cd Bitrix24-Calculator-V2
```

### Step 2: Configure & Start the Backend Server
The server manages the data connection to Bitrix24 and must be running first.
1. Move your terminal into the backend folder:
   ```bash
   cd Backend
   ```
2. Download and install all the required background packages:
   ```bash
   npm install
   ```
3. Start the server (using Development Mode so it automatically updates if code changes are made):
   ```bash
   npm run dev
   ```
   > **Important Note:** You will see a console message stating `Server is running on port 3000`. Keep this terminal window open in the background.

### Step 3: Run the Frontend Interface
Since the frontend uses standard browser technology, it is incredibly easy to launch.
1. Open a new terminal window or tab.
2. Ensure you are completely back in the main project folder, then navigate into `/Frontend`:
   ```bash
   cd Frontend
   ```
3. Serve the HTML file securely using a lightweight web server (like the `serve` command):
   ```bash
   npx serve .
   ```
4. Finally, open the local network link provided by the terminal (for example, `http://localhost:3000` or `http://localhost:5500`) in Google Chrome, Safari, or Microsoft Edge.

---

## ⧉ Developer & Author Information

**Designed & Developed by:** Waleed-Ahmad-dev / Shadow Scripter  

Engineered with a heavy focus on stability, financial precision, and delivering a seamless operational experience. For further technical support, feature expansions, or deployment assistance, please refer to the primary software repository or contact the internal IT development team.

<br />
<div align="center">
  <p><i>Building Better Business Solutions, One Calculation At A Time.</i></p>
</div>
