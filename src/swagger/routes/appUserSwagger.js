/**
 * @swagger
 * tags:
 *   name: App Users
 *   description: Public user registration & login system
 */

/**
 * @swagger
 * /api/appUsers/register:
 *   post:
 *     summary: Register a new public user
 *     tags: [App Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - password
 *               - secretQuestion
 *               - secretAnswer
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Amit Patil"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "amit@123"
 *               secretQuestion:
 *                 type: string
 *                 example: "What is your pet name?"
 *               secretAnswer:
 *                 type: string
 *                 example: "Tommy"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User registered"
 *               appUserId: "A0000001"
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Phone already exists
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /api/appUsers/login:
 *   post:
 *     summary: Login user using phone & password
 *     tags: [App Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "amit@123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               message: "Login successful"
 *               userId: "A0000001"
 *               accessToken: "jwt..."
 *               refreshToken: "jwt..."
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 */


/**
 * @swagger
 * /api/appUsers/forgot/question:
 *   post:
 *     summary: Get secret question by phone number
 *     tags: [App Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: Secret question fetched
 *         content:
 *           application/json:
 *             example:
 *               question: "What is your pet name?"
 *       400:
 *          description: Phone number required
 *       404:
 *         description: User not found
 */


/**
 * @swagger
 * /api/appUsers/forgot/reset:
 *   post:
 *     summary: Reset password using secret answer
 *     tags: [App Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - answer
 *               - newPassword
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               answer:
 *                 type: string
 *                 example: "Tommy"
 *               newPassword:
 *                 type: string
 *                 example: "newPass123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password changed successfully"
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Wrong answer
 *       404:
 *         description: User not found
 */
