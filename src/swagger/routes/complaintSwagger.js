/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Public & Private Complaint Management
 */

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: File a new Complaint (with Media)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               filedBy:
 *                 type: string
 *               complainer:
 *                 type: string
 *               village:
 *                 type: string
 *               department:
 *                 type: string
 *               subDepartment:
 *                 type: string
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *                 example: "Since 3 days"
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Complaint filed successfully"
 *               complaint:
 *                 complaintId: "CMP-0001-0001-001"
 *                 status: "open"
 *                 subject: "No Water"
 *   get:
 *     summary: Get all Complaints (Filtered)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: {type: string}
 *       - in: query
 *         name: department
 *         schema: {type: string}
 *       - in: query
 *         name: taluka
 *         schema: {type: string}
 *     responses:
 *       200:
 *         description: List of complaints
 */

/**
 * @swagger
 * /api/complaints/track/{complaintId}:
 *   get:
 *     summary: Public Complaint Tracking
 *     description: Search using the Custom Complaint ID (e.g. CMP-A1B2...)
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public complaint details found
 *         content:
 *           application/json:
 *             example:
 *               complaintId: "CMP-0001-0001-001"
 *               status: "open"
 *               subject: "No Water"
 *               history: []
 *       404:
 *         description: Complaint not found
 */

/**
 * @swagger
 * /api/complaints/user/{appUserId}:
 *   get:
 *     summary: Get Complaints filed by AppUser
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of complaints
 */

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get Complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200:
 *         description: Complaint details
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/complaints/{id}/status:
 *   put:
 *     summary: Update Complaint Status
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: {type: string}
 *               message: {type: string}
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status or missing fields
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
