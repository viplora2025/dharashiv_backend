/**
 * @swagger
 * tags:
 *   name: Villages
 *   description: Village Management
 */

/**
 * @swagger
 * /api/villages/create:
 *   post:
 *     summary: Create Village
 *     tags: [Villages]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: {$ref: '#/components/schemas/Village'}
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             example:
 *               message: "Village created"
 *               village:
 *                 name: {en: "Makani", mr: "माकणी"}
 *                 villageId: "VLG001"
 *                 talukaId: "TLK001"
 *       400:
 *         description: Missing fields or TalukaId
 *       404:
 *         description: Taluka not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/villages/all:
 *   get:
 *     summary: Get All Villages
 *     tags: [Villages]
 *     responses:
 *       200: {description: List of villages}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/villages/taluka/{talukaId}:
 *   get:
 *     summary: Get Villages by Taluka
 *     tags: [Villages]
 *     parameters:
 *       - in: path
 *         name: talukaId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: List of villages}
 *       404: {description: Taluka not found}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/villages/update/{villageId}:
 *   put:
 *     summary: Update Village
 *     tags: [Villages]
 *     parameters:
 *       - in: path
 *         name: villageId
 *         required: true
 *         schema: {type: string}
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: {$ref: '#/components/schemas/Village'}
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             example:
 *               message: "Village updated"
 *               village:
 *                 name: {en: "Sastur", mr: "सास्तूर"}
 *       400:
 *         description: Missing names
 *       404:
 *         description: Village not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/villages/delete/{villageId}:
 *   delete:
 *     summary: Delete Village
 *     tags: [Villages]
 *     parameters:
 *       - in: path
 *         name: villageId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Deleted}
 *       404: {description: Village not found}
 *       500: {description: Server error}
 */
