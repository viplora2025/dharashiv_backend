
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4000/api';
let AUTH_TOKEN = null;
let APP_USER_ID = null;
let APP_USER_OBJ_ID = null; // Mongo ID
let DEPT_ID = null; // String ID
let PARENT_DEPT_OBJ_ID = null; // Mongo ID
let SUB_DEPT_ID = null;
let TALUKA_ID = null;
let VILLAGE_ID = null;
let VILLAGE_OBJ_ID = null;
let COMPLAINER_ID = null; // Mongo ID
let CUSTOM_COMPLAINT_ID = null;
let COMPLAINT_OBJ_ID = null;

// Helper to log steps
const logFile = path.join(process.cwd(), 'test_run.log');
fs.writeFileSync(logFile, "Starting Test...\n");

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
};

const step = (msg) => log(`\n[STEP] ${msg}`);
const success = (msg) => log(`[SUCCESS] ${msg}`);
const error = (msg, err) => {
    log(`[ERROR] ${msg}`);
    if (err) log(err.stack || err);
    process.exit(1);
};

// Generic Fetch Wrapper
const req = async (endpoint, method = 'GET', body = null, token = null, isMultipart = false) => {
    const headers = {};
    if (!isMultipart) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = isMultipart ? body : JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(`${method} ${endpoint} failed (${res.status}): ${JSON.stringify(data)}`);
    }
    return data;
};

const run = async () => {
    try {
        step("1. Registering App User (Volunteer)");
        // Use random phone to avoid conflict on re-runs
        const randomPhone = "9" + Math.floor(100000000 + Math.random() * 900000000);
        const userRes = await req('/appUsers/register', 'POST', {
            name: "Test Volunteer",
            phone: randomPhone,
            password: "password123",
            secretQuestion: "Pet?",
            secretAnswer: "Dog"
        });
        success(`Registered User: ${userRes.appUserId} (Phone: ${randomPhone})`);

        step("2. Logging In");
        const loginRes = await req('/appUsers/login', 'POST', {
            phone: randomPhone,
            password: "password123"
        });
        AUTH_TOKEN = loginRes.accessToken;
        APP_USER_ID = loginRes.appUserId;
        APP_USER_OBJ_ID = loginRes._id;
        success(`Logged In: ${APP_USER_ID} (Mongo: ${APP_USER_OBJ_ID})`);

        step("3. Admin Setup: Create Department (Health)");
        const deptRes = await req('/departments/create', 'POST', {
            name: { en: `Health_${Date.now()}`, mr: "आरोग्य" },
            level: "district"
        }, AUTH_TOKEN);

        // DEBUG: Check data
        if (!deptRes.data) {
            console.error("DEBUG: Dept Res has no data:", JSON.stringify(deptRes));
        }

        DEPT_ID = deptRes.data.deptId;
        PARENT_DEPT_OBJ_ID = deptRes.data._id; // ObjectId
        success(`Department Created: ${DEPT_ID}`);

        step("4. Admin Setup: Create Taluka & Village");
        const talukaName = `Lohara_${Date.now()}`;
        const talukaRes = await req('/talukas/create', 'POST', {
            name: { en: talukaName, mr: "लोहारा" }
        }, AUTH_TOKEN);
        TALUKA_ID = talukaRes.data.talukaId;

        const villageRes = await req('/villages/create', 'POST', {
            name: { en: `Makani_${Date.now()}`, mr: "माकणी" },
            talukaId: TALUKA_ID
        }, AUTH_TOKEN);
        VILLAGE_ID = villageRes.data.villageId;
        VILLAGE_OBJ_ID = villageRes.data._id;
        success(`Village Created: ${VILLAGE_ID} in Taluka ${TALUKA_ID}`);

        step("5. Admin Setup: Create SubDepartment (PHC)");
        const subDeptRes = await req('/sub-departments/create', 'POST', {
            parentDeptId: DEPT_ID, // API expects String ID
            name: { en: "PHC Makani", mr: "प्रा.आ. केंद्र" },
            level: "village"
        }, AUTH_TOKEN);
        if (!subDeptRes.data) log("SubDept Error: " + JSON.stringify(subDeptRes));
        SUB_DEPT_ID = subDeptRes.data.subDeptId;
        success(`SubDepartment Created: ${SUB_DEPT_ID}`);

        step("6. Smart Routing: Map Village to SubDepartment");
        await req('/mappings/create', 'POST', {
            subDeptId: SUB_DEPT_ID,
            villageId: VILLAGE_ID,
            level: "primary"
        }, AUTH_TOKEN);
        success("Mapping Created (Village <-> SubDept)");

        step("7. Search Mapping (Verify Smart Routing)");
        const searchRes = await req(`/mappings/search?villageId=${VILLAGE_ID}&deptId=${DEPT_ID}`, 'GET');
        if (searchRes.data.subDeptId !== SUB_DEPT_ID) throw new Error("Smart Routing return wrong SubDept");
        success(`Smart Routing Found Correct Office: ${searchRes.data.name.en}`);

        step("8. Create Complainer (Citizen)");
        const compRes = await req('/complainers', 'POST', {
            name: "Ramesh Pawar",
            phone: "8888888888",
            taluka: "Lohara",
            village: "Makani",
            addedBy: APP_USER_OBJ_ID // Handled by controller auto-fill from token OR manual passed
        }, AUTH_TOKEN);

        COMPLAINER_ID = compRes.complainer._id;
        success(`Complainer Created: ${compRes.complainer.name}`);

        step("9. File Complaint (Multipart)");
        const formData = new FormData();
        // Since we auto-filled filedBy in controller, we can skip or send it.
        // But since we can send it to be explicit:
        // formData.append("filedBy", APP_USER_OBJ_ID); 

        formData.append("complainer", COMPLAINER_ID);
        formData.append("village", VILLAGE_OBJ_ID);
        formData.append("department", PARENT_DEPT_OBJ_ID);
        formData.append("subDepartment", subDeptRes.data._id); // Needed ObjectId

        formData.append("subject", "No Water");
        formData.append("description", "Since 2 days.");

        // Dummy file
        const blob = new Blob(["Hello World"], { type: 'image/png' });
        formData.append("media", blob, "test.png");

        const complaintRes = await fetch(`${BASE_URL}/complaints`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
            body: formData
        }).then(r => r.json());

        if (!complaintRes.complaint) {
            throw new Error("Complaint Failed: " + JSON.stringify(complaintRes));
        }

        CUSTOM_COMPLAINT_ID = complaintRes.complaint.complaintId;
        COMPLAINT_OBJ_ID = complaintRes.complaint._id;
        success(`Complaint Filed: ${CUSTOM_COMPLAINT_ID}`);

        step("10. Public Track Complaint");
        const trackRes = await req(`/complaints/track/${CUSTOM_COMPLAINT_ID}`, 'GET');
        if (trackRes.status !== 'open') throw new Error("Status mismatch");
        success(`Tracking working. Status: ${trackRes.status}`);

        step("11. Update Status");
        const updateRes = await req(`/complaints/${COMPLAINT_OBJ_ID}/status`, 'PUT', {
            status: "in-progress",
            message: "Technician assigned"
        }, AUTH_TOKEN);
        if (updateRes.complaint.status !== 'in-progress') throw new Error("Update failed");
        success("Status Updated to In-Progress");

        step("12. Check History");
        const historyRes = await req(`/complaints/${COMPLAINT_OBJ_ID}`, 'GET', null, AUTH_TOKEN);
        const history = historyRes.history;
        if (history.length < 2) throw new Error("History not updated");
        success(`History Verified: ${history.length} entries`);

        console.log("\n---------------------------------------------------");
        console.log("       ALL TESTS PASSED SUCCESSFULLY 🚀");
        console.log("---------------------------------------------------");

    } catch (e) {
        error("Test Logic Error", e);
    }
};

run();
