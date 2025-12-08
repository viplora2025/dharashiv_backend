/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - deptId
 *         - name
 *         - level
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         deptId:
 *           type: string
 *           description: Custom Department ID (e.g. "DEP001")
 *         name:
 *           type: object
 *           properties:
 *             en:
 *               type: string
 *             mr:
 *               type: string
 *           description: Localized name
 *         level:
 *           type: string
 *           enum: [taluka, cluster, village, town, district]
 *           description: Administrative level
 *       example:
 *         deptId: "DEP001"
 *         name:
 *           en: "Police"
 *           mr: "पोलीस"
 *         level: "district"
 */
