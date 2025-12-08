/**
 * @swagger
 * tags:
 *   name: Complainers
 *   description: Management of Citizens/Complainers
 */

/**
 * @swagger
 * /api/complainers:
 *   post:
 *     summary: Create a new Complainer
 *     tags: [Complainers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Complainer'
  *     responses:
 *       201:
 *         description: Complainer created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Complainer created successfully"
 *               complainer:
 *                 name: "Ramesh Pawar"
 *                 phone: "8888888888"
 *                 taluka: "Lohara"
 *                 village: "Makani"
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all Complainers
 *     tags: [Complainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complainers
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/complainers/by-user/{userId}:
 *   get:
 *     summary: Get Complainers added by a specific AppUser
 *     tags: [Complainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of complainers
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/complainers/{id}:
 *   get:
 *     summary: Get Complainer details by ID
 *     tags: [Complainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complainer details found
 *       404:
 *         description: Complainer not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update Complainer details
 *     tags: [Complainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Complainer'
 *     responses:
 *       200:
 *         description: Complainer updated successfully
 *       404:
 *         description: Complainer not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a Complainer
 *     tags: [Complainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complainer deleted successfully
 *       404:
 *         description: Complainer not found
 *       500:
 *         description: Server error
 */
