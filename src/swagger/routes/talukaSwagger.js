/**
 * @swagger
 * tags:
 *   name: Talukas
 *   description: Administrative Talukas (Block Level)
 */

/**
 * @swagger
 * /api/talukas/create:
 *   post:
 *     summary: Create a new Taluka
 *     tags: [Talukas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   en: {type: string}
 *                   mr: {type: string}
 *                 example:
 *                   en: "Lohara"
 *                   mr: "लोहारा"
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Bad Request (Missing fields)
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/talukas/get-all:
 *   get:
 *     summary: Get all Talukas
 *     tags: [Talukas]
 *     responses:
 *       200:
 *         description: List of talukas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: {$ref: '#/components/schemas/Taluka'}
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/talukas/update/{talukaId}:
 *   put:
 *     summary: Update Taluka
 *     tags: [Talukas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: talukaId
 *         required: true
 *         schema: {type: string}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   en: {type: string}
 *                   mr: {type: string}
 *                 example:
 *                   en: "Tuljapur"
 *                   mr: "तुळजापूर"
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Taluka not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/talukas/delete/{talukaId}:
 *   delete:
 *     summary: Delete Taluka
 *     tags: [Talukas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: talukaId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Taluka not found
 *       500:
 *         description: Internal Server Error
 */
